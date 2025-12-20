/* File: js/apps/notes.js */
(function() {
    window.OS.Apps.notes = {
        title: 'Not Defteri',
        
        render: () => `
            <div class="notes-app">
                <div class="notes-toolbar">
                    <button class="note-btn save" id="btnSave">💾 Kaydet</button>
                    <button class="note-btn delete" id="btnDelete" style="display:none;">🗑 Sil</button>
                    <span id="noteTitleDisplay" class="note-status">Yeni Not</span>
                </div>
                <textarea class="notes-area" id="noteContent" placeholder="Notunu buraya yaz..."></textarea>
            </div>
        `,

        onLoad: (win, noteId) => {
            const DB = window.OS.Data;
            const contentArea = win.querySelector('#noteContent');
            const btnSave = win.querySelector('#btnSave');
            const btnDelete = win.querySelector('#btnDelete');
            const titleDisplay = win.querySelector('#noteTitleDisplay');

            let currentId = noteId || null;

            // Eğer masaüstündeki bir nota tıklandıysa içeriği getir
            if (currentId) {
                const note = DB.getNoteById(currentId);
                if (note) {
                    contentArea.value = note.content;
                    titleDisplay.innerText = note.title;
                    btnDelete.style.display = 'inline-block';
                }
            }

            // --- KAYDET BUTONU ---
            btnSave.onclick = () => {
                const text = contentArea.value.trim();
                if (!text) return alert("Boş not kaydedilemez!");

                let title = titleDisplay.innerText;
                if (!currentId || title === 'Yeni Not') {
                    title = prompt("Not Başlığı:", "Notum");
                    if (!title) return; 
                }

                DB.saveNote(currentId, title, text);
                
                // Masaüstü ikonlarını yenile
                if (window.OS.refreshIcons) window.OS.refreshIcons();
                
                // DÜZELTME BURADA:
                // win.remove() yerine kapatma butonuna tıklatıyoruz.
                // Bu sayede Taskbar'dan da siliniyor.
                win.querySelector('.btn-close').click();
            };

            // --- SİL BUTONU ---
            btnDelete.onclick = () => {
                if(confirm("Bu notu silmek istiyor musun?")) {
                    DB.deleteNote(currentId);
                    if (window.OS.refreshIcons) window.OS.refreshIcons();
                    
                    // DÜZELTME BURADA DA YAPILDI:
                    win.querySelector('.btn-close').click();
                }
            };
        }
    };
})();