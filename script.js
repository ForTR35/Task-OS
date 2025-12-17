document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTLER ---
    const bg = document.getElementById('bg');
    const lockScreen = document.getElementById('lockScreen');
    const desktop = document.getElementById('desktop');
    const modalOverlay = document.getElementById('modalOverlay');
    
    // --- VERİ YÖNETİMİ (LocalStorage) ---
    const DB = {
        getAccount: () => JSON.parse(localStorage.getItem('webos_account')) || { user: 'admin', pass: '1234' },
        setAccount: (u, p) => localStorage.setItem('webos_account', JSON.stringify({ user: u, pass: p })),
        getBg: () => localStorage.getItem('webos_bg'),
        setBg: (url) => localStorage.setItem('webos_bg', url)
    };

    // İlk açılışta arka plan yükle
    if (DB.getBg()) bg.style.backgroundImage = `url('${DB.getBg()}')`;

    // --- SİSTEM FONKSİYONLARI ---
    
    // Giriş Yapma
    function login(username, password) {
        const acc = DB.getAccount();
        if (username === acc.user && password === acc.pass) {
            // Blur efektini kaldır
            bg.classList.remove('blurred');
            
            // Kilit ekranını yukarı kaydırarak gizle
            lockScreen.style.opacity = '0';
            lockScreen.style.pointerEvents = 'none'; // Tıklamayı engelle
            
            // Masaüstünü göster
            setTimeout(() => {
                desktop.classList.remove('hidden');
            }, 300);
        } else {
            alert('Hatalı kullanıcı adı veya şifre! (Varsayılan: admin / 1234)');
        }
    }

    // --- PENCERE YÖNETİMİ (SÜRÜKLENEBİLİR) ---
    function openWindow(appName) {
        const win = document.createElement('div');
        win.className = 'window';
        
        let contentHtml = `<p>${appName} uygulamasına hoş geldiniz.</p>`;
        
        // Eğer Ayarlar uygulamasıysa içeriği değiştir
        if(appName === 'ayarlar') {
            contentHtml = `
                <p>Arka Plan Resmi:</p>
                <input type="text" id="winBgInput" placeholder="Resim URL yapıştırın" style="width:100%; padding:5px; margin-bottom:10px;">
                <button id="winBgSave" style="padding:5px 10px;">Kaydet</button>
            `;
        }

        win.innerHTML = `
            <div class="win-header">
                <span>${appName.toUpperCase()}</span>
                <button class="win-close">✕</button>
            </div>
            <div class="win-content">${contentHtml}</div>
        `;

        document.getElementById('windowArea').appendChild(win);

        // Kapatma butonu
        win.querySelector('.win-close').addEventListener('click', () => win.remove());

        // Ayarlar için özel event
        if(appName === 'ayarlar') {
            const btn = win.querySelector('#winBgSave');
            const inp = win.querySelector('#winBgInput');
            btn.addEventListener('click', () => {
                if(inp.value) {
                    DB.setBg(inp.value);
                    bg.style.backgroundImage = `url('${inp.value}')`;
                    alert('Arka plan güncellendi!');
                }
            });
        }

        // Pencereyi Sürüklenebilir Yap
        makeDraggable(win);
    }

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
            
            // Tıklanan pencereyi en üste al
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

    // --- OLAY DİNLEYİCİLERİ (EVENT LISTENERS) ---

    // Login Butonu
    document.getElementById('loginBtn').addEventListener('click', () => {
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;
        login(u, p);
    });

    // İkonlara Çift Tıklama
    document.querySelectorAll('.app-icon').forEach(icon => {
        icon.addEventListener('dblclick', function() {
            const appName = this.getAttribute('data-app');
            openWindow(appName);
        });
    });

    // Modal Açma/Kapama Helper
    const showModal = (id) => {
        modalOverlay.classList.remove('hidden');
        document.querySelectorAll('.modal-card').forEach(m => m.classList.add('hidden'));
        document.getElementById(id).classList.remove('hidden');
    };
    
    // Modal Kapatma
    document.querySelectorAll('.btn-cancel').forEach(btn => {
        btn.addEventListener('click', () => modalOverlay.classList.add('hidden'));
    });

    // Linkler
    document.getElementById('openCreate').addEventListener('click', () => showModal('createModal'));
    document.getElementById('openForgot').addEventListener('click', () => showModal('forgotModal'));

    // Hesap Oluştur Kaydet
    document.getElementById('saveCreate').addEventListener('click', () => {
        const u = document.getElementById('newUser').value;
        const p = document.getElementById('newPass').value;
        if(u && p) {
            DB.setAccount(u, p);
            alert('Hesap oluşturuldu! Şimdi giriş yapabilirsiniz.');
            modalOverlay.classList.add('hidden');
        }
    });
    
    // Şifre Sıfırla Kaydet
    document.getElementById('saveReset').addEventListener('click', () => {
        const u = document.getElementById('resetUser').value;
        const p = document.getElementById('resetPass').value;
        const current = DB.getAccount();
        if(u === current.user) {
            DB.setAccount(u, p);
            alert('Şifre güncellendi.');
            modalOverlay.classList.add('hidden');
        } else {
            alert('Kullanıcı bulunamadı.');
        }
    });
    
    // Saat Güncelleme
    setInterval(() => {
        const now = new Date();
        document.getElementById('clock').innerText = now.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
    }, 1000);
});
