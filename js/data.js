// Global NameSpace
window.OS = window.OS || {};

// Database Management
window.OS.Data = {
    getAccount: () => JSON.parse(localStorage.getItem('webos_account')) || { user: 'admin', pass: '1234' },
    
    setAccount: (u, p) => localStorage.setItem('webos_account', JSON.stringify({ user: u, pass: p })),
    
    getBg: () => JSON.parse(localStorage.getItem('webos_bg')) || { type: 'image', url: '' },
    
    setBg: (type, url) => localStorage.setItem('webos_bg', JSON.stringify({ type, url }))
};

// App Registry (Where apps will register themselves)
window.OS.Apps = {};

/* File: js/data.js */
window.OS = window.OS || {};

window.OS.Data = {
    // Mevcut Hesap ve Arkaplan ayarları (DEĞİŞTİRME)
    getAccount: () => JSON.parse(localStorage.getItem('webos_account')) || { user: 'admin', pass: '1234' },
    setAccount: (u, p) => localStorage.setItem('webos_account', JSON.stringify({ user: u, pass: p })),
    
    getBg: () => JSON.parse(localStorage.getItem('webos_bg')) || { type: 'image', url: '' },
    setBg: (type, url) => localStorage.setItem('webos_bg', JSON.stringify({ type, url })),

    // --- YENİ EKLENEN KISIM: TEMALAR ---
    getThemes: () => JSON.parse(localStorage.getItem('webos_themes')) || [],
    
    addTheme: (themeObj) => {
        const themes = JSON.parse(localStorage.getItem('webos_themes')) || [];
        themes.push(themeObj);
        try {
            // LocalStorage boyutu sınırlıdır, hata verirse yakalayalım
            localStorage.setItem('webos_themes', JSON.stringify(themes));
            return true;
        } catch (e) {
            alert("Hafıza dolu! Daha fazla resim/video yüklenemiyor.");
            return false;
        }
    },

    removeTheme: (index) => {
        const themes = JSON.parse(localStorage.getItem('webos_themes')) || [];
        themes.splice(index, 1);
        localStorage.setItem('webos_themes', JSON.stringify(themes));
    }
};

window.OS.Apps = {};