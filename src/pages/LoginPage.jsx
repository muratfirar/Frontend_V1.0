// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate, Link } from 'react-router-dom';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, currentUser, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Eğer AuthContext'ten kullanıcı bilgisi gelmişse ve login işlemi başarılı olmuşsa yönlendir.
        // isLoading false olduğunda ve currentUser varsa bu kontrol yapılabilir.
        if (!isLoading && currentUser) {
            navigate('/dashboard', { replace: true });
        }
    }, [currentUser, isLoading, navigate]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
            // Yönlendirme useEffect içinde currentUser değişimine göre yapılacak.
            // Veya login başarılı olursa direkt buradan da navigate edilebilir:
            // navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.response?.data?.msg || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
            console.error('Giriş hatası:', err);
        }
    };

    if (isLoading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Yükleniyor...</div>;
    }
    
    // Eğer hala yüklenmiyorsa ve kullanıcı zaten varsa (örn: sayfa yenilendi ama token geçerli)
    // useEffect içindeki yönlendirme çalışmazsa ek bir kontrol.
    if (currentUser) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <form onSubmit={handleSubmit} style={{ width: '320px', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Giriş Yap</h2>
                {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</p>}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="login-username" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Kullanıcı Adı:</label>
                    <input
                        type="text"
                        id="login-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="login-password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Şifre:</label>
                    <input
                        type="password"
                        id="login-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>Giriş Yap</button>
                <p style={{ textAlign: 'center', marginTop: '15px' }}>
                    Hesabınız yok mu? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Kayıt Olun</Link>
                </p>
            </form>
        </div>
    );
}

export default LoginPage;