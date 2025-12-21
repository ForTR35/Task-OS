/* File: js/apps/settings.js */
(function() {
    window.OS.Apps.settings = {
        title: 'Settings',
        
        render: () => `
            <div class="settings-layout">
                <div class="settings-sidebar">
                    <button class="settings-btn active" onclick="OS.Apps.settings.switchTab(this, 'tab-themes')">Appearance</button>
                    <button class="settings-btn" onclick="OS.Apps.settings.switchTab(this, 'tab-account')">Account</button>
                </div>

                <div class="settings-panel" id="tab-themes">
                    <h3>System Theme</h3>
                    
                    <div class="settings-actions">
                        <button id="btnDarkTheme" class="panel-btn">🌙 Dark Theme</button>
                        <button id="btnLightTheme" class="panel-btn">☀️ Light Theme</button>
                    </div>

                    <hr style="margin: 20px 0; border: 0; border-top: 1px solid var(--win-border); opacity: 0.5;">

                    <h3>Background Gallery</h3>
                    
                    <div class="settings-group">
                        <label style="font-size:0.85rem; opacity:0.8; margin-bottom:5px; display:block;">Yöntem 1: Dosya Yükle (Max 3MB)</label>
                        <label class="custom-file-upload" style="width:100%; text-align:center;">
                            <input type="file" id="themeUploader" accept="image/*,video/*">
                            📂 Bilgisayardan Seç
                        </label>
                    </div>

                    <div class="settings-group" style="margin-top:15px;">
                        <label style="font-size:0.85rem; opacity:0.8; margin-bottom:5px; display:block;">Yöntem 2: Link ile Ekle (Sınırsız)</label>
                        <div style="display:flex; gap:10px;">
                            <input type="text" id="urlInput" placeholder="https://... (Resim veya Video Linki)" style="margin:0;">
                            <button id="btnAddUrl" class="btn-save" style="width:auto; margin:0; white-space:nowrap;">Link Ekle</button>
                        </div>
                        <small style="opacity:0.5; font-size:0.7rem;">Örn: .jpg, .png veya .mp4 ile biten linkler</small>
                    </div>

                    <div class="theme-grid" id="themeGrid"></div>
                </div>

                <div class="settings-panel hidden" id="tab-account">
                    <h3>Account Security</h3>
                    <div class="settings-group">
                        <label>Update Username:</label>
                        <input type="text" id="editUser">
                    </div>
                    <div class="settings-group">
                        <label>Update Password:</label>
                        <input type="text" id="editPass">
                    </div>
                    <button class="panel-btn" id="saveAccount" style="width:100%;">Update Account</button>
                </div>
            </div>
        `,

        onLoad: (winElement) => {
            const DB = window.OS.Data;
            const uploader = winElement.querySelector('#themeUploader');
            const grid = winElement.querySelector('#themeGrid');
            
            // Link Elementleri
            const urlInput = winElement.querySelector('#urlInput');
            const btnAddUrl = winElement.querySelector('#btnAddUrl');

            // --- TEMA MODU ---
            const btnDark = winElement.querySelector('#btnDarkTheme');
            const btnLight = winElement.querySelector('#btnLightTheme');

            const updateThemeUI = () => {
                if (document.body.classList.contains('light-mode')) {
                    btnLight.classList.add('active-theme');
                    btnDark.classList.remove('active-theme');
                } else {
                    btnDark.classList.add('active-theme');
                    btnLight.classList.remove('active-theme');
                }
            };
            updateThemeUI();

            btnDark.onclick = () => {
                document.body.classList.remove('light-mode');
                window.OS.Data.setTheme('dark');
                updateThemeUI();
            };
            btnLight.onclick = () => {
                document.body.classList.add('light-mode');
                window.OS.Data.setTheme('light');
                updateThemeUI();
            };

            // --- 1. DOSYA YÜKLEME (Eski Yöntem) ---
            uploader.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                // Boyut Kontrolü (3MB üzeri uyarısı)
                if(file.size > 3000000) {
                    alert("Dosya çok büyük! Lütfen 'Link ile Ekle' yöntemini kullanın.");
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(evt) {
                    const result = evt.target.result;
                    const type = file.type.startsWith('video') ? 'video' : 'image';
                    if(DB.addTheme({ type: type, url: result, name: file.name })) {
                        refreshGrid();
                    }
                };
                reader.readAsDataURL(file);
            });

           // --- 2. LİNK İLE EKLEME (YouTube Destekli) ---
            btnAddUrl.onclick = () => {
                let url = urlInput.value.trim();
                if(!url) return alert("Lütfen bir link yapıştırın.");
                
                let type = 'image';
                let name = 'Web Link';

                // A. YouTube Linki Kontrolü
                if (url.includes('youtube.com') || url.includes('youtu.be')) {
                    type = 'youtube';
                    name = 'YouTube Video';
                    
                    // Video ID'sini çek (Regex ile)
                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                    const match = url.match(regExp);

                    if (match && match[2].length === 11) {
                        const videoId = match[2];
                        // Arka plan için özel embed linki oluştur (Sessiz, Otomatik, Döngü)
                       // mute=0 yaptık çünkü sesi slider ile biz yöneteceğiz, enablejsapi=1 şart
                        url = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&loop=1&playlist=${videoId}&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1`;
                    } else {
                        return alert("Geçersiz YouTube linki!");
                    }
                }
                // B. Normal Video Kontrolü
                else if (url.match(/\.(mp4|webm|ogg)$/i)) {
                    type = 'video';
                    name = 'Video File';
                }

                // Kaydet
                const success = DB.addTheme({ 
                    type: type, 
                    url: url, 
                    name: name 
                });

                if(success) {
                    refreshGrid();
                    urlInput.value = '';
                }
            };

            // --- GALERİ ---
            function refreshGrid() {
                grid.innerHTML = '';
                const themes = DB.getThemes();

                // Varsayılan
                const defaultItem = document.createElement('div');
                defaultItem.className = 'theme-item';
                defaultItem.innerHTML = `<div style="width:100%;height:100%;background:linear-gradient(135deg,#334155,#1e293b);display:flex;justify-content:center;align-items:center;font-size:24px;color:#94a3b8;">∅</div><div class="theme-name">Varsayılan</div>`;
                defaultItem.onclick = () => {
                    DB.setBg('image', ''); 
                    if(window.OS.applyBackground) window.OS.applyBackground({ type: 'image', url: '' });
                    highlightSelected(defaultItem);
                };
                grid.appendChild(defaultItem);

                themes.forEach((theme, index) => {
                    const item = document.createElement('div');
                    item.className = 'theme-item';
                    let mediaHtml = theme.type === 'video' 
                        ? `<video src="${theme.url}" muted></video>` 
                        : `<img src="${theme.url}">`;
                    
                    item.innerHTML = `${mediaHtml}<div class="theme-name">${theme.name}</div><button class="theme-delete">×</button>`;

                    item.onclick = (e) => {
                        if(e.target.className === 'theme-delete') {
                             if(confirm('Silinsin mi?')) { DB.removeTheme(index); refreshGrid(); }
                        } else {
                            DB.setBg(theme.type, theme.url);
                            if(window.OS.applyBackground) window.OS.applyBackground(theme);
                            highlightSelected(item);
                        }
                    };
                    grid.appendChild(item);
                });
            }

            function highlightSelected(selectedItem) {
                grid.querySelectorAll('.theme-item').forEach(i => i.classList.remove('selected'));
                selectedItem.classList.add('selected');
            }

            refreshGrid();

            // Account
            winElement.querySelector('#saveAccount').addEventListener('click', () => {
                const u = winElement.querySelector('#editUser').value.trim();
                const p = winElement.querySelector('#editPass').value.trim();
                if(u && p) { DB.setAccount(u, p); alert('Güncellendi! Lütfen tekrar giriş yapın.'); }
                else alert('Alanları doldurun.');
            });
        },

        switchTab: (btn, tabId) => {
            const sidebar = btn.parentElement;
            const layout = sidebar.parentElement;
            sidebar.querySelectorAll('.settings-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            layout.querySelectorAll('.settings-panel').forEach(p => p.classList.add('hidden'));
            layout.querySelector(`#${tabId}`).classList.remove('hidden');
        }
    };
})();