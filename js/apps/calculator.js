/* File: js/apps/calculator.js */
(function() {
    // Hesap Makinesi HTML yapısı
    const calcHTML = `
      <div class="calc-container">
        <div class="calc-screen">
          <input type="text" id="calcDisplay" readonly value="" />
        </div>
        <div class="calc-keys">
          <button class="key-clear" data-key="C">C</button>
          <button class="key-op" data-key="/">/</button>
          <button class="key-op" data-key="*">×</button>
          <button class="key-back" data-key="DEL">←</button>
          <button data-key="7">7</button> <button data-key="8">8</button> <button data-key="9">9</button>
          <button class="key-op" data-key="-">-</button>
          <button data-key="4">4</button> <button data-key="5">5</button> <button data-key="6">6</button>
          <button class="key-op" data-key="+">+</button>
          <button data-key="1">1</button> <button data-key="2">2</button> <button data-key="3">3</button>
          <button class="key-equal" data-key="=">=</button>
          <button class="key-zero" data-key="0">0</button>
          <button data-key=".">.</button>
        </div>
      </div>
    `;

    // Uygulamayı sisteme kaydet
    window.OS.Apps.calculator = {
        title: 'Calculator',
        
        render: () => calcHTML,

        onLoad: (winElement) => {
            // Sadece bu pencere içindeki ekranı ve tuşları bul
            const display = winElement.querySelector('#calcDisplay');
            const buttons = winElement.querySelectorAll('button');

            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const value = btn.getAttribute('data-key');
                    handleInput(value, display);
                });
            });
        }
    };

    // Hesaplama Mantığı (İç fonksiyon)
    function handleInput(value, display) {
        if (!display) return;
        switch (value) {
            case 'C': display.value = ''; break;
            case 'DEL': display.value = display.value.slice(0, -1); break;
            case '=':
                try { display.value = eval(display.value); } 
                catch { display.value = 'Error'; }
                break;
            default: display.value += value; break;
        }
    }
})();