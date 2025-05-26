// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
            <h1>404 - Sayfa Bulunamadı</h1>
            <p>Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
            <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontSize: '18px' }}>Ana Sayfaya Dön</Link>
        </div>
    );
}

export default NotFoundPage;