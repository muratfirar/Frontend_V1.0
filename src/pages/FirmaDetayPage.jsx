// src/pages/FirmaDetayPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    getFirmaDetay, 
    getFirmaFinansalVeriler, 
    uploadFirmaFinancials, 
    getFirmaFinansalAnaliz 
} from '../services/firmaService';

function FirmaDetayPage() {
    const { firmaId } = useParams(); // URL'den firmaId'yi al
    const { currentUser, logout } = useAuth();
    
    const [firma, setFirma] = useState(null);
    const [finansalVeriDonemleri, setFinansalVeriDonemleri] = useState([]);
    const [seciliDonem, setSeciliDonem] = useState('');
    const [analizSonuclari, setAnalizSonuclari] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [isLoadingFirma, setIsLoadingFirma] = useState(true);
    const [isLoadingVeriler, setIsLoadingVeriler] = useState(false);
    const [isLoadingAnaliz, setIsLoadingAnaliz] = useState(false);
    const [isLoadingUpload, setIsLoadingUpload] = useState(false);

    const [errorFirma, setErrorFirma] = useState('');
    const [errorVeriler, setErrorVeriler] = useState('');
    const [errorAnaliz, setErrorAnaliz] = useState('');
    const [errorUpload, setErrorUpload] = useState('');
    const [successUpload, setSuccessUpload] = useState('');

    // Firma Detaylarını Çek
    const fetchFirmaDetay = useCallback(async () => {
        if (!firmaId) return;
        setIsLoadingFirma(true);
        setErrorFirma('');
        try {
            const data = await getFirmaDetay(firmaId);
            setFirma(data);
        } catch (err) {
            setErrorFirma(err.response?.data?.msg || 'Firma detayları yüklenirken bir hata oluştu.');
            if (err.response && (err.response.status === 401 || err.response.status === 422)) logout();
        } finally {
            setIsLoadingFirma(false);
        }
    }, [firmaId, logout]);

    // Firmaya Ait Finansal Veri Dönemlerini Çek
    const fetchFinansalVeriDonemleri = useCallback(async () => {
        if (!firmaId) return;
        setIsLoadingVeriler(true);
        setErrorVeriler('');
        try {
            const data = await getFirmaFinansalVeriler(firmaId);
            // Backend'den gelen veri yapısına göre data'yı map'leyerek sadece dönemleri alabilirsiniz
            // veya tüm veriyi saklayıp dönemleri oradan çıkarabilirsiniz.
            // Şimdilik tüm veriyi saklayalım, dönemleri oradan alalım.
            setFinansalVeriDonemleri(data || []); // data null ise boş dizi ata
            if (data && data.length > 0) {
                // En son dönemi otomatik seçebilir veya kullanıcıya bırakabiliriz.
                // Şimdilik seçimi kullanıcıya bırakalım.
            }
        } catch (err) {
            setErrorVeriler(err.response?.data?.msg || 'Finansal veri dönemleri yüklenirken bir hata oluştu.');
            if (err.response && (err.response.status === 401 || err.response.status === 422)) logout();
        } finally {
            setIsLoadingVeriler(false);
        }
    }, [firmaId, logout]);

    useEffect(() => {
        fetchFirmaDetay();
        fetchFinansalVeriDonemleri();
    }, [fetchFirmaDetay, fetchFinansalVeriDonemleri]);


    // Seçili Dönem İçin Analiz Çek
    const handleAnalizGetir = async (donem) => {
        if (!firmaId || !donem) return;
        setSeciliDonem(donem);
        setIsLoadingAnaliz(true);
        setErrorAnaliz('');
        setAnalizSonuclari(null);
        try {
            const data = await getFirmaFinansalAnaliz(firmaId, donem);
            setAnalizSonuclari(data);
        } catch (err) {
            setErrorAnaliz(err.response?.data?.msg || `Dönem '${donem}' için analiz getirilirken hata oluştu.`);
            if (err.response && (err.response.status === 401 || err.response.status === 422)) logout();
        } finally {
            setIsLoadingAnaliz(false);
        }
    };

    // Dosya Yükleme İşlemleri
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setErrorUpload('');
        setSuccessUpload('');
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            setErrorUpload('Lütfen bir CSV dosyası seçin.');
            return;
        }
        if (!firmaId) {
            setErrorUpload('Firma ID bulunamadı.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        setIsLoadingUpload(true);
        setErrorUpload('');
        setSuccessUpload('');
        try {
            const response = await uploadFirmaFinancials(firmaId, formData);
            setSuccessUpload(response.msg || 'Finansal veriler başarıyla yüklendi!');
            setSelectedFile(null); // Dosya seçimini temizle
            document.getElementById('csvFile').value = null; // input file değerini sıfırla
            // Veri yüklendikten sonra dönem listesini ve analizi yenileyebiliriz
            fetchFinansalVeriDonemleri(); 
            setAnalizSonuclari(null); // Önceki analizi temizle
            setSeciliDonem(''); // Seçili dönemi temizle
        } catch (err) {
            setErrorUpload(err.response?.data?.msg || 'Dosya yüklenirken bir hata oluştu.');
            if (err.response && (err.response.status === 401 || err.response.status === 422)) logout();
        } finally {
            setIsLoadingUpload(false);
        }
    };

    if (isLoadingFirma) {
        return <div style={{textAlign: 'center', marginTop: '50px'}}>Firma bilgileri yükleniyor...</div>;
    }

    if (errorFirma) {
        return <div style={{textAlign: 'center', marginTop: '50px', color: 'red'}}>Hata: {errorFirma}</div>;
    }

    if (!firma) {
        return <div style={{textAlign: 'center', marginTop: '50px'}}>Firma bulunamadı.</div>;
    }

    // Basit bir stil objesi
    const sectionStyle = { marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '5px' };
    const headingStyle = { marginTop: '0', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px'};

    return (
        <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
            <Link to="/dashboard" style={{textDecoration: 'none', color: '#007bff', marginBottom: '20px', display: 'inline-block'}}>&larr; Dashboard'a Geri Dön</Link>
            
            <section style={sectionStyle}>
                <h2 style={headingStyle}>Firma Bilgileri: {firma.adi}</h2>
                <p><strong>ID:</strong> {firma.id}</p>
                <p><strong>VKN:</strong> {firma.vkn}</p>
                <p><strong>Ekleyen Kullanıcı ID:</strong> {firma.user_id}</p>
                {/* Genişletilmiş Firma modeli ile buraya daha fazla bilgi eklenebilir */}
            </section>

            <section style={sectionStyle}>
                <h3 style={headingStyle}>Finansal Veri Yükle (CSV)</h3>
                <input type="file" id="csvFile" accept=".csv" onChange={handleFileChange} style={{marginBottom:'10px', display:'block'}} />
                <button onClick={handleFileUpload} disabled={isLoadingUpload || !selectedFile} style={{padding:'10px 15px', backgroundColor: '#28a745', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}>
                    {isLoadingUpload ? 'Yükleniyor...' : 'Yükle'}
                </button>
                {errorUpload && <p style={{ color: 'red', marginTop: '10px' }}>{errorUpload}</p>}
                {successUpload && <p style={{ color: 'green', marginTop: '10px' }}>{successUpload}</p>}
                <p style={{fontSize:'0.9em', color:'#6c757d', marginTop:'10px'}}>
                    <small>Not: CSV dosyanızın ilk satırı başlıkları (örn: Donem, AktifToplami, NetSatislar vb.) içermelidir. Modeldeki alan adlarıyla eşleşen sütunlar işlenecektir.</small>
                </p>
            </section>

            <section style={sectionStyle}>
                <h3 style={headingStyle}>Finansal Analiz</h3>
                {isLoadingVeriler && <p>Finansal dönemler yükleniyor...</p>}
                {errorVeriler && <p style={{ color: 'red' }}>{errorVeriler}</p>}
                
                {!isLoadingVeriler && finansalVeriDonemleri.length > 0 && (
                    <div style={{marginBottom: '20px'}}>
                        <label htmlFor="donemSec" style={{marginRight: '10px', fontWeight:'bold'}}>Analiz için Dönem Seçin:</label>
                        <select id="donemSec" value={seciliDonem} onChange={(e) => handleAnalizGetir(e.target.value)} style={{padding:'8px'}}>
                            <option value="">-- Dönem Seçiniz --</option>
                            {finansalVeriDonemleri.map(veri => (
                                <option key={veri.id || veri.donem} value={veri.donem}>{veri.donem}</option>
                            ))}
                        </select>
                    </div>
                )}
                {!isLoadingVeriler && finansalVeriDonemleri.length === 0 && !errorVeriler && (
                    <p>Bu firma için yüklenmiş finansal veri bulunmamaktadır.</p>
                )}

                {isLoadingAnaliz && <p>Analiz sonuçları yükleniyor...</p>}
                {errorAnaliz && <p style={{ color: 'red' }}>{errorAnaliz}</p>}

                {analizSonuclari && !isLoadingAnaliz && (
                    <div>
                        <h4>{analizSonuclari.analiz_donemi} Dönemi Analiz Sonuçları:</h4>
                        <div style={{border:'1px solid #ddd', padding:'15px', borderRadius:'4px', backgroundColor:'#f9f9f9'}}>
                            <p><strong>Firma Adı:</strong> {analizSonuclari.firma_adi}</p>
                            <h5>Hesaplanan Oranlar:</h5>
                            <ul>
                                <li>Cari Oran: {analizSonuclari.hesaplanan_oranlar?.cari_oran ?? 'N/A'}</li>
                                <li>Borç / Özkaynak Oranı: {analizSonuclari.hesaplanan_oranlar?.borc_bolu_ozkaynak_orani ?? 'N/A'}</li>
                            </ul>
                            <h5>Risk Skorları:</h5>
                            <ul>
                                <li>Altman Z-Skoru: {analizSonuclari.risk_skorlari?.altman_z_skoru ?? 'N/A'}</li>
                                <li>Yorum: {analizSonuclari.risk_skorlari?.altman_z_skoru_yorum || 'N/A'}</li>
                            </ul>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

export default FirmaDetayPage;