(function() {
    // Register the app to the OS
    window.OS.Apps.settings = {
        title: 'Settings',
        
        // The HTML content of the window
        render: () => `
            <div class="settings-layout">
                <div class="settings-sidebar">
                    <button class="settings-btn active" onclick="OS.Apps.settings.switchTab(this, 'tab-themes')">Themes</button>
                    <button class="settings-btn" onclick="OS.Apps.settings.switchTab(this, 'tab-account')">Account</button>
                </div>
                <div class="settings-panel" id="tab-themes">
                    <h3>Appearance</h3>
                    <div class="settings-group">
                        <label>Background Image/Video URL:</label>
                        <input type="text" id="bgInput" placeholder="https://example.com/image.jpg">
                    </div>
                    <p class="hint">Supports .jpg, .png, .mp4, .webm</p>
                    <button class="btn-save" id="saveTheme">Save & Apply</button>
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

        // Functions to run after the window opens (Event Listeners)
        onLoad: (winElement) => {
            const DB = window.OS.Data;

            // Save Theme Button
            winElement.querySelector('#saveTheme').addEventListener('click', () => {
                const url = winElement.querySelector('#bgInput').value.trim();
                if(!url) return;

                const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
                const type = isVideo ? 'video' : 'image';

                DB.setBg(type, url);
                // We call a global function to update BG instantly (defined in system.js)
                if(window.OS.applyBackground) window.OS.applyBackground({ type, url });
                alert('Background updated!');
            });

            // Save Account Button
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

        // Tab Switching Logic
        switchTab: (btn, tabId) => {
            // Find parent elements relative to the clicked button
            const sidebar = btn.parentElement;
            const layout = sidebar.parentElement;
            
            sidebar.querySelectorAll('.settings-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            layout.querySelectorAll('.settings-panel').forEach(p => p.classList.add('hidden'));
            layout.querySelector(`#${tabId}`).classList.remove('hidden');
        }
    };
})();
