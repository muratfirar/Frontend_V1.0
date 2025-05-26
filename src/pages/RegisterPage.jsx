// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor!');
            return;
        }
        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        try {
            const data = await register(username, password);
            setSuccessMessage(data.msg + ". Giriş sayfasına yönlendiriliyorsunuz...");
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Kayıt başarısız. Lütfen tekrar deneyin.');
            console.error('Kayıt hatası:', err);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <form onSubmit={handleSubmit} style={{ width: '320px', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Kayıt Ol</h2>
                {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</p>}
                {successMessage && <p style={{ color: 'green', textAlign: 'center', marginBottom: '10px' }}>{successMessage}</p>}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="reg-username" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Kullanıcı Adı:</label>
                    <input type="text" id="reg-username" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="reg-password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Şifre:</label>
                    <input type="password" id="reg-password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="reg-confirm-password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Şifre Tekrar:</label>
                    <input type="password" id="reg-confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>Kayıt Ol</button>
                <p style={{ textAlign: 'center', marginTop: '15px' }}>
                    Zaten hesabınız var mı? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Giriş Yapın</Link>
                </p>
            </form>
        </div>
    );
}

export default RegisterPage;