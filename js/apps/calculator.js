/* File: js/apps/calculator.js */
(function() {
    // --- GELİŞMİŞ HESAPLAMA MOTORU ---
    class ScientificCalculator {
        constructor(displayElement) {
            this.displayElement = displayElement;
            this.clear();
        }

        clear() {
            this.expression = ''; 
            this.displayValue = '0'; 
            this.isFinished = false; 
        }

        delete() {
            if (this.isFinished) {
                this.clear();
                return;
            }
            if (this.displayValue === '0' || this.displayValue.length === 0) return;
            
            this.displayValue = this.displayValue.toString().slice(0, -1);
            this.expression = this.expression.toString().slice(0, -1);
            
            if (this.displayValue === '') {
                this.displayValue = '0';
                this.expression = '';
            }
        }

        append(char, mathChar = null) {
            if (this.isFinished) {
                if (!isNaN(char) || char === '.' || char === '(') {
                    this.displayValue = '';
                    this.expression = '';
                }
                this.isFinished = false;
            }

            if (this.displayValue === '0' && (!isNaN(char) || char === '(')) {
                this.displayValue = '';
                if(this.expression === '0') this.expression = '';
            }

            this.displayValue += char;
            this.expression += (mathChar !== null ? mathChar : char);
        }

        addFunction(funcName, mathFunc) {
            if (this.isFinished) {
                this.expression = this.displayValue; 
                this.isFinished = false;
            }
            if (this.displayValue === '0') {
                this.displayValue = '';
                if(this.expression === '0') this.expression = '';
            }
            this.displayValue += funcName + '(';
            this.expression += mathFunc + '(';
        }

        compute() {
            try {
                let evalString = this.expression
                    .replace(/×/g, '*')
                    .replace(/÷/g, '/')
                    .replace(/π/g, 'Math.PI')
                    .replace(/e/g, 'Math.E')
                    .replace(/\^/g, '**') 
                    .replace(/mod/g, '%');

                const result = new Function('return ' + evalString)();

                if (!isFinite(result) || isNaN(result)) {
                    this.displayValue = 'Hata';
                } else {
                    let res = parseFloat(result.toFixed(10));
                    this.displayValue = res.toString();
                    this.expression = this.displayValue; 
                }
            } catch (error) {
                this.displayValue = 'Hata';
                this.expression = '';
            }
            this.isFinished = true;
        }

        updateDisplay() {
            this.displayElement.innerText = this.displayValue;
        }
    }

    window.OS.Apps.calculator = {
        title: 'Scientific',
        
        render: () => `
            <div class="calc-app">
                <div class="calc-display">
                    <div class="calc-current" data-current style="font-size: 2.8rem; word-wrap: break-word;">0</div>
                </div>
                <div class="calc-grid">
                    <button class="btn-calc op" id="btn-2nd">2ⁿᵈ</button>
                    <button class="btn-calc" data-val="π">π</button>
                    <button class="btn-calc" data-val="e">e</button>
                    <button class="btn-calc clear" id="btn-ac">C</button>
                    <button class="btn-calc delete" id="btn-del">⌫</button>

                    <button class="btn-calc dyn-btn" id="btn-sqr" data-mode="1">x²</button>
                    <button class="btn-calc" data-func="1/x">¹/x</button>
                    <button class="btn-calc" data-func="abs">|x|</button>
                    <button class="btn-calc" data-expr="exp">exp</button>
                    <button class="btn-calc" data-op="mod">mod</button>

                    <button class="btn-calc dyn-btn" id="btn-sqrt" data-mode="1">²√x</button>
                    <button class="btn-calc" data-val="(">(</button>
                    <button class="btn-calc" data-val=")">)</button>
                    <button class="btn-calc" data-func="fact">n!</button>
                    <button class="btn-calc op" data-op="÷">÷</button>

                    <button class="btn-calc dyn-btn" id="btn-pow" data-mode="1">xʸ</button>
                    <button class="btn-calc" data-num="7">7</button>
                    <button class="btn-calc" data-num="8">8</button>
                    <button class="btn-calc" data-num="9">9</button>
                    <button class="btn-calc op" data-op="×">×</button>

                    <button class="btn-calc dyn-btn" id="btn-10x" data-mode="1">10ˣ</button>
                    <button class="btn-calc" data-num="4">4</button>
                    <button class="btn-calc" data-num="5">5</button>
                    <button class="btn-calc" data-num="6">6</button>
                    <button class="btn-calc op" data-op="-">-</button>

                    <button class="btn-calc dyn-btn" id="btn-log" data-mode="1">log</button>
                    <button class="btn-calc" data-num="1">1</button>
                    <button class="btn-calc" data-num="2">2</button>
                    <button class="btn-calc" data-num="3">3</button>
                    <button class="btn-calc op" data-op="+">+</button>

                    <button class="btn-calc dyn-btn" id="btn-ln" data-mode="1">ln</button>
                    <button class="btn-calc" id="btn-neg">+/-</button>
                    <button class="btn-calc" data-num="0">0</button>
                    <button class="btn-calc" data-num=".">.</button>
                    <button class="btn-calc equal" id="btn-eq">=</button>
                </div>
            </div>
        `,

        onLoad: (winElement) => {
            // --- KRİTİK DÜZELTME BURADA ---
            // Ana pencere kutusunun arka planını şeffaf yapıyoruz ki
            // içindeki buzlu cam efekti (blur) çalışsın ve arkası görünsün.
            winElement.style.background = 'transparent';
            
            // Boyut ayarları
            winElement.style.cssText += "width: 340px !important; height: 530px !important; top: 100px; left: 100px;";
            
            // ... geri kalan kodlar aynı ...
            const display = winElement.querySelector('[data-current]');
            const calculator = new ScientificCalculator(display);

            let isSecondMode = false;
            const btn2nd = winElement.querySelector('#btn-2nd');
            const btnSqr = winElement.querySelector('#btn-sqr');   
            const btnSqrt = winElement.querySelector('#btn-sqrt'); 
            const btnPow = winElement.querySelector('#btn-pow');   
            const btn10x = winElement.querySelector('#btn-10x');   
            const btnLog = winElement.querySelector('#btn-log');   
            const btnLn = winElement.querySelector('#btn-ln');     

            btn2nd.addEventListener('click', () => {
                isSecondMode = !isSecondMode;
                if (isSecondMode) {
                    btn2nd.style.background = '#0067C0'; 
                    btn2nd.style.color = 'white';
                    updateBtn(btnSqr, 'x³');
                    updateBtn(btnSqrt, '³√x');
                    updateBtn(btnPow, 'ʸ√x');
                    updateBtn(btn10x, '2ˣ');
                    updateBtn(btnLog, 'logᵧx');
                    updateBtn(btnLn, 'eˣ');
                } else {
                    btn2nd.style.background = ''; 
                    btn2nd.style.color = '';
                    updateBtn(btnSqr, 'x²');
                    updateBtn(btnSqrt, '²√x');
                    updateBtn(btnPow, 'xʸ');
                    updateBtn(btn10x, '10ˣ');
                    updateBtn(btnLog, 'log');
                    updateBtn(btnLn, 'ln');
                }
            });

            function updateBtn(btn, text) {
                btn.innerText = text;
            }

            winElement.querySelectorAll('[data-num]').forEach(b => {
                b.addEventListener('click', () => {
                    calculator.append(b.dataset.num);
                    calculator.updateDisplay();
                });
            });

            winElement.querySelectorAll('[data-op]').forEach(b => {
                b.addEventListener('click', () => {
                    let mathOp = b.dataset.op;
                    if(mathOp === '×') mathOp = '*';
                    if(mathOp === '÷') mathOp = '/';
                    if(mathOp === 'mod') mathOp = '%';
                    calculator.append(b.dataset.op, mathOp);
                    calculator.updateDisplay();
                });
            });

            winElement.querySelectorAll('[data-val]').forEach(b => {
                b.addEventListener('click', () => {
                    calculator.append(b.dataset.val);
                    calculator.updateDisplay();
                });
            });

            winElement.querySelectorAll('[data-func]').forEach(b => {
                b.addEventListener('click', () => {
                    const func = b.dataset.func;
                    if(func === '1/x') calculator.addFunction('', '1/');
                    else if(func === 'abs') calculator.addFunction('abs', 'Math.abs');
                    else if(func === 'fact') {
                        alert("Faktöriyel için 'fact(5)' formatını kullanın.");
                        calculator.addFunction('fact', 'calcFactorial');
                    }
                    calculator.updateDisplay();
                });
            });

            btnSqr.addEventListener('click', () => {
                if(!isSecondMode) calculator.append('²', '**2'); 
                else calculator.append('³', '**3');
                calculator.updateDisplay();
            });

            btnSqrt.addEventListener('click', () => {
                if(!isSecondMode) calculator.addFunction('√', 'Math.sqrt');
                else calculator.addFunction('³√', 'Math.cbrt');
                calculator.updateDisplay();
            });

            btnPow.addEventListener('click', () => {
                if(!isSecondMode) calculator.append('^', '**');
                else calculator.append('^(1/', '** (1/');
                calculator.updateDisplay();
            });

            btn10x.addEventListener('click', () => {
                if(!isSecondMode) calculator.append('10^', '10**');
                else calculator.append('2^', '2**');
                calculator.updateDisplay();
            });

            btnLog.addEventListener('click', () => {
                if(!isSecondMode) calculator.addFunction('log', 'Math.log10');
                else {
                    alert("Özel logaritma için: Math.log(x) / Math.log(taban).");
                    calculator.addFunction('log', 'Math.log10');
                }
                calculator.updateDisplay();
            });

            btnLn.addEventListener('click', () => {
                if(!isSecondMode) calculator.addFunction('ln', 'Math.log');
                else calculator.append('e^', 'Math.E**');
                calculator.updateDisplay();
            });

            winElement.querySelector('[data-expr]').addEventListener('click', () => {
                 calculator.append('e', 'e');
                 calculator.updateDisplay();
            });

            winElement.querySelector('#btn-ac').addEventListener('click', () => {
                calculator.clear();
                calculator.updateDisplay();
            });

            winElement.querySelector('#btn-del').addEventListener('click', () => {
                calculator.delete();
                calculator.updateDisplay();
            });

            winElement.querySelector('#btn-eq').addEventListener('click', () => {
                calculator.compute();
                calculator.updateDisplay();
            });
            
            winElement.querySelector('#btn-neg').addEventListener('click', () => {
                calculator.append('-');
                calculator.updateDisplay();
            });

            window.calcFactorial = function(n) {
                if(n < 0) return NaN;
                if(n == 0 || n == 1) return 1;
                let f = 1;
                for(let i=2; i<=n; i++) f*=i;
                return f;
            };

            const keyHandler = (e) => {
                if(!document.body.contains(winElement)) return;
                const key = e.key;
                if (/[0-9.]/.test(key)) calculator.append(key);
                if (key === '+') calculator.append('+', '+');
                if (key === '-') calculator.append('-', '-');
                if (key === '*') calculator.append('×', '*');
                if (key === '/') calculator.append('÷', '/');
                if (key === '(') calculator.append('(', '(');
                if (key === ')') calculator.append(')', ')');
                if (key === 'Enter' || key === '=') { e.preventDefault(); calculator.compute(); }
                if (key === 'Backspace') calculator.delete();
                if (key === 'Escape') calculator.clear();
                calculator.updateDisplay();
            };

            document.addEventListener('keydown', keyHandler);

            const closeBtn = winElement.querySelector('.btn-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    document.removeEventListener('keydown', keyHandler);
                });
            }
        }
    };
})();