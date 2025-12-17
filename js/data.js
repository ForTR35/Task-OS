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
