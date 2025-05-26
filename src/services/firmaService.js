// src/services/firmaService.js
import apiClient from './apiClient';

export const getFirmalar = async () => {
    try {
        const response = await apiClient.get('/firmalar');
        return response.data;
    } catch (error) {
        console.error("Firmalar getirilirken hata oluştu:", error.response?.data || error.message);
        throw error;
    }
};

export const createFirma = async (firmaData) => {
    try {
        const response = await apiClient.post('/firmalar', firmaData);
        return response.data;
    } catch (error) {
        console.error("Firma oluşturulurken hata oluştu:", error.response?.data || error.message);
        throw error;
    }
};

export const deleteFirma = async (firmaId) => {
    try {
        const response = await apiClient.delete(`/firmalar/${firmaId}`);
        return response.data;
    } catch (error) {
        console.error(`Firma (ID: ${firmaId}) silinirken hata oluştu:`, error.response?.data || error.message);
        throw error;
    }
};

// YENİ EKLENEN FONKSİYONLAR:
/**
 * Belirli bir firmanın detaylarını getirir.
 */
export const getFirmaDetay = async (firmaId) => {
    try {
        const response = await apiClient.get(`/firmalar/${firmaId}`);
        return response.data;
    } catch (error) {
        console.error(`Firma (ID: ${firmaId}) detayları getirilirken hata oluştu:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Belirli bir firmaya ait tüm finansal veri dönemlerini getirir.
 */
export const getFirmaFinansalVeriler = async (firmaId) => {
    try {
        const response = await apiClient.get(`/firmalar/${firmaId}/finansal_veriler`);
        return response.data; // Bu, dönemlere ait veri listesini döndürmeli
    } catch (error) {
        console.error(`Firma (ID: ${firmaId}) finansal verileri getirilirken hata oluştu:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Belirli bir firmaya ait, belirli bir dönemin finansal analizini getirir.
 */
export const getFirmaFinansalAnaliz = async (firmaId, donem) => {
    try {
        const response = await apiClient.get(`/firmalar/${firmaId}/finansal_analiz`, { params: { donem } });
        return response.data;
    } catch (error) {
        console.error(`Firma (ID: ${firmaId}, Dönem: ${donem}) finansal analizi getirilirken hata oluştu:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Belirli bir firmaya CSV ile finansal veri yükler.
 * @param {string|number} firmaId Firma ID'si
 * @param {FormData} formData Dosyayı içeren FormData objesi
 */
export const uploadFirmaFinancials = async (firmaId, formData) => {
    try {
        const response = await apiClient.post(`/firmalar/${firmaId}/upload_financials`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Dosya yükleme için header
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Firma (ID: ${firmaId}) finansal veri yüklenirken hata oluştu:`, error.response?.data || error.message);
        throw error;
    }
};
// src/services/firmaService.js
// ... (diğer importlar ve fonksiyonlar) ...

/**
 * Belirli bir firmaya e-defter XML dosyası yükler.
 * @param {string|number} firmaId Firma ID'si
 * @param {FormData} formData XML dosyasını içeren FormData objesi
 */
export const uploadEdefterXML = async (firmaId, formData) => {
    try {
        const response = await apiClient.post(`/firmalar/${firmaId}/upload_edefter_xml`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Dosya yükleme için header
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Firma (ID: ${firmaId}) için e-defter XML yüklenirken hata oluştu:`, error.response?.data || error.message);
        throw error;
    }
};