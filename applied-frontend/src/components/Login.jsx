import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/login', formData);
            
            // Checking for both token and userId from your AuthResponse DTO
            if (response.data && response.data.token && response.data.userId) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.userId); 

                alert("Login Successful!");
                navigate('/dashboard'); 
            } 
        } catch (error) {
            console.error("Login Error:", error.response);
            alert(error.response?.data?.message || "Login failed. Check server console.");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Login to Job Tracker</h2>
                
                <form onSubmit={handleLogin}>
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
                        Login
                    </button>
                </form>

                <p style={styles.footerText}>
                    New here? 
                    <span 
                        onClick={() => navigate('/register')} 
                        style={styles.link}
                    >
                        Create an account
                    </span>
                </p>
            </div>
        </div>
    );
};

// Shared IntelliJ Dark Styles
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
        width: '100%', padding: '12px', backgroundColor: '#359640', // IntelliJ Run Green
        color: 'white', border: 'none', borderRadius: '4px',
        cursor: 'pointer', fontWeight: '600', marginTop: '10px'
    },
    footerText: { marginTop: '20px', fontSize: '0.85rem' },
    link: { color: '#3574f0', cursor: 'pointer', marginLeft: '5px' }
};

export default Login;