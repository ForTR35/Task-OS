/* File: js/apps/todo.js */
(function() {
    window.OS.Apps.todo = {
        title: 'Tasks Pro',
        
        render: () => `
            <div class="todo-layout">
                <div class="todo-sidebar">
                    <div class="todo-progress-box">
                        <small>İlerleme</small>
                        <div class="progress-bar"><div id="todoProgress" style="width:0%"></div></div>
                        <span id="progressText">0%</span>
                    </div>
                    
                    <button class="todo-filter active" data-filter="all">📝 Tümü</button>
                    <button class="todo-filter" data-filter="active">⚡ Yapılacaklar</button>
                    <button class="todo-filter" data-filter="completed">✅ Bitenler</button>
                    <button class="todo-filter" data-filter="high">🔥 Yüksek Öncelik</button>
                </div>

                <div class="todo-main">
                    <div class="todo-input-area">
                        <input type="text" id="todoInput" placeholder="Görev yaz..." autocomplete="off">
                        
                        <select id="todoPriority">
                            <option value="low">Düşük</option>
                            <option value="medium" selected>Orta</option>
                            <option value="high">Yüksek</option>
                        </select>
                        
                        <input type="date" id="todoDate">
                        
                        <button id="btnAddTodo">Ekle</button>
                    </div>

                    <div class="todo-list" id="todoList"></div>
                </div>
            </div>
        `,

        onLoad: (win) => {
            const DB = window.OS.Data;
            // Veriyi güvenli çek
            let todos = [];
            try {
                todos = DB.getTodos() || [];
            } catch(e) {
                todos = [];
            }

            let currentFilter = 'all';

            // Elementleri Seç
            const listEl = win.querySelector('#todoList');
            const inputEl = win.querySelector('#todoInput');
            const priorityEl = win.querySelector('#todoPriority');
            const dateEl = win.querySelector('#todoDate');
            const btnAdd = win.querySelector('#btnAddTodo');
            const progressEl = win.querySelector('#todoProgress');
            const progressText = win.querySelector('#progressText');

            // --- RENDER ---
            const renderTodos = () => {
                listEl.innerHTML = '';
                
                // Filtreleme
                let filtered = todos.filter(t => {
                    if (currentFilter === 'active') return !t.done;
                    if (currentFilter === 'completed') return t.done;
                    if (currentFilter === 'high') return t.priority === 'high' && !t.done;
                    return true;
                });

                // Sıralama
                filtered.sort((a, b) => (a.done === b.done) ? 0 : a.done ? 1 : -1);

                if (filtered.length === 0) {
                    listEl.innerHTML = `<div style="text-align:center; padding:20px; opacity:0.5;">Görev yok.</div>`;
                }

                filtered.forEach(todo => {
                    const item = document.createElement('div');
                    item.className = `todo-item ${todo.done ? 'completed' : ''} priority-${todo.priority}`;
                    
                    const dateStr = todo.date ? `📅 ${todo.date}` : '';
                    let badge = '';
                    if(todo.priority === 'high') badge = '<span class="badge badge-high">ACİL</span>';
                    else if(todo.priority === 'medium') badge = '<span class="badge badge-med">Orta</span>';

                    item.innerHTML = `
                        <div class="todo-left">
                            <input type="checkbox" class="todo-check" ${todo.done ? 'checked' : ''}>
                            <div class="todo-content">
                                <div class="todo-text">${todo.text}</div>
                                <div class="todo-meta">${badge} ${dateStr}</div>
                            </div>
                        </div>
                        <button class="todo-delete">🗑</button>
                    `;

                    // Checkbox
                    const chk = item.querySelector('.todo-check');
                    chk.onchange = () => {
                        todo.done = chk.checked;
                        saveAndRender();
                    };

                    // Silme
                    item.querySelector('.todo-delete').onclick = () => {
                        if(confirm('Silinsin mi?')) {
                            todos = todos.filter(t => t.id !== todo.id);
                            saveAndRender();
                        }
                    };

                    listEl.appendChild(item);
                });

                updateProgress();
            };

            const updateProgress = () => {
                if (todos.length === 0) {
                    progressEl.style.width = '0%';
                    progressText.innerText = '0%';
                    return;
                }
                const completed = todos.filter(t => t.done).length;
                const percent = Math.round((completed / todos.length) * 100);
                progressEl.style.width = `${percent}%`;
                progressText.innerText = `${percent}%`;
            };

            const saveAndRender = () => {
                DB.saveTodos(todos);
                renderTodos();
            };

            // --- EVENTLER ---
            const addTodo = () => {
                const text = inputEl.value.trim();
                if (!text) return alert("Lütfen görev adını yazın!");

                todos.push({
                    id: Date.now(),
                    text: text,
                    priority: priorityEl.value,
                    date: dateEl.value,
                    done: false
                });

                inputEl.value = '';
                saveAndRender();
                // Eklendikten sonra inputa odaklan
                inputEl.focus();
            };

            // Butona Tıklama
            if (btnAdd) {
                btnAdd.onclick = addTodo;
            }

            // Enter Tuşu
            if (inputEl) {
                inputEl.addEventListener('keydown', (e) => {
                    if(e.key === 'Enter') addTodo();
                });
            }

            // Filtre Butonları
            const filters = win.querySelectorAll('.todo-filter');
            filters.forEach(btn => {
                btn.onclick = () => {
                    filters.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentFilter = btn.dataset.filter;
                    renderTodos();
                };
            });

            // Başlat
            renderTodos();
        }
    };
})();