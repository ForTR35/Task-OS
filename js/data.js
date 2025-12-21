// Global NameSpace
window.OS = window.OS || {};

// Database Management
window.OS.Data = {
    getAccount: () => JSON.parse(localStorage.getItem('webos_account')) || { user: 'admin', pass: '1234' },
    
    setAccount: (u, p) => localStorage.setItem('webos_account', JSON.stringify({ user: u, pass: p })),
    
    getBg: () => JSON.parse(localStorage.getItem('webos_bg')) || { type: 'image', url: '' },
    
    setBg: (type, url) => localStorage.setItem('webos_bg', JSON.stringify({ type, url })),

    // ... (üstteki kodlar aynen kalsın) ...

    // --- NOT SİSTEMİ (Bunu Data objesinin içine ekle) ---
    getNotes: () => JSON.parse(localStorage.getItem('webos_notes')) || [],
    
    getNoteById: (id) => {
        const notes = JSON.parse(localStorage.getItem('webos_notes')) || [];
        return notes.find(n => n.id === id);
    },

    saveNote: (id, title, content) => {
        let notes = JSON.parse(localStorage.getItem('webos_notes')) || [];
        
        if (id) {
            // Eski notu güncelle
            const index = notes.findIndex(n => n.id === id);
            if (index !== -1) {
                notes[index].title = title;
                notes[index].content = content;
                notes[index].updated = Date.now();
            }
        } else {
            // Yeni not oluştur
            const newNote = {
                id: 'note-' + Date.now(),
                title: title,
                content: content,
                created: Date.now()
            };
            notes.push(newNote);
        }
        localStorage.setItem('webos_notes', JSON.stringify(notes));
        return true;
    },

    deleteNote: (id) => {
        let notes = JSON.parse(localStorage.getItem('webos_notes')) || [];
        notes = notes.filter(n => n.id !== id);
        localStorage.setItem('webos_notes', JSON.stringify(notes));
    }
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
    },
    // --- BURADAN BAŞLA ---
    // NOT SİSTEMİ
    getNotes: () => JSON.parse(localStorage.getItem('webos_notes')) || [],
    
    getNoteById: (id) => {
        const notes = JSON.parse(localStorage.getItem('webos_notes')) || [];
        return notes.find(n => n.id === id);
    },

    saveNote: (id, title, content) => {
        let notes = JSON.parse(localStorage.getItem('webos_notes')) || [];
        
        if (id) {
            // Güncelleme
            const index = notes.findIndex(n => n.id === id);
            if (index !== -1) {
                notes[index].title = title;
                notes[index].content = content;
                notes[index].updated = Date.now();
            }
        } else {
            // Yeni Ekleme
            const newNote = {
                id: 'note-' + Date.now(),
                title: title,
                content: content,
                created: Date.now()
            };
            notes.push(newNote);
        }
        localStorage.setItem('webos_notes', JSON.stringify(notes));
        return true;
    },

    deleteNote: (id) => {
        let notes = JSON.parse(localStorage.getItem('webos_notes')) || [];
        notes = notes.filter(n => n.id !== id);
        localStorage.setItem('webos_notes', JSON.stringify(notes));
    },
    // --- BURADA BİTİR ---

    // --- İKON SIRALAMASI ---
    getIconOrder: () => JSON.parse(localStorage.getItem('webos_icon_order')) || null,
    
    saveIconOrder: (orderList) => {
        localStorage.setItem('webos_icon_order', JSON.stringify(orderList));
    }
}; // <-- Bu parantez Data objesinin kapanışıdır, bunun içine eklediğinden emin ol.

window.OS.Apps = {};