import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

const Dashboard = () => {
    const [user, setUser] = useState({ fullName: '', email: '' });
    const [jobs, setJobs] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newJob, setNewJob] = useState({ companyName: '', role: '', status: 'PENDING' });
    const [dragOverCol, setDragOverCol] = useState(null);
    const [draggingId, setDraggingId] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const dragItem = useRef(null);

    const navigate = useNavigate();
    const columns = ['PENDING', 'INTERVIEWING', 'ACCEPTED', 'REJECTED'];

    const colColors = {
        PENDING:      { bg: '#2a2d35', accent: '#5c6bc0', badge: '#3d4270', text: '#9fa8da' },
        INTERVIEWING: { bg: '#2a2d35', accent: '#f59e0b', badge: '#3d3520', text: '#fbbf24' },
        ACCEPTED:     { bg: '#2a2d35', accent: '#10b981', badge: '#1a3530', text: '#34d399' },
        REJECTED:     { bg: '#2a2d35', accent: '#ef4444', badge: '#3a2020', text: '#f87171' },
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    const getAuthData = () => {
        const token = localStorage.getItem('token');
        if (!token || token === 'undefined') return { token: null, userId: null };
        try {
            const decoded = jwtDecode(token);
            return { token, userId: decoded.userId };
        } catch (e) {
            return { token: null, userId: null };
        }
    };

    useEffect(() => {
        const { token, userId } = getAuthData();
        if (!token || token.split('.').length !== 3) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
        }

        const loadDashboardData = async () => {
            try {
                const decoded = jwtDecode(token);
                setUser({ 
                    fullName: decoded.fullName || decoded.name || 'User', 
                    email: decoded.sub || decoded.email 
                });

                const [jobsRes, resumeRes] = await Promise.all([
                    api.get(`/api/v1/applications/user/${userId}`), 
                    api.get(`/api/v1/resumes/user/${userId}`)      
                ]);
                setJobs(jobsRes.data);
                setResumes(resumeRes.data);
            } catch (error) {
                if (error.response?.status === 401) navigate('/login');
                console.error("Data Load Error:", error);
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, [navigate]);

    const handleDragStart = (e, job) => {
        dragItem.current = job;
        setDraggingId(job.id);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => { e.target.style.opacity = '0.4'; }, 0);
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggingId(null);
        setDragOverCol(null);
        dragItem.current = null;
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        setDragOverCol(null);
        const job = dragItem.current;
        if (!job || job.status === newStatus) return;

        // Optimistic UI Update
        const oldJobs = [...jobs];
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j));

        try {
            await api.put(`/api/v1/applications/${job.id}/status`, { status: newStatus });
            showToast(`Moved to ${newStatus}`);
        } catch (err) {
            setJobs(oldJobs);
            showToast('Failed to update status', 'error');
        }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        const { userId } = getAuthData();
        try {
            const res = await api.post(`/api/v1/applications/user/${userId}`, newJob);
            setJobs([...jobs, res.data]);
            setNewJob({ companyName: '', role: '', status: 'PENDING' });
            showToast('Application added!');
        } catch (err) {
            showToast('Error adding application', 'error');
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Delete this application?')) return;
        try {
            await api.delete(`/api/v1/applications/${jobId}`);
            setJobs(jobs.filter(job => job.id !== jobId));
            showToast('Deleted');
        } catch (err) {
            showToast('Delete failed', 'error');
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const { userId } = getAuthData();
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const res = await api.post(`/api/v1/resumes/user/${userId}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResumes([...resumes, res.data]);
            showToast('Resume uploaded!');
        } catch (err) {
            showToast('Upload failed', 'error');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    if (loading) return <div style={centerStyle}>Loading...</div>;

    return (
        <div style={mainContainerStyle}>
            <div style={centeringWrapper}>
                
                <header style={headerStyle}>
                    <div>
                        <h1 style={welcomeTextStyle}>Welcome, {user.fullName}</h1>
                        <p style={{ color: '#7a7e85', fontSize: '0.9rem', margin: 0 }}>{user.email}</p>
                    </div>
                    <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>
                </header>

                <div style={mainLayout}>
                    
                    <section style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>Job Applications</h2>
                            <span style={hintBadge}>✦ drag cards to update status</span>
                        </div>

                        <div style={kanbanGrid}>
                            {columns.map(col => {
                                const { accent, badge, text } = colColors[col];
                                const colJobs = jobs.filter(j => j.status === col);
                                const isOver = dragOverCol === col;
                                return (
                                    <div
                                        key={col}
                                        style={{
                                            ...columnStyle,
                                            borderColor: isOver ? accent : '#323232',
                                            background: isOver ? `${accent}18` : '#2b2d30',
                                        }}
                                        onDragOver={(e) => { e.preventDefault(); setDragOverCol(col); }}
                                        onDragLeave={() => setDragOverCol(null)}
                                        onDrop={(e) => handleDrop(e, col)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '10px', borderBottom: `1px solid ${accent}40` }}>
                                            <span style={{ ...colBadge, background: badge, color: text }}>{col}</span>
                                            <span style={{ fontSize: '0.7rem', color: '#5a5d63', fontWeight: 600 }}>{colJobs.length}</span>
                                        </div>

                                        {colJobs.map(job => (
                                            <div
                                                key={job.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, job)}
                                                onDragEnd={handleDragEnd}
                                                style={{
                                                    ...cardStyle,
                                                    borderLeftColor: accent,
                                                    opacity: draggingId === job.id ? 0.4 : 1,
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#dfe1e5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.companyName}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#7a7e85', marginTop: '2px' }}>{job.role}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={dragHandle}>⠿</span>
                                                        <button onClick={() => handleDeleteJob(job.id)} style={deleteBtnStyle}>🗑️</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {colJobs.length === 0 && !isOver && <div style={emptyColStyle}>No applications</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <aside style={sidebarStyle}>
                        <div style={sideCard}>
                            <h3 style={sideCardTitle}>Add Application</h3>
                            <form onSubmit={handleCreateJob}>
                                <input style={inputStyle} placeholder="Company" value={newJob.companyName} onChange={e => setNewJob({ ...newJob, companyName: e.target.value })} required />
                                <input style={inputStyle} placeholder="Role" value={newJob.role} onChange={e => setNewJob({ ...newJob, role: e.target.value })} required />
                                <button style={btnStyle} type="submit">Add</button>
                            </form>
                        </div>

                        <div style={sideCard}>
                            <h3 style={sideCardTitle}>My Resumes</h3>
                            <label style={uploadLabelStyle}>
                                + Upload PDF
                                <input type="file" hidden accept=".pdf" onChange={handleResumeUpload} />
                            </label>
                            <ul style={{ padding: 0, listStyle: 'none', marginTop: '15px' }}>
                                {resumes.map(r => (
                                    <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #323232' }}>
                                        <span style={{ fontSize: '0.85rem' }}>{r.fileName}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                </div>

                {toast.show && (
                    <div style={{
                        ...toastStyle,
                        backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981',
                    }}>
                        {toast.type === 'error' ? '⚠️ ' : '✅ '} {toast.message}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Styles (Unchanged) ---
const mainContainerStyle = { backgroundColor: '#1e1f22', color: '#bcbec4', minHeight: '100vh', width: '100vw', fontFamily: 'Inter, system-ui', display: 'flex', flexDirection: 'column' };
const centeringWrapper = { width: '100%', maxWidth: '1300px', margin: '0 auto', padding: '40px 20px', boxSizing: 'border-box' };
const mainLayout = { display: 'flex', gap: '30px', justifyContent: 'center', alignItems: 'flex-start' };
const kanbanGrid = { display: 'flex', gap: '15px', flex: 1 };
const sidebarStyle = { width: '320px', display: 'flex', flexDirection: 'column', gap: '20px', flexShrink: 0 };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #323232', paddingBottom: '20px', marginBottom: '30px' };
const welcomeTextStyle = { color: '#dfe1e5', margin: 0, fontSize: '1.8rem', fontWeight: 'bold' };
const columnStyle = { flex: 1, borderRadius: '10px', padding: '15px', minHeight: '500px', border: '2px solid #323232', minWidth: '180px' };
const colBadge = { fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' };
const cardStyle = { backgroundColor: '#3c3f41', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #4b4d4f', borderLeft: '3px solid', cursor: 'grab' };
const dragHandle = { color: '#5a5d63', cursor: 'grab' };
const emptyColStyle = { textAlign: 'center', color: '#4a4d52', fontSize: '0.75rem', marginTop: '30px' };
const hintBadge = { fontSize: '0.7rem', color: '#5a5d63', background: '#2b2d30', border: '1px solid #323232', borderRadius: '99px', padding: '3px 10px' };
const sideCard = { backgroundColor: '#2b2d30', padding: '20px', borderRadius: '8px', border: '1px solid #323232' };
const sideCardTitle = { marginTop: 0, marginBottom: '15px', color: '#dfe1e5' };
const inputStyle = { width: '100%', marginBottom: '10px', padding: '10px', backgroundColor: '#1e1f22', border: '1px solid #4b4d4f', borderRadius: '4px', color: '#bcbec4' };
const btnStyle = { width: '100%', padding: '10px', backgroundColor: '#3574f0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const uploadLabelStyle = { display: 'block', textAlign: 'center', padding: '10px', backgroundColor: '#3e4144', borderRadius: '4px', cursor: 'pointer', border: '1px dashed #4b4d4f' };
const logoutBtnStyle = { padding: '8px 16px', backgroundColor: 'transparent', color: '#f75f5f', border: '1px solid #f75f5f', borderRadius: '4px', cursor: 'pointer' };
const deleteBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', color: '#f75f5f', opacity: '0.7' };
const toastStyle = { position: 'fixed', bottom: '30px', right: '30px', padding: '12px 24px', borderRadius: '8px', color: 'white', fontWeight: '600', zIndex: 1000 };
const centerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1e1f22', color: 'white' };

export default Dashboard;