/* File: js/apps/calculator.js */
(function() {
    // Hesaplama Motoru Sınıfı
    class Calculator {
        constructor(previousOperandTextElement, currentOperandTextElement) {
            this.previousOperandTextElement = previousOperandTextElement;
            this.currentOperandTextElement = currentOperandTextElement;
            this.clear();
        }

        clear() {
            this.currentOperand = '';
            this.previousOperand = '';
            this.operation = undefined;
        }

        delete() {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }

        appendNumber(number) {
            if (number === '.' && this.currentOperand.includes('.')) return;
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }

        chooseOperation(operation) {
            if (this.currentOperand === '') return;
            if (this.previousOperand !== '') {
                this.compute();
            }
            this.operation = operation;
            this.previousOperand = this.currentOperand;
            this.currentOperand = '';
        }

        compute() {
            let computation;
            const prev = parseFloat(this.previousOperand);
            const current = parseFloat(this.currentOperand);
            if (isNaN(prev) || isNaN(current)) return;

            switch (this.operation) {
                case '+': computation = prev + current; break;
                case '-': computation = prev - current; break;
                case '×': computation = prev * current; break;
                case '÷': computation = prev / current; break;
                case '%': computation = prev % current; break;
                case '^': computation = Math.pow(prev, current); break;
                default: return;
            }
            this.currentOperand = computation;
            this.operation = undefined;
            this.previousOperand = '';
        }

        specialOperation(type) {
            const current = parseFloat(this.currentOperand);
            if (isNaN(current)) return;
            
            if (type === '√') {
                if(current < 0) { alert('Invalid Input'); return; }
                this.currentOperand = Math.sqrt(current);
            }
        }

        getDisplayNumber(number) {
            const stringNumber = number.toString();
            const integerDigits = parseFloat(stringNumber.split('.')[0]);
            const decimalDigits = stringNumber.split('.')[1];
            let integerDisplay;
            if (isNaN(integerDigits)) {
                integerDisplay = '';
            } else {
                integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
            }
            if (decimalDigits != null) {
                return `${integerDisplay}.${decimalDigits}`;
            } else {
                return integerDisplay;
            }
        }

        updateDisplay() {
            this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
            if (this.operation != null) {
                this.previousOperandTextElement.innerText = 
                    `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
            } else {
                this.previousOperandTextElement.innerText = '';
            }
        }
    }

    // Uygulama Tanımı
    window.OS.Apps.calculator = {
        title: 'Pro Calculator',
        
        render: () => `
            <div class="calc-app">
                <div class="calc-display">
                    <div class="calc-previous" data-previous></div>
                    <div class="calc-current" data-current>0</div>
                </div>
                <div class="calc-grid">
                    <button class="btn-calc clear" data-action="AC">AC</button>
                    <button class="btn-calc delete" data-action="DEL">DEL</button>
                    <button class="btn-calc op" data-op="%">%</button>
                    <button class="btn-calc op" data-op="÷">÷</button>
                    
                    <button class="btn-calc" data-num="7">7</button>
                    <button class="btn-calc" data-num="8">8</button>
                    <button class="btn-calc" data-num="9">9</button>
                    <button class="btn-calc op" data-op="×">×</button>
                    
                    <button class="btn-calc" data-num="4">4</button>
                    <button class="btn-calc" data-num="5">5</button>
                    <button class="btn-calc" data-num="6">6</button>
                    <button class="btn-calc op" data-op="-">-</button>
                    
                    <button class="btn-calc" data-num="1">1</button>
                    <button class="btn-calc" data-num="2">2</button>
                    <button class="btn-calc" data-num="3">3</button>
                    <button class="btn-calc op" data-op="+">+</button>
                    
                    <button class="btn-calc op" data-special="√">√</button>
                    <button class="btn-calc" data-num="0">0</button>
                    <button class="btn-calc" data-num=".">.</button>
                    <button class="btn-calc equal" data-action="=">=</button>
                </div>
            </div>
        `,

        onLoad: (winElement) => {
            // --- KESİN ÇÖZÜM: DOM YÜKLENDİKTEN HEMEN SONRA BOYUTU ZORLA ---
            // Genişlik: 280px (Daraltıldı)
            // Yükseklik: 405px (Başlık çubuğu dahil tam sığacak boyut)
            winElement.style.cssText += "width: 280px !important; height: 405px !important;";
            
            const previousText = winElement.querySelector('[data-previous]');
            const currentText = winElement.querySelector('[data-current]');
            const calculator = new Calculator(previousText, currentText);

            winElement.querySelectorAll('button').forEach(button => {
                button.addEventListener('click', () => {
                    if(button.dataset.num) {
                        calculator.appendNumber(button.dataset.num);
                    } else if (button.dataset.op) {
                        calculator.chooseOperation(button.dataset.op);
                    } else if (button.dataset.special) {
                        calculator.specialOperation(button.dataset.special);
                    } else if (button.dataset.action === 'AC') {
                        calculator.clear();
                    } else if (button.dataset.action === 'DEL') {
                        calculator.delete();
                    } else if (button.dataset.action === '=') {
                        calculator.compute();
                    }
                    calculator.updateDisplay();
                });
            });

            const keyHandler = (e) => {
                if(!document.contains(winElement)) return;
                let key = e.key;
                if (/[0-9.]/.test(key)) calculator.appendNumber(key);
                if (key === '+' || key === '-') calculator.chooseOperation(key);
                if (key === '*') calculator.chooseOperation('×');
                if (key === '/') calculator.chooseOperation('÷');
                if (key === 'Enter' || key === '=') { e.preventDefault(); calculator.compute(); }
                if (key === 'Backspace') calculator.delete();
                if (key === 'Escape') calculator.clear();
                calculator.updateDisplay();
            };

            document.addEventListener('keydown', keyHandler);
            winElement.querySelector('.win-close').addEventListener('click', () => {
                document.removeEventListener('keydown', keyHandler);
            });
        }
    };
})();