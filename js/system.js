document.addEventListener('DOMContentLoaded', () => {
    // Elementler
    const bg = document.getElementById('bg');
    const bgVideo = document.getElementById('bgVideo');
    const lockScreen = document.getElementById('lockScreen');
    const desktop = document.getElementById('desktop');
    const modalOverlay = document.getElementById('modalOverlay');
    
    const DB = window.OS.Data || { getAccount:()=>({}), getBg:()=>({}) };

    // --- ARKA PLAN YÖNETİMİ ---
    window.OS.applyBackground = (data) => {
        if (!data || !data.url) return;
        if (data.type === 'video') {
            bg.classList.add('hidden');
            bgVideo.classList.remove('hidden');
            bgVideo.src = data.url;
            bgVideo.load();
        } else {
            bgVideo.classList.add('hidden');
            bg.classList.remove('hidden');
            bg.style.backgroundImage = `url('${data.url}')`;
        }
    };
    // Başlangıçta yükle
    window.OS.applyBackground(DB.getBg());

    // --- GİRİŞ İŞLEMLERİ ---
    document.getElementById('loginBtn').addEventListener('click', () => {
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;
        const acc = DB.getAccount();
        
        if (u === acc.user && p === acc.pass) {
            bg.classList.remove('blurred');
            bgVideo.classList.remove('blurred');
            lockScreen.style.opacity = '0';
            setTimeout(() => {
                lockScreen.classList.add('hidden');
                desktop.classList.remove('hidden');
            }, 500);
        } else {
            alert('Incorrect username or password!');
        }
    });

    // --- PENCERE YÖNETİMİ ---
    function openWindow(appName) {
        // Uygulamayı 'window.OS.Apps' listesinden bul
        const app = window.OS.Apps && window.OS.Apps[appName];
        
        const win = document.createElement('div');
        win.className = 'window';
        
        // Eğer uygulama bulunduysa render et, bulunamadıysa hata göster
        const contentHtml = app ? app.render() : `<div style="padding:20px; color:white;">Error: App "<b>${appName}</b>" not found.<br>Check settings.js</div>`;
        const title = app ? app.title : 'Error';

        win.innerHTML = `
            <div class="win-header">
                <span>${title}</span>
                <button class="win-close">✕</button>
            </div>
            <div class="win-content">${contentHtml}</div>
        `;

        document.getElementById('windowArea').appendChild(win);
        win.querySelector('.win-close').addEventListener('click', () => win.remove());
        
        // Sürükleme Özelliği
        makeDraggable(win);

        // Uygulama yüklendikten sonra çalışacak kodlar
        if (app && app.onLoad) {
            app.onLoad(win);
        }
    }

    // İkonlara Çift Tıklama
    document.querySelectorAll('.app-icon').forEach(icon => {
        icon.addEventListener('dblclick', function() {
            openWindow(this.getAttribute('data-app'));
        });
    });

    // --- SÜRÜKLEME MANTIĞI ---
    function makeDraggable(elmnt) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const header = elmnt.querySelector('.win-header');
        header.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            // Pencereyi öne getir
            document.querySelectorAll('.window').forEach(w => w.style.zIndex = 10);
            elmnt.style.zIndex = 20;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    // --- MODAL YÖNETİMİ ---
    const toggleModal = (id) => {
        modalOverlay.classList.remove('hidden');
        document.querySelectorAll('.modal-card').forEach(m => m.classList.add('hidden'));
        if(id) document.getElementById(id).classList.remove('hidden');
        else modalOverlay.classList.add('hidden');
    };

    document.querySelectorAll('.btn-cancel').forEach(btn => btn.addEventListener('click', () => toggleModal(null)));
    document.getElementById('openCreate').addEventListener('click', () => toggleModal('createModal'));
    document.getElementById('openForgot').addEventListener('click', () => toggleModal('forgotModal'));

    // Hesap Oluşturma
    document.getElementById('saveCreate').addEventListener('click', () => {
        const u = document.getElementById('newUser').value;
        const p = document.getElementById('newPass').value;
        if(u && p) { DB.setAccount(u, p); alert('Created!'); toggleModal(null); }
    });

    // Şifre Sıfırlama
    document.getElementById('saveReset').addEventListener('click', () => {
        const u = document.getElementById('resetUser').value;
        const p = document.getElementById('resetPass').value;
        if(u === DB.getAccount().user) { DB.setAccount(u, p); alert('Reset!'); toggleModal(null); }
    });

    // Saat
    setInterval(() => {
        document.getElementById('clock').innerText = new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
    }, 1000);
});