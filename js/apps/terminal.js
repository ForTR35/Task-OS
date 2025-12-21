/* File: js/apps/terminal.js */
(function() {
    window.OS.Apps.terminal = {
        title: 'Terminal',
        
        render: () => `
            <div class="terminal-app">
                <div class="terminal-output" id="termOutput">
                    <div>WebOS Kernel v2.4.1 initialized...</div>
                    <div>Copyright (c) 2025 WebOS Corp.</div>
                    <br>
                    <div>Type <span style="color:#fbbf24">'help'</span> to see all 25+ commands.</div>
                    <br>
                </div>
                <div class="terminal-input-line">
                    <span class="prompt" id="termPrompt">root@webos:~$</span>
                    <input type="text" class="terminal-input" id="termInput" autocomplete="off" autofocus>
                </div>
            </div>
        `,

        onLoad: (win) => {
            const output = win.querySelector('#termOutput');
            const input = win.querySelector('#termInput');
            const body = win.querySelector('.terminal-app');
            const promptEl = win.querySelector('#termPrompt');
            
            // Kullanıcı adını al
            const user = window.OS.Data.getAccount().user || 'root';
            promptEl.innerText = `${user}@webos:~$`;

            // Odaklanma
            body.addEventListener('click', () => input.focus());

            // Komut Geçmişi
            let history = [];
            let historyIndex = -1;

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const command = input.value.trim();
                    if (command) {
                        history.push(command);
                        historyIndex = history.length;
                        
                        print(`${promptEl.innerText} ${command}`);
                        processCommand(command);
                    }
                    input.value = '';
                    scrollToBottom();
                } else if (e.key === 'ArrowUp') {
                    if (historyIndex > 0) {
                        historyIndex--;
                        input.value = history[historyIndex];
                    }
                    e.preventDefault();
                } else if (e.key === 'ArrowDown') {
                    if (historyIndex < history.length - 1) {
                        historyIndex++;
                        input.value = history[historyIndex];
                    } else {
                        historyIndex = history.length;
                        input.value = '';
                    }
                    e.preventDefault();
                }
            });

            function scrollToBottom() {
                output.scrollTop = output.scrollHeight;
            }

            function print(text, color = null, isHtml = false) {
                const line = document.createElement('div');
                if(isHtml) line.innerHTML = text;
                else line.textContent = text;
                
                if(color) line.style.color = color;
                output.appendChild(line);
                scrollToBottom();
            }

            // --- KOMUT İŞLEYİCİ ---
            function processCommand(cmd) {
                const args = cmd.split(' ');
                const mainCmd = args[0].toLowerCase();
                const param = args.slice(1).join(' ');

                switch (mainCmd) {
                    // --- TEMEL ---
                    case 'help':
                        print('=== SYSTEM COMMANDS ===', '#fbbf24');
                        print('  help, clear, reboot, shutdown, date, echo');
                        print('  whoami, hostname, uptime, history');
                        print('');
                        print('=== APPS & TOOLS ===', '#3b82f6');
                        print('  ls, open [app], calc [math], google [query]');
                        print('  weather, todo [add/list/clear]');
                        print('');
                        print('=== NETWORK (SIMULATED) ===', '#a855f7');
                        print('  ping [site], ip, speedtest, curl [url]');
                        print('');
                        print('=== FUN & HACKING ===', '#10b981');
                        print('  matrix, hack, joke, coin, color [code]');
                        break;

                    case 'clear':
                    case 'cls':
                        output.innerHTML = '';
                        break;

                    case 'ls':
                        print('Applications:', '#3b82f6');
                        const apps = Object.keys(window.OS.Apps).join('  ');
                        print(apps);
                        break;

                    case 'open':
                        if (window.OS.Apps[param]) {
                            print(`Starting process: ${param}...`, '#10b981');
                            window.openWindow(param);
                        } else {
                            print(`Error: Application '${param}' not found.`, '#ef4444');
                        }
                        break;

                    // --- SİSTEM ---
                    case 'whoami':
                        print(user);
                        break;
                    
                    case 'hostname':
                        print('webos-desktop-v1');
                        break;

                    case 'date':
                        print(new Date().toString());
                        break;
                    
                    case 'uptime':
                        print(`System is up for ${Math.floor(performance.now() / 1000)} seconds.`);
                        break;

                    case 'reboot':
                        print('System reboot initiated...', '#ef4444');
                        print('Stopping services...');
                        setTimeout(() => location.reload(), 1500);
                        break;

                    case 'shutdown':
                        print('Shutting down...', '#ef4444');
                        setTimeout(() => {
                            document.body.innerHTML = '<div style="background:black;height:100vh;display:flex;align-items:center;justify-content:center;color:white;">It is now safe to turn off your computer.</div>';
                        }, 2000);
                        break;

                    case 'echo':
                        print(param);
                        break;

                    case 'history':
                        history.forEach((h, i) => print(`${i + 1}: ${h}`, '#9ca3af'));
                        break;

                    // --- ARAÇLAR ---
                    case 'calc':
                        try {
                            if(/^[0-9+\-*/().\s]+$/.test(param)) {
                                print(`Result: ${new Function('return ' + param)()}`, '#10b981');
                            } else print('Invalid math expression.', '#ef4444');
                        } catch { print('Error.', '#ef4444'); }
                        break;

                    case 'google':
                        if(param) {
                            print(`Searching Google for "${param}"...`);
                            window.open(`https://www.google.com/search?q=${encodeURIComponent(param)}`, '_blank');
                        } else print('Usage: google [query]');
                        break;

                    case 'weather':
                        const weathers = ['Sunny ☀️', 'Rainy 🌧️', 'Cloudy ☁️', 'Stormy ⛈️', 'Snowy ❄️'];
                        const temp = Math.floor(Math.random() * 30) + 5;
                        print(`Current Weather: ${weathers[Math.floor(Math.random() * weathers.length)]} | ${temp}°C`);
                        break;

                    case 'todo':
                        // Basit hafıza içi todo
                        if (!window.termTodos) window.termTodos = [];
                        if (param.startsWith('add ')) {
                            window.termTodos.push(param.substring(4));
                            print('Item added.');
                        } else if (param === 'clear') {
                            window.termTodos = [];
                            print('List cleared.');
                        } else {
                            print('--- TODO LIST ---', '#fbbf24');
                            if(window.termTodos.length === 0) print('(Empty)');
                            window.termTodos.forEach((t, i) => print(`${i+1}. ${t}`));
                        }
                        break;

                    // --- NETWORK ---
                    case 'ip':
                        print(`IPv4 Address: 192.168.1.${Math.floor(Math.random() * 255)}`);
                        print(`Subnet Mask: 255.255.255.0`);
                        break;

                    case 'ping':
                        const target = param || 'google.com';
                        print(`Pinging ${target} [142.250.186.46] with 32 bytes of data:`);
                        let pCount = 0;
                        const pInt = setInterval(() => {
                            pCount++;
                            const time = Math.floor(Math.random() * 50) + 10;
                            print(`Reply from 142.250.186.46: bytes=32 time=${time}ms TTL=117`);
                            if(pCount >= 4) {
                                clearInterval(pInt);
                                print(`Ping statistics for ${target}: Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`);
                            }
                        }, 800);
                        break;

                    case 'curl':
                        print(`Fetching ${param || 'http://localhost'}...`);
                        setTimeout(() => {
                            print('HTTP/1.1 200 OK', '#10b981');
                            print('Content-Type: text/html');
                            print('<html><body><h1>Hello World</h1></body></html>');
                        }, 1000);
                        break;

                    case 'speedtest':
                        print('Initializing speedtest...', 'cyan');
                        setTimeout(() => print('Ping: 12ms', 'gray'), 500);
                        setTimeout(() => print('Download: 450.5 Mbps', '#10b981'), 1500);
                        setTimeout(() => print('Upload: 120.2 Mbps', '#a855f7'), 2500);
                        break;

                    // --- EĞLENCE ---
                    case 'color':
                        if(param) {
                            body.style.color = param;
                            input.style.color = param;
                            print(`Color changed to ${param}`);
                        } else print('Usage: color [red/green/blue/#hex]');
                        break;

                    case 'coin':
                        print(Math.random() > 0.5 ? '🪙 Heads' : '🪙 Tails', '#fbbf24');
                        break;

                    case 'joke':
                        const jokes = [
                            "Why do programmers prefer dark mode? Because light attracts bugs.",
                            "There are 10 types of people: those who understand binary, and those who don't.",
                            "It works on my machine.",
                            "I tried to catch some fog earlier. I mist."
                        ];
                        print(jokes[Math.floor(Math.random() * jokes.length)], 'cyan');
                        break;

                    case 'matrix':
                        print('Entering the Matrix... Press ESC to stop.', '#10b981');
                        const chars = "01010101010101010101XYZABC";
                        const mInt = setInterval(() => {
                            // Rastgele string oluştur
                            let str = '';
                            for(let i=0; i<50; i++) str += chars.charAt(Math.floor(Math.random() * chars.length)) + ' ';
                            print(str, '#10b981');
                            if(!document.body.contains(win)) clearInterval(mInt); // Pencere kapanırsa dur
                        }, 50);
                        // Durdurma tuşu
                        input.addEventListener('keydown', function stopper(e) {
                            if(e.key === 'Escape') {
                                clearInterval(mInt);
                                print('Matrix disconnected.', '#ef4444');
                                input.removeEventListener('keydown', stopper);
                            }
                        });
                        break;
                    
                    case 'hack':
                        print('Target: Pentagon Firewall...', '#ef4444');
                        let progress = 0;
                        const hInt = setInterval(() => {
                            progress += Math.floor(Math.random() * 15);
                            if(progress >= 100) {
                                progress = 100;
                                clearInterval(hInt);
                                print(`[####################] 100%`, '#10b981');
                                print('ACCESS GRANTED. SYSTEM COMPROMISED.', '#fbbf24');
                            } else {
                                const bar = Array(Math.floor(progress/5)).fill('#').join('') + Array(20-Math.floor(progress/5)).fill('-').join('');
                                print(`[${bar}] ${progress}% Brute-forcing...`, '#ef4444');
                            }
                        }, 300);
                        break;

                    default:
                        print(`Command not found: ${mainCmd}. Type 'help'.`, '#ef4444');
                }
            }
        }
    };
})();