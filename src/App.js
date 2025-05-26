// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './components/Auth/PrivateRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import FirmaDetayPage from './pages/FirmaDetayPage'; // YENİ SAYFAYI IMPORT ET

// Layout ve NavigateToDashboardOrLogin bileşenleri aynı kalabilir (bir önceki yanıttaki gibi)
function Layout() {
    const { currentUser, logout, isLoading } = useAuth();
    return (
        <>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#343a40', color: 'white', marginBottom: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>FinansRisk Pro</Link>
                <div>
                    {isLoading && <span style={{color: '#adb5bd'}}>Yükleniyor...</span>}
                    {!isLoading && currentUser && (
                        <>
                            <Link to="/dashboard" style={{ color: '#f8f9fa', textDecoration: 'none', marginRight: '20px' }}>Dashboard</Link>
                            <span style={{ marginRight: '20px', color: '#adb5bd' }}>({currentUser.username})</span>
                            <button onClick={logout} style={{ background: '#dc3545', border: 'none', color: 'white', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer' }}>Çıkış Yap</button>
                        </>
                    )}
                    {!isLoading && !currentUser && (
                        <>
                            <Link to="/login" style={{ color: '#f8f9fa', textDecoration: 'none', marginRight: '15px' }}>Giriş Yap</Link>
                            <Link to="/register" style={{ color: '#f8f9fa', textDecoration: 'none' }}>Kayıt Ol</Link>
                        </>
                    )}
                </div>
            </nav>
            <main style={{ padding: '0 2rem', minHeight: 'calc(100vh - 150px)' }}>
                <Outlet />
            </main>
            <footer style={{textAlign:'center', padding:'1rem', marginTop:'2rem', borderTop:'1px solid #eee', color:'#6c757d'}}>
                Finansal Risk Prototip © 2025
            </footer>
        </>
    );
}

function NavigateToDashboardOrLogin() {
    const { currentUser, isLoading } = useAuth();
    if (isLoading) {
        return <div style={{textAlign: 'center', marginTop: '50px'}}>Yönlendiriliyor...</div>;
    }
    return currentUser ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route element={<Layout />}> {/* Ortak Layout'u kullan */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        
                        {/* Korumalı Yollar */}
                        <Route element={<PrivateRoute />}>
                            <Route path="/dashboard" element={<DashboardPage />} />
                            {/* YENİ ROUTE EKLENDİ */}
                            <Route path="/firmalar/:firmaId/detay" element={<FirmaDetayPage />} />
                        </Route>

                        <Route path="/" element={<NavigateToDashboardOrLogin />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;