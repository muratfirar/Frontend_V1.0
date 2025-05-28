// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFirmalar, createFirma, deleteFirma } from '../services/firmaService';
import { Link } from 'react-router-dom';

// Stil tanımlamalarını bileşenin dışında veya ayrı bir CSS dosyasında yapmak daha iyidir.
// Bu sadece bir örnek ve temel bir başlangıçtır.
const styles = {
    pageContainer: { maxWidth: '1100px', margin: '20px auto', padding: '20px', fontFamily: 'Arial, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #e0e0e0' },
    headerTitle: { margin: 0, color: '#333' },
    logoutButton: { padding: '10px 20px', backgroundColor: '#d9534f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' },
    section: { marginBottom: '40px', padding: '25px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
    sectionTitle: { marginTop: 0, marginBottom: '20px', color: '#444', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' },
    input: { width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' },
    button: { padding: '12px 20px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', marginRight: '10px' },
    primaryButton: { backgroundColor: '#007bff' },
    successButton: { backgroundColor: '#28a745' },
    cancelButton: { backgroundColor: '#6c757d' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa', color: '#495057', fontWeight: 'bold' },
    td: { padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #f1f1f1' },
    actionButton: { marginRight: '8px', padding: '6px 12px', fontSize: '14px', cursor: 'pointer', border: 'none', borderRadius: '4px' },
    detailButton: { backgroundColor: '#17a2b8', color: 'white' },
    deleteButton: { backgroundColor: '#dc354f', color: 'white' },
    link: { textDecoration: 'none', color: '#007bff', fontWeight: 'bold' },
    errorText: { color: 'red', marginTop: '10px' },
    infoText: { color: '#666', marginTop: '10px' }
};

function DashboardPage() {
    const { currentUser, logout } = useAuth();
    const [firmalar, setFirmalar] = useState([]);
    const [isLoadingFirmalar, setIsLoadingFirmalar] = useState(false);
    const [errorFirmalar, setErrorFirmalar] = useState('');

    const [yeniFirmaAdi, setYeniFirmaAdi] = useState('');
    const [yeniFirmaVKN, setYeniFirmaVKN] = useState('');
    const [firmaEklemeFormuGorunur, setFirmaEklemeFormuGorunur] = useState(false);
    const [firmaEklemeHatasi, setFirmaEklemeHatasi] = useState('');

    const fetchFirmalar = useCallback(async () => {
        if (!currentUser) return;
        setIsLoadingFirmalar(true); setErrorFirmalar('');
        try {
            const data = await getFirmalar(); setFirmalar(data);
        } catch (err) {
            setErrorFirmalar(err.response?.data?.msg || 'Firmalar yüklenirken bir sorun oluştu.');
            if (err.response && (err.response.status === 401 || err.response.status === 422)) logout();
        } finally { setIsLoadingFirmalar(false); }
    }, [currentUser, logout]);

    useEffect(() => { fetchFirmalar(); }, [fetchFirmalar]);

    const handleFirmaEkleSubmit = async (e) => {
        e.preventDefault(); setFirmaEklemeHatasi('');
        if (!yeniFirmaAdi.trim() || !yeniFirmaVKN.trim()) {
            setFirmaEklemeHatasi('Firma adı ve VKN zorunlu alanlardır.'); return;
        }
        try {
            const yeniEklenenFirma = await createFirma({ adi: yeniFirmaAdi, vkn: yeniFirmaVKN });
            setFirmalar(prevFirmalar => [yeniEklenenFirma, ...prevFirmalar].sort((a, b) => a.adi.localeCompare(b.adi))); // Sona ekleyip sırala veya direkt başa ekle
            setYeniFirmaAdi(''); setYeniFirmaVKN(''); setFirmaEklemeFormuGorunur(false);
        } catch (err) { setFirmaEklemeHatasi(err.response?.data?.msg || 'Firma eklenirken bir hata oluştu.'); }
    };

    const handleFirmaSil = async (firmaId, firmaAdi) => {
        if (window.confirm(`'${firmaAdi}' (ID: ${firmaId}) adlı firmayı silmek istediğinize emin misiniz?`)) {
            try {
                await deleteFirma(firmaId);
                setFirmalar(prevFirmalar => prevFirmalar.filter(firma => firma.id !== firmaId));
            } catch (err) { alert(err.response?.data?.msg || 'Firma silinirken bir hata oluştu.'); }
        }
    };
    
    if (useAuth().isLoading && !currentUser) {
        return <div style={{textAlign: 'center', marginTop: '50px'}}>Yükleniyor...</div>
    }

    return (
        <div style={styles.pageContainer}>
            <header style={styles.header}>
                <h1 style={styles.headerTitle}>Hoş Geldiniz, {currentUser?.username}!</h1>
                <button onClick={logout} style={styles.logoutButton}>Çıkış Yap</button>
            </header>
            
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Firma İşlemleri</h2>
                {!firmaEklemeFormuGorunur && (
                    <button 
                        onClick={() => setFirmaEklemeFormuGorunur(true)}
                        style={{...styles.button, ...styles.primaryButton, marginBottom: '20px' }}
                    >
                        + Yeni Firma Ekle
                    </button>
                )}

                {firmaEklemeFormuGorunur && (
                    <form onSubmit={handleFirmaEkleSubmit} style={{ marginBottom: '20px' }}>
                        <h3 style={{marginTop:0}}>Yeni Firma Bilgileri</h3>
                        <div style={styles.formGroup}>
                            <label htmlFor="firmaAdi" style={styles.label}>Firma Adı (*Zorunlu):</label>
                            <input type="text" id="firmaAdi" value={yeniFirmaAdi} onChange={(e) => setYeniFirmaAdi(e.target.value)} required style={styles.input}/>
                        </div>
                        <div style={styles.formGroup}>
                            <label htmlFor="firmaVKN" style={styles.label}>VKN (*Zorunlu):</label>
                            <input type="text" id="firmaVKN" value={yeniFirmaVKN} onChange={(e) => setYeniFirmaVKN(e.target.value)} required style={styles.input}/>
                        </div>
                        <button type="submit" style={{...styles.button, ...styles.successButton}}>Ekle</button>
                        <button type="button" onClick={() => setFirmaEklemeFormuGorunur(false)} style={{...styles.button, ...styles.cancelButton}}>İptal</button>
                        {firmaEklemeHatasi && <p style={styles.errorText}>{firmaEklemeHatasi}</p>}
                    </form>
                )}
            </section>

            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Kayıtlı Firmalar</h2>
                {isLoadingFirmalar && <p style={styles.infoText}>Firmalar yükleniyor...</p>}
                {errorFirmalar && <p style={styles.errorText}>{errorFirmalar}</p>}
                {!isLoadingFirmalar && !errorFirmalar && (
                    firmalar.length > 0 ? (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Firma Adı</th>
                                    <th style={styles.th}>VKN</th>
                                    <th style={styles.th}>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {firmalar.map(firma => (
                                    <tr key={firma.id}>
                                        <td style={styles.td}>
                                            <Link to={`/firmalar/${firma.id}/detay`} style={styles.link}>
                                                {firma.adi}
                                            </Link>
                                        </td>
                                        <td style={styles.td}>{firma.vkn}</td>
                                        <td style={styles.td}>
                                            <Link to={`/firmalar/${firma.id}/detay`} style={{...styles.actionButton, ...styles.detailButton, textDecoration:'none'}}>Detay</Link>
                                            <button 
                                                onClick={() => handleFirmaSil(firma.id, firma.adi)} 
                                                style={{...styles.actionButton, ...styles.deleteButton}}
                                            >
                                                Sil
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={styles.infoText}>Gösterilecek firma bulunmamaktadır. Yeni bir firma ekleyebilirsiniz.</p>
                    )
                )}
            </section>
        </div>
    );
}

export default DashboardPage;