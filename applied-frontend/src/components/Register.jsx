import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    // Note: 'username' here matches your User entity field
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/v1/auth/register', formData);
            
            // If backend returns token/userId on register, log them in immediately
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.userId);
                alert("Account Created!");
                navigate('/dashboard');
            } else {
                alert("Registration Successful! Please Login.");
                navigate('/login');
            }
        } catch (error) {
            console.error("Registration Error:", error.response);
            alert(error.response?.data?.message || "Registration failed.");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Join Job Tracker</h2>
                
                <form onSubmit={handleRegister}>
                    <input 
                        style={styles.input} 
                        type="text"
                        placeholder="Full Name"
                        required
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                    <input 
                        style={styles.input} 
                        type="email"
                        placeholder="Email"
                        required
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    <input 
                        style={styles.input} 
                        type="password" 
                        placeholder="Password"
                        required
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    
                    <button type="submit" style={styles.button}>
                        Sign Up
                    </button>
                </form>

                <p style={styles.footerText}>
                    Already have an account? 
                    <span 
                        onClick={() => navigate('/login')} 
                        style={styles.link}
                    >
                        Login here
                    </span>
                </p>
            </div>
        </div>
    );
};

// Reusing the same styles object structure
const styles = {
    container: {
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', width: '100vw', backgroundColor: '#1e1f22',
        color: '#bcbec4', margin: 0, padding: 0
    },
    card: {
        backgroundColor: '#2b2d30', padding: '40px', borderRadius: '8px',
        border: '1px solid #323232', width: '100%', maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)', textAlign: 'center'
    },
    title: { color: '#dfe1e5', marginBottom: '30px', fontSize: '1.8rem' },
    input: {
        width: '100%', padding: '12px', marginBottom: '15px',
        backgroundColor: '#1e1f22', border: '1px solid #4b4d4f',
        borderRadius: '4px', color: '#bcbec4', fontSize: '0.95rem',
        outline: 'none', boxSizing: 'border-box'
    },
    button: {
        width: '100%', padding: '12px', backgroundColor: '#3574f0', // Action Blue
        color: 'white', border: 'none', borderRadius: '4px',
        cursor: 'pointer', fontWeight: '600', marginTop: '10px'
    },
    footerText: { marginTop: '20px', fontSize: '0.85rem' },
    link: { color: '#3574f0', cursor: 'pointer', marginLeft: '5px' }
};

export default Register;