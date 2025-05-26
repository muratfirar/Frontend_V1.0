// src/pages/FirmaDetayPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    getFirmaDetay, 
    getFirmaFinansalVeriler, // Bu özet CSV verilerini listelemek için
    uploadFirmaFinancialsCSV, 
    getFirmaFinansalAnaliz, // Bu özet CSV verilerinden analiz için
    uploadEdefterXML, // E-Defter XML yükleme servisi
    getYevmiyeDokumu // Yevmiye dökümü için (henüz UI'da tam entegre değil)
} from '../services/firmaService';

function FirmaDetayPage() {
    const { firmaId } = useParams();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [firma, setFirma] = useState(null);
    const [finansalVeriDonemleriCSV, setFinansalVeriDonemleriCSV] = useState([]); // CSV'den yüklenen özet dönemler
    const [seciliDonemCSV, setSeciliDonemCSV] = useState('');
    const [analizSonuclariCSV, setAnalizSonuclariCSV] = useState(null);
    
    const [selectedCSVFile, setSelectedCSVFile] = useState(null);
    const [selectedXMLFile, setSelectedXMLFile] = useState(null);

    const [isLoadingFirma, setIsLoadingFirma] = useState(true);
    const [isLoadingVerilerCSV, setIsLoadingVerilerCSV] = useState(false);
    const [isLoadingAnalizCSV, setIsLoadingAnalizCSV] = useState(false);
    const [isLoadingCSVUpload, setIsLoadingCSVUpload] = useState(false);
    const [isLoadingXMLUpload, setIsLoadingXMLUpload] = useState(false);

    const [errorFirma, setErrorFirma] = useState('');
    const [errorVerilerCSV, setErrorVerilerCSV] = useState('');
    const [errorAnalizCSV, setErrorAnalizCSV] = useState('');
    const [errorCSVUpload, setErrorCSVUpload] = useState('');
    const [successCSVUpload, setSuccessCSVUpload] = useState('');
    const [errorXMLUpload, setErrorXMLUpload] = useState('');
    const [successXMLUpload, setSuccessXMLUpload] = useState('');
    
    const commonErrorHandler = useCallback((err, defaultMessage = 'Bir hata oluştu.') => {
        if (err.response && (err.response.status === 401 || err.response.status === 422)) {
            logout();
            navigate('/login', {replace: true});
            return "Oturumunuz sonlanmış veya geçersiz. Lütfen tekrar giriş yapın.";
        }
        return err.response?.data?.msg || err.message || defaultMessage;
    }, [logout, navigate]);

    const fetchFirmaDetay = useCallback(async () => {
        if (!firmaId) return;
        setIsLoadingFirma(true); setErrorFirma('');
        try { const data = await getFirmaDetay(firmaId); setFirma(data); } 
        catch (err) { setErrorFirma(commonErrorHandler(err,'Firma detayları yüklenemedi.')); } 
        finally { setIsLoadingFirma(false); }
    }, [firmaId, commonErrorHandler]);

    const fetchFinansalVeriDonemleriFromCSV = useCallback(async () => {
        if (!firmaId) return;
        setIsLoadingVerilerCSV(true); setErrorVerilerCSV('');
        try { 
            const data = await getFirmaFinansalVeriler(firmaId); // Bu endpoint FinansalVeri modelini listeler
            setFinansalVeriDonemleriCSV(Array.isArray(data) ? data : []);
        } catch (err) { setErrorVerilerCSV(commonErrorHandler(err,'Özet finansal veri dönemleri yüklenemedi.')); } 
        finally { setIsLoadingVerilerCSV(false); }
    }, [firmaId, commonErrorHandler]);

    useEffect(() => {
        fetchFirmaDetay();
        fetchFinansalVeriDonemleriFromCSV();
    }, [fetchFirmaDetay, fetchFinansalVeriDonemleriFromCSV]);

    const handleAnalizGetirFromCSV = async (donem) => {
        if (!firmaId || !donem) return;
        setSeciliDonemCSV(donem); setIsLoadingAnalizCSV(true); setErrorAnalizCSV(''); setAnalizSonuclariCSV(null);
        try { 
            const data = await getFirmaFinansalAnaliz(firmaId, donem); // Bu endpoint FinansalVeri'den analiz yapar
            setAnalizSonuclariCSV(data); 
        } catch (err) { setErrorAnalizCSV(commonErrorHandler(err, `Analiz getirilirken hata (Dönem: ${donem})`)); } 
        finally { setIsLoadingAnalizCSV(false); }
    };

    const handleCSVFileChange = (event) => { setSelectedCSVFile(event.target.files[0]); setErrorCSVUpload(''); setSuccessCSVUpload(''); };
    const handleXMLFileChange = (event) => { setSelectedXMLFile(event.target.files[0]); setErrorXMLUpload(''); setSuccessXMLUpload(''); };

    const handleCSVFileUpload = async () => {
        if (!selectedCSVFile) { setErrorCSVUpload('Lütfen bir CSV dosyası seçin.'); return; }
        const formData = new FormData(); formData.append('file', selectedCSVFile);
        setIsLoadingCSVUpload(true); setErrorCSVUpload(''); setSuccessCSVUpload('');
        try {
            const response = await uploadFirmaFinancialsCSV(firmaId, formData);
            setSuccessCSVUpload(response.msg || 'CSV özet verileri başarıyla yüklendi!');
            setSelectedCSVFile(null); if(document.getElementById('csvFile')) document.getElementById('csvFile').value = null;
            fetchFinansalVeriDonemleriFromCSV(); setAnalizSonuclariCSV(null); setSeciliDonemCSV('');
        } catch (err) { setErrorCSVUpload(commonErrorHandler(err,'CSV yüklenirken hata.')); } 
        finally { setIsLoadingCSVUpload(false); }
    };
    
    const handleXMLFileUpload = async () => {
        if (!selectedXMLFile) { setErrorXMLUpload('Lütfen bir XML e-defter dosyası seçin.'); return; }
        const formData = new FormData(); formData.append('file', selectedXMLFile);
        setIsLoadingXMLUpload(true); setErrorXMLUpload(''); setSuccessXMLUpload('');
        try {
            const response = await uploadEdefterXML(firmaId, formData);
            setSuccessXMLUpload(response.msg || 'E-defter XML başarıyla yüklendi! Yevmiye dökümünü kontrol edebilirsiniz.');
            setSelectedXMLFile(null); if(document.getElementById('xmlFile')) document.getElementById('xmlFile').value = null;
            // E-defter yüklendikten sonra yevmiye dökümü sayfasına yönlendirme veya o bölümü yenileme eklenebilir.
        } catch (err) { setErrorXMLUpload(commonErrorHandler(err,'E-defter XML yüklenirken hata.')); } 
        finally { setIsLoadingXMLUpload(false); }
    };

    const sectionStyle = { marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
    const headingStyle = { marginTop: '0', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', color: '#333'};
    const inputStyle = {marginBottom:'10px', display:'block', padding:'8px', border:'1px solid #ccc', borderRadius:'4px'};
    const buttonStyle = {padding:'10px 15px', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', marginRight:'10px'};

    if (isLoadingFirma) return <div style={{textAlign: 'center', marginTop: '50px'}}>Firma bilgileri yükleniyor...</div>;
    if (errorFirma) return <div style={{textAlign: 'center', marginTop: '50px', color: 'red'}}>Hata: {errorFirma}</div>;
    if (!firma) return <div style={{textAlign: 'center', marginTop: '50px'}}>Firma bulunamadı.</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px', backgroundColor:'#f4f7f6' }}>
            <Link to="/dashboard" style={{textDecoration: 'none', color: '#007bff', marginBottom: '20px', display: 'inline-block', fontWeight:'bold'}}>&larr; Dashboard'a Geri Dön</Link>
            
            <section style={sectionStyle}>
                <h2 style={headingStyle}>Firma Bilgileri: {firma.adi}</h2>
                <p><strong>ID:</strong> {firma.id}</p>
                <p><strong>VKN:</strong> {firma.vkn}</p>
            </section>

            {/* E-DEFTER XML YÜKLEME BÖLÜMÜ (DAHA ÖNCELİKLİ GÖSTERİLEBİLİR) */}
            <section style={{...sectionStyle, border: '2px solid #007bff'}}> {/* Vurgulamak için farklı stil */}
                <h3 style={headingStyle}>Resmi E-Defter Yükle (XML - Yevmiye Detayları İçin)</h3>
                <p>GİB standartlarındaki Yevmiye Defteri XML dosyanızı yükleyerek detaylı fiş kayıtlarını sisteme aktarabilirsiniz. Bu veriler "Yevmiye Dökümü" sayfasında görüntülenecektir.</p>
                <input type="file" id="xmlFile" accept=".xml, application/xml, text/xml" onChange={handleXMLFileChange} style={inputStyle} />
                <button onClick={handleXMLFileUpload} disabled={isLoadingXMLUpload || !selectedXMLFile} style={{...buttonStyle, backgroundColor: '#007bff'}}>
                    {isLoadingXMLUpload ? 'Yükleniyor...' : 'E-Defter XML Yükle'}
                </button>
                {errorXMLUpload && <p style={{ color: 'red', marginTop: '10px' }}>{errorXMLUpload}</p>}
                {successXMLUpload && <p style={{ color: 'green', marginTop: '10px' }}>{successXMLUpload}</p>}
            </section>
            
            <section style={sectionStyle}>
                <h3 style={headingStyle}>Yevmiye Defteri Dökümü</h3>
                <p>Yüklediğiniz e-defter XML verilerinden oluşturulan yevmiye fişlerini detaylı olarak inceleyebilirsiniz.</p>
                <Link to={`/firmalar/${firmaId}/yevmiye-dokumu`}>
                    <button style={{...buttonStyle, backgroundColor:'#6c757d'}}>Yevmiye Dökümünü Görüntüle</button>
                </Link>
            </section>

            <hr style={{margin: "40px 0"}} />

            {/* CSV YÜKLEME BÖLÜMÜ (DAHA AZ ÖNCELİKLİ VEYA FARKLI AMAÇLA) */}
            <section style={sectionStyle}>
                <h3 style={headingStyle}>Özet Finansal Veri Yükle (CSV - Hızlı Analiz İçin)</h3>
                <p>Eğer e-defter yerine manuel olarak özetlenmiş finansal tablo verileriniz (bilanço, gelir tablosu kalemleri) varsa, bunları CSV formatında yükleyerek temel analizleri (Altman Z-Skoru, oranlar vb.) çalıştırabilirsiniz.</p>
                <input type="file" id="csvFile" accept=".csv" onChange={handleCSVFileChange} style={inputStyle} />
                <button onClick={handleCSVFileUpload} disabled={isLoadingCSVUpload || !selectedCSVFile} style={{...buttonStyle, backgroundColor: '#28a745'}}>
                    {isLoadingCSVUpload ? 'Yükleniyor...' : 'Özet CSV Yükle'}
                </button>
                {errorCSVUpload && <p style={{ color: 'red', marginTop: '10px' }}>{errorCSVUpload}</p>}
                {successCSVUpload && <p style={{ color: 'green', marginTop: '10px' }}>{successCSVUpload}</p>}
            </section>

            <section style={sectionStyle}>
                <h3 style={headingStyle}>Finansal Analiz (Yüklenen Özet CSV Verilerinden)</h3>
                {isLoadingVerilerCSV && <p>Özet finansal dönemler yükleniyor...</p>}
                {errorVerilerCSV && <p style={{ color: 'red' }}>{errorVerilerCSV}</p>}
                
                {!isLoadingVerilerCSV && finansalVeriDonemleriCSV.length > 0 && (
                    <div style={{marginBottom: '20px'}}>
                        <label htmlFor="donemSecCSV" style={{marginRight: '10px', fontWeight:'bold'}}>Analiz için Dönem Seçin:</label>
                        <select id="donemSecCSV" value={seciliDonemCSV} onChange={(e) => handleAnalizGetirFromCSV(e.target.value)} style={{padding:'8px', borderRadius:'4px'}}>
                            <option value="">-- Dönem Seçiniz --</option>
                            {finansalVeriDonemleriCSV.map(veri => (
                                <option key={veri.id || veri.donem} value={veri.donem}>{veri.donem}</option>
                            ))}
                        </select>
                    </div>
                )}
                 {!isLoadingVerilerCSV && finansalVeriDonemleriCSV.length === 0 && !errorVerilerCSV && (
                    <p>Bu firma için analiz edilecek özet CSV verisi bulunmamaktadır.</p>
                )}

                {isLoadingAnalizCSV && <p>Analiz sonuçları yükleniyor...</p>}
                {errorAnalizCSV && <p style={{ color: 'red' }}>{errorAnalizCSV}</p>}

                {analizSonuclariCSV && !isLoadingAnalizCSV && (
                    <div>
                        <h4>{analizSonuclariCSV.analiz_donemi_ozet_veri} Dönemi Analiz Sonuçları:</h4>
                        <div style={{border:'1px solid #ddd', padding:'15px', borderRadius:'4px', backgroundColor:'#f9f9f9'}}>
                            {/* ... (Analiz sonuçları gösterimi aynı) ... */}
                            <p><strong>Firma Adı:</strong> {analizSonuclariCSV.firma_adi}</p>
                            <h5>Hesaplanan Oranlar:</h5>
                            <ul>
                                <li>Cari Oran: {analizSonuclariCSV.hesaplanan_oranlar?.cari_oran ?? 'N/A'}</li>
                                <li>Borç / Özkaynak Oranı: {analizSonuclariCSV.hesaplanan_oranlar?.borc_bolu_ozkaynak_orani ?? 'N/A'}</li>
                            </ul>
                            <h5>Risk Skorları:</h5>
                            <ul>
                                <li>Altman Z-Skoru: {analizSonuclariCSV.risk_skorlari?.altman_z_skoru ?? 'N/A'}</li>
                                <li>Yorum: {analizSonuclariCSV.risk_skorlari?.altman_z_skoru_yorum || 'N/A'}</li>
                            </ul>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

export default FirmaDetayPage;