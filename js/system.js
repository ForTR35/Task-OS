/* File: js/system.js */

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM ELEMENTLERİNİ SEÇME ---
    const bg = document.getElementById('bg');
    const bgVideo = document.getElementById('bgVideo');
    const bgYoutube = document.getElementById('bgYoutube'); // YouTube iframe
    const lockScreen = document.getElementById('lockScreen');
    const desktop = document.getElementById('desktop');
    const modalOverlay = document.getElementById('modalOverlay');
    const windowArea = document.getElementById('windowArea');

    // Taskbar Element Kontrolü
    let taskbar = document.getElementById('taskbar');
    if (!taskbar) {
        taskbar = document.createElement('div');
        taskbar.id = 'taskbar';
        taskbar.className = 'taskbar';
        document.body.appendChild(taskbar);
    }

    const DB = window.OS.Data;
    let zIndexCounter = 100;

    // ---------------------------------------------------------
    // 1. ARKA PLAN VE TEMA YÖNETİMİ
    // ---------------------------------------------------------
    
    // Arka planı ayarlayan ana fonksiyon
window.OS.applyBackground = (data) => {
        const bg = document.getElementById('bg');
        const bgVideo = document.getElementById('bgVideo');
        const bgYoutube = document.getElementById('bgYoutube');

        // Hepsini gizle/durdur
        bg.classList.add('hidden');
        bgVideo.classList.add('hidden');
        bgVideo.pause();
        if(bgYoutube) {
            bgYoutube.classList.add('hidden');
            bgYoutube.src = ""; 
        }

        if (!data || !data.url) {
            bg.classList.remove('hidden');
            bg.style.backgroundImage = ''; 
            return;
        }

        // 1. YouTube Videosu
        if (data.type === 'youtube' && bgYoutube) {
            bgYoutube.classList.remove('hidden');
            
            // --- DÜZELTME: Ses API'sini linke zorla ekle ---
            let finalUrl = data.url;
            // Eğer linkte enablejsapi yoksa ekle
            if (!finalUrl.includes('enablejsapi=1')) {
                finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'enablejsapi=1';
            }
            // Sesi kodla kontrol edeceğimiz için mute=0 (açık) olarak başlatabiliriz
            // ama tarayıcılar otomatik oynatmada sesi kısabilir.
            
            bgYoutube.src = finalUrl; 
        } 
        // 2. Normal Video
        else if (data.type === 'video') {
            bgVideo.classList.remove('hidden');
            bgVideo.src = data.url;
            bgVideo.load();
            bgVideo.play().catch(e => console.log("Otomatik oynatma engellendi"));
        } 
        // 3. Resim
        else {
            bg.classList.remove('hidden');
            bg.style.backgroundImage = `url('${data.url}')`;
        }
    };

    // Kayıtlı arka planı yükle
    window.OS.applyBackground(DB.getBg());

    // Kayıtlı Temayı (Dark/Light) Yükle
    const currentTheme = DB.getTheme();
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
    }

    // Tema Değiştirme Fonksiyonu (Settings için)
    window.OS.toggleTheme = () => {
        const isLight = document.body.classList.toggle('light-mode');
        const newMode = isLight ? 'light' : 'dark';
        window.OS.Data.setTheme(newMode);
        return newMode; 
    };

    // ---------------------------------------------------------
    // 2. GİRİŞ EKRANI (LOGIN) MANTIĞI
    // ---------------------------------------------------------
    const loginBtn = document.getElementById('loginBtn');
    if(loginBtn) {
        loginBtn.addEventListener('click', () => {
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            const acc = DB.getAccount();
            
            if (u === acc.user && p === acc.pass) {
                // Giriş Başarılı: Blur efektlerini kaldır
                bg.classList.remove('blurred');
                bgVideo.classList.remove('blurred');
                
                // YouTube varsa onun da blurunu kaldır
                const yt = document.getElementById('bgYoutube');
                if(yt) yt.classList.remove('blurred'); 

                // Kilit ekranını yok et
                lockScreen.style.opacity = '0';
                lockScreen.style.pointerEvents = 'none';
                
                // Masaüstünü göster
                setTimeout(() => desktop.classList.remove('hidden'), 300);
            } else {
                alert('Incorrect username or password!');
            }
        });
    }

    // ---------------------------------------------------------
    // 3. PENCERE YÖNETİMİ (WINDOW MANAGER)
    // ---------------------------------------------------------
    window.openWindow = function(appName, params = null) {
        const app = window.OS.Apps[appName];
        if(!app) return;

        const winId = `win-${appName}-${Date.now()}`;
        const win = document.createElement('div');
        win.className = 'window';
        win.id = winId;
        
        // Z-Index ayarı (En öne getir)
        win.style.zIndex = ++zIndexCounter;
        
        // Rastgele Konumlandırma
        const randX = 100 + Math.floor(Math.random() * 50);
        const randY = 50 + Math.floor(Math.random() * 50);
        win.style.top = `${randY}px`;
        win.style.left = `${randX}px`;
        
        // Varsayılan Boyut
        win.style.width = '360px';
        win.style.height = '480px';

        // Pencere HTML Yapısı
        win.innerHTML = `
            <div class="win-header">
                <div class="win-title">
                    <span style="margin-right:5px">📂</span> ${app.title}
                </div>
                <div class="win-controls">
                    <button class="win-btn btn-min" title="Küçült"></button>
                    <button class="win-btn btn-max" title="Büyüt"></button>
                    <button class="win-btn btn-close" title="Kapat"></button>
                </div>
            </div>
            <div class="win-content" style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
                ${app.render()}
            </div>
            <div class="resizer resizer-r"></div>
            <div class="resizer resizer-b"></div>
            <div class="resizer resizer-br"></div>
        `;

        windowArea.appendChild(win);
        addTaskbarItem(winId, app.title);

        // Buton Olayları
        win.querySelector('.btn-close').onclick = () => closeWindow(winId);
        win.querySelector('.btn-min').onclick = () => minimizeWindow(winId);
        win.querySelector('.btn-max').onclick = () => toggleMaximize(winId);
        win.onmousedown = () => focusWindow(winId);

        // Sürükleme ve Boyutlandırma Özelliklerini Ekle
        makeDraggable(win);
        makeResizable(win);

        // Uygulama yüklendiğinde çalışacak fonksiyonu çağır
        if (app.onLoad) app.onLoad(win, params);
    };

    // Pencere Aksiyonları
    function closeWindow(id) {
        const win = document.getElementById(id);
        if(win) win.remove();
        removeTaskbarItem(id);
    }

    function minimizeWindow(id) {
        const win = document.getElementById(id);
        if(win) {
            win.classList.add('minimized');
            updateTaskbarActive(id, false);
        }
    }

    function toggleMaximize(id) {
        const win = document.getElementById(id);
        if(win) {
            win.classList.toggle('maximized');
            focusWindow(id);
        }
    }

    function focusWindow(id) {
        const win = document.getElementById(id);
        if(!win) return;
        
        if(win.classList.contains('minimized')) win.classList.remove('minimized');
        
        zIndexCounter++;
        win.style.zIndex = zIndexCounter;

        // Taskbar her zaman en üstte kalsın diye kontrol
        if (zIndexCounter >= 990) {
            const tb = document.getElementById('taskbar');
            if(tb) tb.style.zIndex = zIndexCounter + 100;
        }
        updateTaskbarActive(id, true);
    }

    // ---------------------------------------------------------
    // 4. TASKBAR (GÖREV ÇUBUĞU) YÖNETİMİ
    // ---------------------------------------------------------
    function addTaskbarItem(winId, title) {
        const item = document.createElement('div');
        item.className = 'taskbar-item active';
        item.dataset.target = winId;
        item.innerHTML = `<span>${title}</span>`;
        item.onclick = () => {
            const win = document.getElementById(winId);
            if(win.classList.contains('minimized') || win.style.zIndex != zIndexCounter) {
                focusWindow(winId);
            } else {
                minimizeWindow(winId);
            }
        };
        
        // ÖNEMLİ: İkonları 'taskbarApps' içine ekle (Yeni Tasarım İçin)
        const appsContainer = document.getElementById('taskbarApps');
        if(appsContainer) {
            appsContainer.appendChild(item);
        } else {
            // Eğer HTML güncellenmediyse eski usül (Hata önleyici)
            document.getElementById('taskbar').appendChild(item);
        }
    }

    function removeTaskbarItem(winId) {
        // Hem ana taskbar hem de apps container içinde ara
        const item = document.querySelector(`.taskbar-item[data-target="${winId}"]`);
        if(item) item.remove();
    }

    function updateTaskbarActive(winId, isActive) {
        document.querySelectorAll('.taskbar-item').forEach(i => i.classList.remove('active'));
        if(isActive) {
            const item = document.querySelector(`.taskbar-item[data-target="${winId}"]`);
            if(item) item.classList.add('active');
        }
    }

    // ---------------------------------------------------------
    // 5. SÜRÜKLEME VE BOYUTLANDIRMA (DRAG & RESIZE)
    // ---------------------------------------------------------
    function makeDraggable(elmnt) {
        const header = elmnt.querySelector('.win-header');
        let startX, startY, initialLeft, initialTop;

        header.onmousedown = function(e) {
            if(elmnt.classList.contains('maximized')) return;
            e.preventDefault();
            focusWindow(elmnt.id);
            
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = elmnt.offsetLeft;
            initialTop = elmnt.offsetTop;
            
            document.addEventListener('mousemove', elementDrag);
            document.addEventListener('mouseup', closeDragElement);
        };

        function elementDrag(e) {
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            let newTop = initialTop + dy;
            let newLeft = initialLeft + dx;
            
            if (newTop < 0) newTop = 0;
            
            elmnt.style.top = newTop + "px";
            elmnt.style.left = newLeft + "px";
        }

        function closeDragElement() {
            document.removeEventListener('mousemove', elementDrag);
            document.removeEventListener('mouseup', closeDragElement);
        }
    }

    function makeResizable(elmnt) {
        const resizers = elmnt.querySelectorAll('.resizer');
        let original_w, original_h, original_mouse_x, original_mouse_y;

        resizers.forEach(resizer => {
            resizer.addEventListener('mousedown', (e) => {
                if(elmnt.classList.contains('maximized')) return;
                e.preventDefault();
                
                original_w = parseFloat(getComputedStyle(elmnt).width);
                original_h = parseFloat(getComputedStyle(elmnt).height);
                original_mouse_x = e.pageX;
                original_mouse_y = e.pageY;
                
                const isRight = resizer.classList.contains('resizer-r') || resizer.classList.contains('resizer-br');
                const isBottom = resizer.classList.contains('resizer-b') || resizer.classList.contains('resizer-br');

                window.addEventListener('mousemove', resize);
                window.addEventListener('mouseup', stopResize);

                function resize(e) {
                    if (isRight) {
                        const w = original_w + (e.pageX - original_mouse_x);
                        if (w > 280) elmnt.style.width = w + 'px';
                    }
                    if (isBottom) {
                        const h = original_h + (e.pageY - original_mouse_y);
                        if (h > 200) elmnt.style.height = h + 'px';
                    }
                }

                function stopResize() {
                    window.removeEventListener('mousemove', resize);
                    window.removeEventListener('mouseup', stopResize);
                }
            });
        });
    }

    // ---------------------------------------------------------
    // 6. MODALLAR VE DİĞER ARAÇLAR
    // ---------------------------------------------------------
    
    // Saat Güncelleme
    setInterval(() => {
        const c = document.getElementById('clock');
        if(c) c.innerText = new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
    }, 1000);
    
    // Modal Kontrolleri (Create / Forgot)
    const btnCreate = document.getElementById('openCreate');
    const btnForgot = document.getElementById('openForgot');
    const createModal = document.getElementById('createModal');
    const forgotModal = document.getElementById('forgotModal');

    if(btnCreate) {
        btnCreate.addEventListener('click', () => {
            modalOverlay.classList.remove('hidden'); 
            createModal.classList.remove('hidden');  
            forgotModal.classList.add('hidden');     
        }); 
    }

    if(btnForgot) {
        btnForgot.addEventListener('click', () => {
            modalOverlay.classList.remove('hidden'); 
            forgotModal.classList.remove('hidden');  
            createModal.classList.add('hidden');     
        });
    }
    
    document.querySelectorAll('.btn-cancel').forEach(b => b.onclick = () => {
        modalOverlay.classList.add('hidden');
        createModal.classList.add('hidden');
        forgotModal.classList.add('hidden');
    });

    // ---------------------------------------------------------
    // 7. MASAÜSTÜ İKON YÖNETİMİ
    // ---------------------------------------------------------
    window.OS.refreshIcons = () => {
        const iconsDiv = document.getElementById('icons');
        if(!iconsDiv) return;
        
        iconsDiv.innerHTML = ''; 

        // 1. Tüm Uygulamalar Listesi
        let allApps = [
            { id: 'app-notes', type: 'app', appName: 'notes', title: 'Notes', icon: '📝' },
            { id: 'app-browser', type: 'app', appName: 'browser', title: 'Browser', icon: '🌐' },
            { id: 'app-settings', type: 'app', appName: 'settings', title: 'Settings', icon: '⚙️' },
            { id: 'app-terminal', type: 'app', appName: 'terminal', title: 'Terminal', icon: '💻' },
            { id: 'app-calculator', type: 'app', appName: 'calculator', title: 'Calculator', icon: '🧮' },
            { id: 'app-todo', type: 'app', appName: 'todo', title: 'Tasks Pro', icon: '✅' },
        ];

        // 2. Kullanıcı Notlarını Listeye Ekle
        const savedNotes = DB.getNotes();
        savedNotes.forEach(note => {
            allApps.push({
                id: note.id,
                type: 'note',
                appName: 'notes',
                title: note.title,
                icon: '📄',
                params: note.id
            });
        });

        // 3. Sıralamayı Uygula
        const savedOrder = DB.getIconOrder();
        if (savedOrder && savedOrder.length > 0) {
            allApps.sort((a, b) => {
                let indexA = savedOrder.indexOf(a.id);
                let indexB = savedOrder.indexOf(b.id);
                if (indexA === -1) indexA = 9999;
                if (indexB === -1) indexB = 9999;
                return indexA - indexB;
            });
        }

        // 4. İkonları Oluştur ve Ekrana Bas
        allApps.forEach(app => {
            const icon = document.createElement('div');
            icon.className = 'app-icon';
            icon.draggable = true;
            icon.id = app.id; 
            icon.dataset.app = app.appName; 
            
            if(app.type === 'note') icon.classList.add('dynamic-note');

            icon.innerHTML = `<div class="icon-img">${app.icon}</div><span>${app.title}</span>`;

            icon.addEventListener('dblclick', () => {
                window.openWindow(app.appName, app.params || null);
            });

            setupDragDrop(icon); // Sürükle bırak özelliğini bağla
            iconsDiv.appendChild(icon);
        });
    };

    // İkon Sürükle-Bırak Mantığı
    let draggedItem = null;
    function setupDragDrop(item) {
        item.addEventListener('dragstart', function(e) {
            draggedItem = item;
            setTimeout(() => item.style.opacity = '0.5', 0);
        });

        item.addEventListener('dragend', function() {
            setTimeout(() => {
                item.style.opacity = '1';
                draggedItem = null;
                saveCurrentOrder(); // Yeni sırayı kaydet
            }, 0);
        });

        item.addEventListener('dragover', function(e) { e.preventDefault(); });
        item.addEventListener('dragenter', function(e) {
            e.preventDefault();
            this.style.transform = 'scale(1.1)'; 
            this.style.transition = '0.2s';
        });
        item.addEventListener('dragleave', function() { this.style.transform = 'scale(1)'; });
        
        item.addEventListener('drop', function() {
            this.style.transform = 'scale(1)';
            if (this !== draggedItem) {
                let allIcons = Array.from(document.querySelectorAll('.app-icon'));
                let draggedIdx = allIcons.indexOf(draggedItem);
                let droppedIdx = allIcons.indexOf(this);
                const container = document.getElementById('icons');
                
                if (draggedIdx < droppedIdx) container.insertBefore(draggedItem, this.nextSibling);
                else container.insertBefore(draggedItem, this);
            }
        });
    }

    function saveCurrentOrder() {
        const icons = document.querySelectorAll('.app-icon');
        const orderList = Array.from(icons).map(icon => icon.id);
        window.OS.Data.saveIconOrder(orderList);
    }

    // Başlangıçta ikonları yükle
    window.OS.refreshIcons();

    // ---------------------------------------------------------
// --- 8. SES KONTROLÜ (GÜÇLENDİRİLMİŞ) ---
    const volSlider = document.getElementById('globalVolume');
    if(volSlider) {
        volSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            const decimalVal = val / 100;

            // 1. Normal Video Sesi
            if(bgVideo) bgVideo.volume = decimalVal;

            // 2. YouTube Sesi
            const bgYoutube = document.getElementById('bgYoutube');
            if(bgYoutube && !bgYoutube.classList.contains('hidden')) {
                // Iframe yüklü mü kontrol et
                if (bgYoutube.contentWindow) {
                    // Sesi açıyorsak önce unMute yolla
                    if (val > 0) {
                        bgYoutube.contentWindow.postMessage(JSON.stringify({
                            "event": "command",
                            "func": "unMute",
                            "args": []
                        }), "*");
                    } else {
                        bgYoutube.contentWindow.postMessage(JSON.stringify({
                            "event": "command",
                            "func": "mute",
                            "args": []
                        }), "*");
                    }
                    
                    // Sonra ses seviyesini ayarla
                    bgYoutube.contentWindow.postMessage(JSON.stringify({ 
                        "event": "command", 
                        "func": "setVolume", 
                        "args": [val] 
                    }), "*");
                }
            }
        });
    }
}); // <-- Dosyanın en sonundaki kapanış parantezi burası olmalı