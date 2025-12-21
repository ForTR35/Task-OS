/* File: js/system.js */

document.addEventListener('DOMContentLoaded', () => {

    // ... (DOM Elements tanımları) ...
    const DB = window.OS.Data;

    // --- 0. TEMA YÜKLEME ---
    const currentTheme = DB.getTheme();
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
    }

    // ... (Geri kalan kodlar aynen devam etsin) ...
    // --- DOM ELEMENTS ---
    const bg = document.getElementById('bg');
    const bgVideo = document.getElementById('bgVideo');
    const lockScreen = document.getElementById('lockScreen');
    const desktop = document.getElementById('desktop');
    const modalOverlay = document.getElementById('modalOverlay');
    const windowArea = document.getElementById('windowArea');

    // Taskbar Oluştur
    let taskbar = document.getElementById('taskbar');
    if (!taskbar) {
        taskbar = document.createElement('div');
        taskbar.id = 'taskbar';
        taskbar.className = 'taskbar';
        document.body.appendChild(taskbar);
    }

    let zIndexCounter = 100;

    // --- 1. GLOBAL HELPERS & BACKGROUND ---
    window.OS.applyBackground = (data) => {
        // EĞER URL YOKSA -> Varsayılan CSS Gradient'e Dön
        if (!data || !data.url) {
            bg.style.backgroundImage = ''; // Inline stili sil (CSS'deki gradient görünür)
            bg.classList.remove('hidden');
            bgVideo.classList.add('hidden');
            bgVideo.src = ""; // Videoyu boşa düşür
            return;
        }

        // URL VARSA -> Uygula
        if (data.type === 'video') {
            bg.classList.add('hidden');
            bgVideo.classList.remove('hidden');
            bgVideo.src = data.url;
            bgVideo.load();
            bgVideo.play().catch(e => console.log("Otomatik oynatma engellendi"));
        } else {
            bgVideo.classList.add('hidden');
            bg.classList.remove('hidden');
            bg.style.backgroundImage = `url('${data.url}')`;
        }
    };
    window.OS.applyBackground(DB.getBg());

    // --- 2. LOGIN LOGIC ---
    const loginBtn = document.getElementById('loginBtn');
    if(loginBtn) {
        loginBtn.addEventListener('click', () => {
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            const acc = DB.getAccount();
            if (u === acc.user && p === acc.pass) {
                bg.classList.remove('blurred');
                bgVideo.classList.remove('blurred');
                lockScreen.style.opacity = '0';
                lockScreen.style.pointerEvents = 'none';
                setTimeout(() => desktop.classList.remove('hidden'), 300);
            } else {
                alert('Incorrect username or password!');
            }
        });
    }
    // --- TEMA DEĞİŞTİRİCİ ---
    window.OS.toggleTheme = () => {
        const isLight = document.body.classList.toggle('light-mode');
        const newMode = isLight ? 'light' : 'dark';
        window.OS.Data.setTheme(newMode);
        return newMode; // 'light' veya 'dark' döndürür
    };

    // --- 3. WINDOW MANAGER SYSTEM ---
        window.openWindow = function(appName, params = null) { // params eklendi
        const app = window.OS.Apps[appName];
        if(!app) return;

        const winId = `win-${appName}-${Date.now()}`;
        const win = document.createElement('div');
        win.className = 'window';
        win.id = winId;
        win.style.zIndex = ++zIndexCounter;
        
        // Rastgele Başlangıç Konumu
        const randX = 100 + Math.floor(Math.random() * 50);
        const randY = 50 + Math.floor(Math.random() * 50);
        win.style.top = `${randY}px`;
        win.style.left = `${randX}px`;
        
        // Varsayılan Boyut
        win.style.width = '360px';
        win.style.height = '480px';

        // HTML Yapısı
        win.innerHTML = `
            <div class="win-header">
                <div class="win-title">
                    <span style="margin-right:5px">📂</span> ${app.title}
                </div>
                <div class="win-controls">
                    <button class="win-btn btn-min" title="Minimize"></button>
                    <button class="win-btn btn-max" title="Maximize"></button>
                    <button class="win-btn btn-close" title="Close"></button>
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

        // Event Listeners
        win.querySelector('.btn-close').onclick = () => closeWindow(winId);
        win.querySelector('.btn-min').onclick = () => minimizeWindow(winId);
        win.querySelector('.btn-max').onclick = () => toggleMaximize(winId);
        win.onmousedown = () => focusWindow(winId);

        // --- YENİ OPTİMİZE EDİLMİŞ SÜRÜKLEME ---
        makeDraggable(win);
        makeResizable(win);

        if (app.onLoad) app.onLoad(win, params); // params gönderiyoruz
    };

    // --- WINDOW ACTIONS ---
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
        
        // Z-Index Yönetimi
        zIndexCounter++;
        win.style.zIndex = zIndexCounter;

        // Pencereler Taskbar'ın üstüne çıkarsa Taskbar'ı da yükselt
        if (zIndexCounter >= 990) {
            const tb = document.getElementById('taskbar');
            if(tb) tb.style.zIndex = zIndexCounter + 100;
        }

        updateTaskbarActive(id, true);
    }

    // --- TASKBAR ACTIONS ---
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
        taskbar.appendChild(item);
    }

    function removeTaskbarItem(winId) {
        const item = taskbar.querySelector(`[data-target="${winId}"]`);
        if(item) item.remove();
    }

    function updateTaskbarActive(winId, isActive) {
        document.querySelectorAll('.taskbar-item').forEach(i => i.classList.remove('active'));
        if(isActive) {
            const item = taskbar.querySelector(`[data-target="${winId}"]`);
            if(item) item.classList.add('active');
        }
    }

    // --- OPTİMİZE EDİLMİŞ SÜRÜKLEME (DRAG) ---
    function makeDraggable(elmnt) {
        const header = elmnt.querySelector('.win-header');
        let startX, startY, initialLeft, initialTop;

        header.onmousedown = function(e) {
            if(elmnt.classList.contains('maximized')) return;
            
            e.preventDefault();
            focusWindow(elmnt.id);
            
            // Başlangıç değerlerini kaydet
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = elmnt.offsetLeft;
            initialTop = elmnt.offsetTop;

            // Global event listener ekle (Daha güvenli ve hızlı)
            document.addEventListener('mousemove', elementDrag);
            document.addEventListener('mouseup', closeDragElement);
        };

        function elementDrag(e) {
            e.preventDefault();
            // Yeni konumu hesapla
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            let newTop = initialTop + dy;
            let newLeft = initialLeft + dx;

            // Sınır Kontrolü: Pencerenin en tepeye yapışıp kaybolmasını önle
            if (newTop < 0) newTop = 0;

            elmnt.style.top = newTop + "px";
            elmnt.style.left = newLeft + "px";
        }

        function closeDragElement() {
            // İşlem bitince dinleyicileri temizle (Performans için önemli)
            document.removeEventListener('mousemove', elementDrag);
            document.removeEventListener('mouseup', closeDragElement);
        }
    }

    // --- RESIZE LOGIC ---
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

    // --- CLOCK & ICONS ---
    document.querySelectorAll('.app-icon').forEach(icon => {
        icon.addEventListener('dblclick', function() {
            window.openWindow(this.getAttribute('data-app'));
        });
    });

    setInterval(() => {
        const c = document.getElementById('clock');
        if(c) c.innerText = new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
    }, 1000);
    
// --- MODALS (HATA DÜZELTİLDİ) ---
    const btnCreate = document.getElementById('openCreate');
    const btnForgot = document.getElementById('openForgot');
    const createModal = document.getElementById('createModal');
    const forgotModal = document.getElementById('forgotModal');

    // Create Account Tuşuna Basılınca
    if(btnCreate) {
        btnCreate.addEventListener('click', () => {
            modalOverlay.classList.remove('hidden'); // Perdeyi aç
            createModal.classList.remove('hidden');  // Create kutusunu göster
            forgotModal.classList.add('hidden');     // Diğerini gizle (garanti olsun)
        }); 
    }

    // Forgot Password Tuşuna Basılınca
    if(btnForgot) {
        btnForgot.addEventListener('click', () => {
            modalOverlay.classList.remove('hidden'); // Perdeyi aç
            forgotModal.classList.remove('hidden');  // Forgot kutusunu göster
            createModal.classList.add('hidden');     // Diğerini gizle
        });
    }
    
    // Cancel Tuşuna Basılınca Hepsini Kapat
    document.querySelectorAll('.btn-cancel').forEach(b => b.onclick = () => {
        modalOverlay.classList.add('hidden');
        createModal.classList.add('hidden');
        forgotModal.classList.add('hidden');
    });

// --- MASAÜSTÜ İKON YÖNETİMİ VE SÜRÜKLEME ---
    window.OS.refreshIcons = () => {
        const iconsDiv = document.getElementById('icons');
        iconsDiv.innerHTML = ''; // Her şeyi temizle (Statik + Dinamik)

        const DB = window.OS.Data;

        // 1. Tüm Uygulamaları Tanımla (Statik Olanlar Buraya)
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
                id: note.id, // Notun kendi ID'si (örn: note-17482...)
                type: 'note',
                appName: 'notes', // Açılacak uygulama
                title: note.title,
                icon: '📄',
                params: note.id // Parametre olarak ID gönderilecek
            });
        });

        // 3. Kayıtlı Sıralamayı Kontrol Et ve Sırala
        const savedOrder = DB.getIconOrder();
        if (savedOrder && savedOrder.length > 0) {
            allApps.sort((a, b) => {
                let indexA = savedOrder.indexOf(a.id);
                let indexB = savedOrder.indexOf(b.id);
                
                // Eğer listede yoksa (yeni eklenmişse) en sona at
                if (indexA === -1) indexA = 9999;
                if (indexB === -1) indexB = 9999;
                
                return indexA - indexB;
            });
        }

        // 4. İkonları Ekrana Bas
        allApps.forEach(app => {
            const icon = document.createElement('div');
            icon.className = 'app-icon';
            icon.draggable = true; // Sürüklenebilir yap
            icon.id = app.id; // Sıralama için ID şart
            icon.dataset.app = app.appName; // Çift tıklama için
            
            // Eğer not ise özel sınıf ekle (görünüm için istersen)
            if(app.type === 'note') icon.classList.add('dynamic-note');

            icon.innerHTML = `
                <div class="icon-img">${app.icon}</div>
                <span>${app.title}</span>
            `;

            // Çift Tıklama
            icon.addEventListener('dblclick', () => {
                window.openWindow(app.appName, app.params || null);
            });

            // Sürükle Bırak Olaylarını Bağla
            setupDragDrop(icon);

            iconsDiv.appendChild(icon);
        });
    };

    // --- SÜRÜKLE BIRAK MANTIĞI ---
    let draggedItem = null;

    function setupDragDrop(item) {
        item.addEventListener('dragstart', function(e) {
            draggedItem = item;
            setTimeout(() => item.style.opacity = '0.5', 0); // Sürüklerken şeffaflaştır
        });

        item.addEventListener('dragend', function() {
            setTimeout(() => {
                item.style.opacity = '1';
                draggedItem = null;
                saveCurrentOrder(); // Bıraktıktan sonra sırayı kaydet
            }, 0);
        });

        item.addEventListener('dragover', function(e) {
            e.preventDefault(); // Bırakmaya izin ver
        });

        item.addEventListener('dragenter', function(e) {
            e.preventDefault();
            this.style.transform = 'scale(1.1)'; // Üzerine gelince büyüsün
            this.style.transition = '0.2s';
        });

        item.addEventListener('dragleave', function() {
            this.style.transform = 'scale(1)'; // Çıkınca normale dönsün
        });

        item.addEventListener('drop', function() {
            this.style.transform = 'scale(1)';
            if (this !== draggedItem) {
                // DOM içinde yer değiştir
                let allIcons = Array.from(document.querySelectorAll('.app-icon'));
                let draggedIdx = allIcons.indexOf(draggedItem);
                let droppedIdx = allIcons.indexOf(this);

                const container = document.getElementById('icons');
                
                if (draggedIdx < droppedIdx) {
                    container.insertBefore(draggedItem, this.nextSibling);
                } else {
                    container.insertBefore(draggedItem, this);
                }
            }
        });
    }

    // Sıralamayı Veritabanına Kaydet
    function saveCurrentOrder() {
        const icons = document.querySelectorAll('.app-icon');
        const orderList = Array.from(icons).map(icon => icon.id);
        window.OS.Data.saveIconOrder(orderList);
    }

    // Başlangıçta çalıştır
    window.OS.refreshIcons();
});
