/* File: js/apps/snake.js */
(function() {
    window.OS.Apps.snake = {
        title: 'Neon Snake',
        
        render: () => `
            <div class="snake-app-container" tabindex="0" style="outline:none;">
                <div class="snake-toolbar">
                    <div class="score-box">Score: <span id="snakeScore">0</span></div>
                    <div class="high-score-box">High Score: <span id="snakeHighScore">0</span></div>
                </div>
                <div class="canvas-wrapper">
                    <canvas id="snakeCanvas" width="600" height="400"></canvas>
                    <div id="snakeOverlay" class="snake-overlay">
                        <h2>NEON SNAKE</h2>
                        <p>Press any arrow key or WASD to start</p>
                    </div>
                </div>
            </div>
        `,

        onLoad: (win) => {
            const appContainer = win.querySelector('.snake-app-container');
            const canvas = win.querySelector('#snakeCanvas');
            const ctx = canvas.getContext('2d');
            const scoreEl = win.querySelector('#snakeScore');
            const highScoreEl = win.querySelector('#snakeHighScore');
            const overlay = win.querySelector('#snakeOverlay');
            const container = win.querySelector('.canvas-wrapper');

            // Odaklanma ayarı
            setTimeout(() => appContainer.focus(), 100);
            appContainer.addEventListener('click', () => appContainer.focus());

            const gridSize = 20; 
            let tileCountX = canvas.width / gridSize; 
            let tileCountY = canvas.height / gridSize;

            let snake = [];
            let apple = {};
            let velocity = { x: 0, y: 0 };
            let score = 0;
            let highScore = localStorage.getItem('snakeHighScore') || 0;
            highScoreEl.innerText = highScore;

            let gameInterval = null;
            let isGameRunning = false;
            let nextVelocity = null;
            
            // Yeme Efekti Sayacı
            let eatEffectTimer = 0; 

            // --- OYUN MANTIĞI ---
            function initGame() {
                snake = [
                    { x: Math.floor(tileCountX / 2), y: Math.floor(tileCountY / 2) },
                    { x: Math.floor(tileCountX / 2) - 1, y: Math.floor(tileCountY / 2) },
                    { x: Math.floor(tileCountX / 2) - 2, y: Math.floor(tileCountY / 2) },
                ];
                velocity = { x: 1, y: 0 }; 
                nextVelocity = { x: 1, y: 0 };
                score = 0;
                scoreEl.innerText = score;
                eatEffectTimer = 0;
                placeApple();
                overlay.classList.add('hidden');
                isGameRunning = true;

                if(gameInterval) clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, 100); 
            }

            function gameLoop() {
                update();
                draw();
            }

            function update() {
                if (nextVelocity) {
                    velocity = nextVelocity;
                    nextVelocity = null;
                }

                const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

                // Duvar ve Kuyruk Çarpışması
                if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
                    gameOver(); return;
                }
                for (let i = 0; i < snake.length; i++) {
                    if (head.x === snake[i].x && head.y === snake[i].y) {
                        gameOver(); return;
                    }
                }

                snake.unshift(head);

                // Elma Yeme
                if (head.x === apple.x && head.y === apple.y) {
                    score += 10;
                    scoreEl.innerText = score;
                    placeApple();
                    eatEffectTimer = 6; // 6 kare boyunca parlasın (Efekt süresi)
                } else {
                    snake.pop();
                }
            }

            function placeApple() {
                let valid = false;
                while (!valid) {
                    apple = {
                        x: Math.floor(Math.random() * tileCountX),
                        y: Math.floor(Math.random() * tileCountY)
                    };
                    valid = !snake.some(segment => segment.x === apple.x && segment.y === apple.y);
                }
            }

            function gameOver() {
                clearInterval(gameInterval);
                isGameRunning = false;
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('snakeHighScore', highScore);
                    highScoreEl.innerText = highScore;
                }
                overlay.innerHTML = `<h2>GAME OVER</h2><p>Score: ${score}</p><p class="blink">Press any key to restart</p>`;
                overlay.classList.remove('hidden');
            }

            // --- ÇİZİM ---
            function draw() {
                // Ekranı temizle
                ctx.fillStyle = window.getComputedStyle(container).backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Grid (İnce çizgi)
                ctx.strokeStyle = 'rgba(255,255,255,0.03)';
                ctx.lineWidth = 0.5;
                for(let i=0; i<=tileCountX; i++) { ctx.beginPath(); ctx.moveTo(i*gridSize,0); ctx.lineTo(i*gridSize,canvas.height); ctx.stroke();}
                for(let j=0; j<=tileCountY; j++) { ctx.beginPath(); ctx.moveTo(0,j*gridSize); ctx.lineTo(canvas.width,j*gridSize); ctx.stroke();}

                // Elma
                ctx.fillStyle = '#ff0055';
                ctx.shadowColor = '#ff0055';
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.arc(apple.x * gridSize + gridSize/2, apple.y * gridSize + gridSize/2, gridSize/2 - 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0; // Gölgeyi kapat

                // Yılanı Çiz
                snake.forEach((segment, index) => {
                    // Koordinatları hesapla
                    const px = segment.x * gridSize;
                    const py = segment.y * gridSize;
                    const cx = px + gridSize/2;
                    const cy = py + gridSize/2;

                    if (index === 0) {
                        // --- KAFA (Profesyonel Görünüm) ---
                        ctx.fillStyle = '#00ffff'; // Parlak Cyan
                        ctx.shadowColor = '#00ffff';
                        ctx.shadowBlur = 20; // Sadece kafa parlasın
                        
                        ctx.beginPath();
                        ctx.arc(cx, cy, gridSize/2, 0, Math.PI * 2);
                        ctx.fill();

                        // Gözler (Siyah)
                        ctx.shadowBlur = 0; // Gözlerde parlama olmasın
                        ctx.fillStyle = '#000000';
                        
                        // Göz pozisyonlarını hıza göre ayarla
                        const eyeOffset = 6;
                        const eyeSep = 4;
                        let lx, ly, rx, ry; // Sol ve Sağ göz
                        
                        if(velocity.x === 1) { // Sağ
                            lx = cx + eyeOffset; ly = cy - eyeSep; rx = cx + eyeOffset; ry = cy + eyeSep;
                        } else if(velocity.x === -1) { // Sol
                            lx = cx - eyeOffset; ly = cy - eyeSep; rx = cx - eyeOffset; ry = cy + eyeSep;
                        } else if(velocity.y === 1) { // Aşağı
                            lx = cx - eyeSep; ly = cy + eyeOffset; rx = cx + eyeSep; ry = cy + eyeOffset;
                        } else { // Yukarı
                            lx = cx - eyeSep; ly = cy - eyeOffset; rx = cx + eyeSep; ry = cy - eyeOffset;
                        }

                        ctx.beginPath(); ctx.arc(lx, ly, 2, 0, Math.PI * 2); ctx.fill();
                        ctx.beginPath(); ctx.arc(rx, ry, 2, 0, Math.PI * 2); ctx.fill();

                    } else {
                        // --- GÖVDE (İz Bırakmayan Net Kareler) ---
                        
                        // ÖNEMLİ: Gölgeyi kesinlikle kapat (İz oluşmaması için)
                        ctx.shadowBlur = 0; 
                        
                        // Renk Ayarı (Yeme Efekti Varsa Beyaz, Yoksa Yeşil)
                        if (eatEffectTimer > 0) {
                            ctx.fillStyle = '#ffffff'; 
                        } else {
                            ctx.fillStyle = '#00dd88'; 
                        }

                        // Kare çizimi (Aralarında 1px boşluk bırakarak tane tane görünmesini sağla)
                        const gap = 1; 
                        ctx.fillRect(px + gap, py + gap, gridSize - (gap*2), gridSize - (gap*2));
                    }
                });

                // Efekt süresini azalt
                if (eatEffectTimer > 0) eatEffectTimer--;
                
                // Her ihtimale karşı çizim bitince gölgeyi sıfırla
                ctx.shadowBlur = 0;
            }
            
            draw();

            // --- KONTROLLER ---
            appContainer.addEventListener('keydown', (e) => {
                if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
                    e.preventDefault();
                }

                if (!isGameRunning) {
                    initGame();
                    return;
                }

                switch (e.key.toLowerCase()) {
                    case 'arrowup': case 'w':
                        if (velocity.y !== 1) nextVelocity = { x: 0, y: -1 }; break;
                    case 'arrowdown': case 's':
                        if (velocity.y !== -1) nextVelocity = { x: 0, y: 1 }; break;
                    case 'arrowleft': case 'a':
                        if (velocity.x !== 1) nextVelocity = { x: -1, y: 0 }; break;
                    case 'arrowright': case 'd':
                        if (velocity.x !== -1) nextVelocity = { x: 1, y: 0 }; break;
                }
            });

            win.addEventListener('DOMNodeRemoved', (e) => {
                if(e.target === win) clearInterval(gameInterval);
            });
        }
    };
})();