/* File: js/apps/settings.js */
(function() {
    window.OS.Apps.settings = {
        title: 'Settings',
        
        render: () => `
            <div class="settings-layout">
                <div class="settings-sidebar">
                    <button class="settings-btn active" onclick="OS.Apps.settings.switchTab(this, 'tab-themes')">Themes</button>
                    <button class="settings-btn" onclick="OS.Apps.settings.switchTab(this, 'tab-account')">Account</button>
                </div>

                <div class="settings-panel" id="tab-themes">
                    <h3>Background Gallery</h3>
                    
                    <div class="settings-group">
                        <label class="custom-file-upload">
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
                    <button class="btn-save" id="saveAccount">Update Account</button>
                </div>
            </div>
        `,

        onLoad: (winElement) => {
            const DB = window.OS.Data;
            const uploader = winElement.querySelector('#themeUploader');
            const grid = winElement.querySelector('#themeGrid');

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

            // 2. Galeri Oluşturma (GÜNCELLENDİ)
            function refreshGrid() {
                grid.innerHTML = '';
                const themes = DB.getThemes();

                // --- GÜNCELLEME: En Başa "Varsayılan" Seçeneği Ekle ---
                const defaultItem = document.createElement('div');
                defaultItem.className = 'theme-item';
                // Varsayılan olduğunu belli edecek bir ikon veya renk
                defaultItem.innerHTML = `
                    <div style="width:100%; height:100%; background: linear-gradient(135deg, #334155, #1e293b); display:flex; justify-content:center; align-items:center; color:#94a3b8; font-size:24px;">
                        ∅
                    </div>
                    <div class="theme-name">Varsayılan</div>
                `;
                
                defaultItem.onclick = () => {
                    // Veriyi temizle (boş string gönder)
                    DB.setBg('image', ''); 
                    if(window.OS.applyBackground) window.OS.applyBackground({ type: 'image', url: '' });
                    
                    // Seçili efekti
                    grid.querySelectorAll('.theme-item').forEach(i => i.classList.remove('selected'));
                    defaultItem.classList.add('selected');
                };
                grid.appendChild(defaultItem);
                // -------------------------------------------------------

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
                    alert('Account updated! Please login again next time.');
                } else {
                    alert('Please fill both fields.');
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