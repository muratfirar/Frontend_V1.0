// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFirmalar, createFirma, deleteFirma } from '../services/firmaService';
import { Link } from 'react-router-dom'; // Link import edildi

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
        setIsLoadingFirmalar(true);
        setErrorFirmalar('');
        try {
            const data = await getFirmalar();
            setFirmalar(data);
        } catch (err) {
            setErrorFirmalar(err.response?.data?.msg || 'Firmalar yüklenirken bir sorun oluştu.');
            if (err.response && (err.response.status === 401 || err.response.status === 422)) {
                logout(); 
            }
        } finally {
            setIsLoadingFirmalar(false);
        }
    }, [currentUser, logout]);

    useEffect(() => {
        fetchFirmalar();
    }, [fetchFirmalar]);

    const handleFirmaEkleSubmit = async (e) => {
        e.preventDefault();
        setFirmaEklemeHatasi('');
        if (!yeniFirmaAdi.trim() || !yeniFirmaVKN.trim()) {
            setFirmaEklemeHatasi('Firma adı ve VKN zorunlu alanlardır.');
            return;
        }
        try {
            const yeniEklenenFirma = await createFirma({ adi: yeniFirmaAdi, vkn: yeniFirmaVKN });
            setFirmalar(prevFirmalar => [...prevFirmalar, yeniEklenenFirma]);
            setYeniFirmaAdi(''); 
            setYeniFirmaVKN('');
            setFirmaEklemeFormuGorunur(false);
        } catch (err) {
            setFirmaEklemeHatasi(err.response?.data?.msg || 'Firma eklenirken bir hata oluştu.');
        }
    };

    const handleFirmaSil = async (firmaId, firmaAdi) => {
        if (window.confirm(`'${firmaAdi}' (ID: ${firmaId}) adlı firmayı silmek istediğinize emin misiniz?`)) {
            try {
                await deleteFirma(firmaId);
                setFirmalar(prevFirmalar => prevFirmalar.filter(firma => firma.id !== firmaId));
            } catch (err) {
                alert(err.response?.data?.msg || 'Firma silinirken bir hata oluştu.');
            }
        }
    };
    
    if (useAuth().isLoading && !currentUser) {
        return <div style={{textAlign: 'center', marginTop: '50px'}}>Yükleniyor...</div>
    }

    return (
        <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                <h2>Merhaba, {currentUser?.username}!</h2>
                <button onClick={logout} style={{ padding: '10px 18px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Çıkış Yap</button>
            </header>
            
            <section style={{ marginBottom: '30px' }}>
                {/* ... (Firma ekleme formu aynı kalabilir, VKN zorunluluğu zaten eklenmişti) ... */}
                 {!firmaEklemeFormuGorunur && (
                    <button 
                        onClick={() => setFirmaEklemeFormuGorunur(true)}
                        style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' }}
                    >
                        + Yeni Firma Ekle
                    </button>
                )}

                {firmaEklemeFormuGorunur && (
                    <form onSubmit={handleFirmaEkleSubmit} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '5px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
                        <h3>Yeni Firma Bilgileri</h3>
                        <div style={{ marginBottom: '10px' }}>
                            <label htmlFor="firmaAdi" style={{ display: 'block', marginBottom: '5px' }}>Firma Adı (*Zorunlu):</label>
                            <input type="text" id="firmaAdi" value={yeniFirmaAdi} onChange={(e) => setYeniFirmaAdi(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label htmlFor="firmaVKN" style={{ display: 'block', marginBottom: '5px' }}>VKN (*Zorunlu):</label>
                            <input type="text" id="firmaVKN" value={yeniFirmaVKN} onChange={(e) => setYeniFirmaVKN(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
                        </div>
                        <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', marginRight: '10px', borderRadius: '5px' }}>Ekle</button>
                        <button type="button" onClick={() => setFirmaEklemeFormuGorunur(false)} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px' }}>İptal</button>
                        {firmaEklemeHatasi && <p style={{ color: 'red', marginTop: '10px' }}>{firmaEklemeHatasi}</p>}
                    </form>
                )}
            </section>

            <section>
                <h3>Kayıtlı Firmalar</h3>
                {isLoadingFirmalar && <p>Firmalar yükleniyor...</p>}
                {errorFirmalar && <p style={{ color: 'red' }}>{errorFirmalar}</p>}
                {!isLoadingFirmalar && !errorFirmalar && (
                    firmalar.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop:'10px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa' }}>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Firma Adı</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>VKN</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {firmalar.map(firma => (
                                    <tr key={firma.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px' }}>
                                            <Link to={`/firmalar/${firma.id}/detay`} style={{textDecoration: 'none', color: '#007bff', fontWeight:'bold'}}>
                                                {firma.adi}
                                            </Link>
                                        </td>
                                        <td style={{ padding: '12px' }}>{firma.vkn}</td>
                                        <td style={{ padding: '12px' }}>
                                            <Link to={`/firmalar/${firma.id}/detay`} style={{marginRight: '10px', padding: '6px 10px', cursor:'pointer', backgroundColor:'#17a2b8', color:'white', border:'none', borderRadius:'4px', textDecoration:'none'}}>Detay</Link>
                                            <button 
                                                onClick={() => handleFirmaSil(firma.id, firma.adi)} 
                                                style={{padding: '6px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor:'pointer'}}
                                            >
                                                Sil
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Gösterilecek firma bulunmamaktadır. Yeni bir firma ekleyebilirsiniz.</p>
                    )
                )}
            </section>
        </div>
    );
}

export default DashboardPage;