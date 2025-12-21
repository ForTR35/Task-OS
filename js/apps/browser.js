/* File: js/apps/browser.js */
(function() {
    window.OS.Apps.browser = {
        title: 'Browser',
        
        render: () => `
            <div class="browser-app">
                <div class="browser-tabs">
                    <div class="browser-tab active">
                        <span class="tab-icon">🌐</span>
                        <span class="tab-title" id="browserTabTitle">New Tab</span>
                        <span class="tab-close">×</span>
                    </div>
                    <div class="browser-tab-add">+</div>
                </div>

                <div class="browser-toolbar">
                    <button class="nav-btn" id="btnBack">⬅</button>
                    <button class="nav-btn" id="btnForward">➡</button>
                    <button class="nav-btn" id="btnReload">↻</button>
                    <button class="nav-btn" id="btnHome">🏠</button>
                    
                    <div class="address-bar-container">
                        <input type="text" class="address-input" id="addressInput" placeholder="Search or type a URL">
                    </div>
                </div>

                <div class="browser-content">
                    <iframe id="browserFrame" src="about:blank" sandbox="allow-forms allow-scripts allow-same-origin allow-popups"></iframe>
                </div>
            </div>
        `,

        onLoad: (win) => {
            const frame = win.querySelector('#browserFrame');
            const input = win.querySelector('#addressInput');
            const tabTitle = win.querySelector('#browserTabTitle');

            // --- ANA SAYFA (HTML Olarak Oluşturuyoruz) ---
            const homePage = `
                data:text/html;charset=utf-8,
                <style>
                    body { font-family: 'Segoe UI', sans-serif; background: #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                    h1 { color: #333; font-size: 40px; margin-bottom: 20px; }
                    .search-box { width: 80%; max-width: 500px; padding: 15px; border-radius: 30px; border: 1px solid #ddd; font-size: 16px; outline: none; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .shortcuts { display: flex; gap: 20px; margin-top: 40px; }
                    .card { background: white; padding: 20px; border-radius: 10px; text-align: center; width: 80px; cursor: pointer; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-decoration:none; color:black; }
                    .card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
                    .icon { font-size: 30px; margin-bottom: 10px; display:block; }
                </style>
                <h1>Web OS</h1>
                <input class="search-box" placeholder="Search the web..." onkeydown="if(event.key==='Enter'){window.location.href='https://www.bing.com/search?q='+this.value}">
                <div class="shortcuts">
                    <a class="card" href="https://www.wikipedia.org" onclick="return true;">
                        <span class="icon">📚</span> Wikipedia
                    </a>
                    <a class="card" href="https://www.bing.com" onclick="return true;">
                        <span class="icon">🔍</span> Bing
                    </a>
                    <a class="card" href="https://vscode.dev" onclick="return true;">
                        <span class="icon">💻</span> VS Code
                    </a>
                    <a class="card" href="https://poki.com" onclick="return true;">
                        <span class="icon">🎮</span> Games
                    </a>
                </div>
            `;

            // Sayfa Yükleme Fonksiyonu
            const loadURL = (url) => {
                let target = url;
                
                // Eğer "http" ile başlamıyorsa ve boşluk içeriyorsa ARAMA yap
                if (!target.startsWith('http') && !target.startsWith('data:')) {
                    if (target.includes('.') && !target.includes(' ')) {
                        target = 'https://' + target;
                    } else {
                        // Google, Iframe'i engeller. Bing izin verir.
                        target = 'https://www.bing.com/search?q=' + encodeURIComponent(target);
                    }
                }

                frame.src = target;
                input.value = target.startsWith('data:') ? '' : target;
                tabTitle.innerText = "Loading...";
            };

            // Iframe Yüklendiğinde Başlığı Güncelle
            frame.onload = () => {
                try {
                    // Not: Cross-Origin hatası vermemesi için try-catch
                    tabTitle.innerText = "Browser"; 
                } catch(e) {}
            };

            // Buton Olayları
            win.querySelector('#btnBack').onclick = () => { try { frame.contentWindow.history.back(); } catch(e){} };
            win.querySelector('#btnForward').onclick = () => { try { frame.contentWindow.history.forward(); } catch(e){} };
            win.querySelector('#btnReload').onclick = () => { try { frame.contentWindow.location.reload(); } catch(e){ frame.src = frame.src; } };
            win.querySelector('#btnHome').onclick = () => loadURL(homePage);

            // Adres Çubuğu Enter
            input.addEventListener('keydown', (e) => {
                if(e.key === 'Enter') loadURL(input.value);
            });

            // Başlangıçta Ana Sayfayı Aç
            loadURL(homePage);
        }
    };
})();