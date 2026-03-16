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
    const dragItem = useRef(null);

    const navigate = useNavigate();
    const columns = ['PENDING', 'INTERVIEWING', 'ACCEPTED', 'REJECTED'];

    const colColors = {
        PENDING:      { bg: '#2a2d35', accent: '#5c6bc0', badge: '#3d4270', text: '#9fa8da' },
        INTERVIEWING: { bg: '#2a2d35', accent: '#f59e0b', badge: '#3d3520', text: '#fbbf24' },
        ACCEPTED:     { bg: '#2a2d35', accent: '#10b981', badge: '#1a3530', text: '#34d399' },
        REJECTED:     { bg: '#2a2d35', accent: '#ef4444', badge: '#3a2020', text: '#f87171' },
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
                setUser({ fullName: decoded.fullName || 'User', email: decoded.sub || decoded.email });
                const [jobsRes, resumeRes] = await Promise.all([
                    api.get(`/v1/applications/user/${userId}`),
                    api.get(`/v1/resumes/user/${userId}`)
                ]);
                setJobs(jobsRes.data);
                setResumes(resumeRes.data);
            } catch (error) {
                if (error.response?.status === 401) navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, [navigate]);

    // --- Drag and Drop Handlers ---
    const handleDragStart = (e, job) => {
        dragItem.current = job;
        setDraggingId(job.id);
        e.dataTransfer.effectAllowed = 'move';
        // Ghost image delay so the card renders before drag starts
        setTimeout(() => {
            e.target.style.opacity = '0.4';
        }, 0);
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggingId(null);
        setDragOverCol(null);
        dragItem.current = null;
    };

    const handleDragOver = (e, col) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverCol(col);
    };

    const handleDragLeave = () => {
        setDragOverCol(null);
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        setDragOverCol(null);
        const job = dragItem.current;
        if (!job || job.status === newStatus) return;
        // Optimistic UI update
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
        try {
            await api.put(`v1/applications/${job.id}/status`, { status: newStatus });
        } catch (err) {
            // Rollback on failure
            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: job.status } : j));
            alert('Failed to move application. Please try again.');
        }
    };

    // --- Job Application Handlers ---
    const handleCreateJob = async (e) => {
        e.preventDefault();
        const { userId } = getAuthData();
        try {
            const res = await api.post(`/v1/applications/user/${userId}`, newJob);
            setJobs([...jobs, res.data]);
            setNewJob({ companyName: '', role: '', status: 'PENDING' });
        } catch (err) {
            alert('Error adding application.');
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Delete this application?')) return;
        try {
            await api.delete(`/v1/applications/${jobId}`);
            setJobs(jobs.filter(job => job.id !== jobId));
        } catch (err) {
            alert('Delete failed.');
        }
    };

    // --- Resume Handlers ---
    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const { userId, token } = getAuthData();
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await api.post(`/v1/resumes/user/${userId}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
            });
            setResumes([...resumes, res.data]);
        } catch (err) {
            alert('Upload failed.');
        }
    };

    const handleDeleteResume = async (resumeId) => {
        if (!window.confirm('Delete this resume?')) return;
        try {
            await api.delete(`/v1/resumes/${resumeId}`);
            setResumes(resumes.filter(r => r.id !== resumeId));
        } catch (err) {
            alert('Failed to delete resume.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) return <div style={centerStyle}>Loading...</div>;

    return (
        <div style={mainContainerStyle}>
            <header style={headerStyle}>
                <div>
                    <h1 style={welcomeTextStyle}>Welcome, {user.fullName}</h1>
                    <p style={{ color: '#7a7e85', fontSize: '0.9rem', margin: 0 }}>{user.email}</p>
                </div>
                <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>
            </header>

            <div style={mainLayout}>
                <section style={{ flex: 3 }}>
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
                                        transition: 'border-color 0.15s, background 0.15s',
                                    }}
                                    onDragOver={(e) => handleDragOver(e, col)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, col)}
                                >
                                    {/* Column header */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '10px', borderBottom: `1px solid ${accent}40` }}>
                                        <span style={{ ...colBadge, background: badge, color: text }}>{col}</span>
                                        <span style={{ fontSize: '0.7rem', color: '#5a5d63', fontWeight: 600 }}>{colJobs.length}</span>
                                    </div>

                                    {/* Drop zone hint */}
                                    {isOver && (
                                        <div style={{ ...dropZoneHint, borderColor: accent, color: accent }}>
                                            Drop here
                                        </div>
                                    )}

                                    {/* Cards */}
                                    {colJobs.map(job => (
                                        <div
                                            key={job.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, job)}
                                            onDragEnd={handleDragEnd}
                                            style={{
                                                ...cardStyle,
                                                cursor: 'grab',
                                                borderLeftColor: accent,
                                                opacity: draggingId === job.id ? 0.4 : 1,
                                                transform: draggingId === job.id ? 'scale(0.97)' : 'scale(1)',
                                                transition: 'opacity 0.15s, transform 0.15s, box-shadow 0.15s',
                                            }}
                                            onMouseEnter={e => { if (draggingId !== job.id) e.currentTarget.style.boxShadow = `0 4px 16px ${accent}30`; }}
                                            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#dfe1e5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.companyName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#7a7e85', marginTop: '2px' }}>{job.role}</div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px' }}>
                                                    <span style={dragHandle} title="Drag to move">⠿</span>
                                                    <button onClick={() => handleDeleteJob(job.id)} style={deleteBtnStyle} title="Delete">🗑️</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Empty state */}
                                    {colJobs.length === 0 && !isOver && (
                                        <div style={emptyColStyle}>No applications</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                <aside style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                        <ul style={resumeListStyle}>
                            {resumes.map(r => (
                                <li key={r.id} style={resumeItemStyle}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1 }}>
                                        <span style={{ fontSize: '1.2rem' }}>📄</span>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.85rem' }}>{r.fileName}</span>
                                            <small style={{ color: '#7a7e85' }}>{r.versionTag}</small>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteResume(r.id)} style={{ ...deleteBtnStyle, fontSize: '1rem' }}>🗑️</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
};

const mainContainerStyle = { padding: '30px', backgroundColor: '#1e1f22', color: '#bcbec4', minHeight: '100vh', fontFamily: 'Inter, system-ui' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #323232', paddingBottom: '20px', marginBottom: '30px' };
const welcomeTextStyle = { color: '#dfe1e5', margin: 0, fontSize: '1.8rem', fontWeight: 'bold' };
const mainLayout = { display: 'flex', gap: '25px' };
const kanbanGrid = { display: 'flex', gap: '15px' };
const columnStyle = { flex: 1, borderRadius: '10px', padding: '15px', minHeight: '500px', border: '2px solid #323232' };
const colBadge = { fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' };
const cardStyle = { backgroundColor: '#3c3f41', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #4b4d4f', borderLeft: '3px solid', userSelect: 'none' };
const dragHandle = { color: '#5a5d63', fontSize: '1rem', cursor: 'grab', lineHeight: 1 };
const dropZoneHint = { border: '2px dashed', borderRadius: '6px', padding: '10px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, marginBottom: '10px', letterSpacing: '0.5px' };
const emptyColStyle = { textAlign: 'center', color: '#4a4d52', fontSize: '0.75rem', marginTop: '30px', letterSpacing: '0.5px' };
const hintBadge = { fontSize: '0.7rem', color: '#5a5d63', background: '#2b2d30', border: '1px solid #323232', borderRadius: '99px', padding: '3px 10px', letterSpacing: '0.3px' };
const sideCard = { backgroundColor: '#2b2d30', padding: '20px', borderRadius: '8px', border: '1px solid #323232' };
const sideCardTitle = { marginTop: 0, marginBottom: '15px', color: '#dfe1e5' };
const inputStyle = { width: '100%', marginBottom: '10px', padding: '8px', backgroundColor: '#1e1f22', border: '1px solid #4b4d4f', borderRadius: '4px', color: '#bcbec4', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '10px', backgroundColor: '#3574f0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const logoutBtnStyle = { padding: '8px 16px', backgroundColor: 'transparent', color: '#f75f5f', border: '1px solid #f75f5f', borderRadius: '4px', cursor: 'pointer' };
const uploadLabelStyle = { display: 'block', textAlign: 'center', padding: '10px', backgroundColor: '#3e4144', borderRadius: '4px', cursor: 'pointer', border: '1px dashed #4b4d4f' };
const resumeListStyle = { padding: '0', listStyle: 'none', marginTop: '15px' };
const resumeItemStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #323232' };
const centerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1e1f22' };
const deleteBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', color: '#f75f5f', opacity: '0.7' };

export default Dashboard;