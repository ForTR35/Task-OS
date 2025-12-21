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
                        <button id="btnDarkTheme" class="panel-btn">
                            🌙 Dark Theme
                        </button>
                        <button id="btnLightTheme" class="panel-btn">
                            ☀️ Light Theme
                        </button>
                    </div>

                    <hr style="margin: 20px 0; border: 0; border-top: 1px solid var(--win-border); opacity: 0.5;">

                    <h3>Background Gallery</h3>
                    
                    <div class="settings-group">
                        <label class="custom-file-upload" style="width:100%; text-align:center; box-sizing:border-box;">
                            <input type="file" id="themeUploader" accept="image/*,video/*">
                            📂 Dosya Seç ve Yükle
                        </label>
                    </div>

                    <div class="theme-grid" id="themeGrid">
                    </div>
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
                    
                    <button class="panel-btn" id="saveAccount" style="width:100%;">
                        Update Account
                    </button>
                </div>
            </div>
        `,

        onLoad: (winElement) => {
            const DB = window.OS.Data;
            const uploader = winElement.querySelector('#themeUploader');
            const grid = winElement.querySelector('#themeGrid');

            // --- YENİ TEMA BUTONLARI MANTIĞI ---
            const btnDark = winElement.querySelector('#btnDarkTheme');
            const btnLight = winElement.querySelector('#btnLightTheme');

            // Dark Mode Butonu
            btnDark.onclick = () => {
                document.body.classList.remove('light-mode');
                window.OS.Data.setTheme('dark');
                // Görsel geri bildirim (Opsiyonel)
                btnDark.classList.add('active-theme');
                btnLight.classList.remove('active-theme');
            };

            // Light Mode Butonu
            btnLight.onclick = () => {
                document.body.classList.add('light-mode');
                window.OS.Data.setTheme('light');
                // Görsel geri bildirim
                btnLight.classList.add('active-theme');
                btnDark.classList.remove('active-theme');
            };

            // Açılışta hangi moddaysa o butonu aktif göster
            if (document.body.classList.contains('light-mode')) {
                btnLight.classList.add('active-theme');
            } else {
                btnDark.classList.add('active-theme');
            }
            // -------------------------------------

            // 1. Dosya Yükleme
            uploader.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = function(evt) {
                    const result = evt.target.result;
                    const type = file.type.startsWith('video') ? 'video' : 'image';
                    
                    DB.addTheme({ type: type, url: result, name: file.name });
                    refreshGrid();
                };
                reader.readAsDataURL(file);
            });

            // 2. Galeri Oluşturma
            function refreshGrid() {
                grid.innerHTML = '';
                const themes = DB.getThemes();

                // Varsayılan Seçeneği
                const defaultItem = document.createElement('div');
                defaultItem.className = 'theme-item';
                defaultItem.innerHTML = `
                    <div style="width:100%; height:100%; background: linear-gradient(135deg, #334155, #1e293b); display:flex; justify-content:center; align-items:center; color:#94a3b8; font-size:24px;">
                        ∅
                    </div>
                    <div class="theme-name">Varsayılan</div>
                `;
                
                defaultItem.onclick = () => {
                    DB.setBg('image', ''); 
                    if(window.OS.applyBackground) window.OS.applyBackground({ type: 'image', url: '' });
                    
                    grid.querySelectorAll('.theme-item').forEach(i => i.classList.remove('selected'));
                    defaultItem.classList.add('selected');
                };
                grid.appendChild(defaultItem);

                if(themes.length > 0) {
                    themes.forEach((theme, index) => {
                        const item = document.createElement('div');
                        item.className = 'theme-item';
                        
                        let mediaHtml = theme.type === 'video' 
                            ? `<video src="${theme.url}" muted></video>` 
                            : `<img src="${theme.url}">`;

                        item.innerHTML = `
                            ${mediaHtml}
                            <div class="theme-name">${theme.name}</div>
                            <button class="theme-delete" title="Sil">×</button>
                        `;

                        item.addEventListener('click', (e) => {
                            if(e.target.classList.contains('theme-delete')) return;
                            
                            DB.setBg(theme.type, theme.url);
                            if(window.OS.applyBackground) window.OS.applyBackground(theme);
                            
                            grid.querySelectorAll('.theme-item').forEach(i => i.classList.remove('selected'));
                            item.classList.add('selected');
                        });

                        item.querySelector('.theme-delete').addEventListener('click', () => {
                            if(confirm('Silmek istiyor musun?')) {
                                DB.removeTheme(index);
                                refreshGrid();
                            }
                        });

                        grid.appendChild(item);
                    });
                }
            }

            refreshGrid();

            // Account Kaydetme
            winElement.querySelector('#saveAccount').addEventListener('click', () => {
                const u = winElement.querySelector('#editUser').value.trim();
                const p = winElement.querySelector('#editPass').value.trim();
                if(u && p) {
                    DB.setAccount(u, p);
                    alert('Hesap güncellendi! Lütfen tekrar giriş yapın.');
                } else {
                    alert('Lütfen tüm alanları doldurun.');
                }
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