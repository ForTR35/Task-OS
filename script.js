/* Minimal JS to handle login, account creation, background settings, and app open/double-click */
(function(){
  // Elements
  const bg = document.getElementById('bg');
  const bgBlur = document.getElementById('bgBlur');
  const lock = document.getElementById('lock');
  const desktop = document.getElementById('desktop');
  const unlockBtn = document.getElementById('unlockBtn');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  // Modals
  const createModal = document.getElementById('createModal');
  const forgotModal = document.getElementById('forgotModal');
  const settingsModal = document.getElementById('settingsModal');

  // Buttons
  const createBtn = document.getElementById('createBtn');
  const forgotBtn = document.getElementById('forgotBtn');
  const settingsBtn = document.getElementById('settingsBtn');

  // Default account if none
  function ensureDefaultAccount(){
    if(!localStorage.getItem('osAccount')){
      localStorage.setItem('osAccount', JSON.stringify({username:'user', password:'password'}));
    }
  }

  // Background management
  function applyBackground(src){
    if(!src) {
      bg.style.background = '';
      bg.style.background = 'linear-gradient(120deg,#1f2937,#0f172a)';
      bgBlur.style.background = bg.style.background;
      return;
    }
    bg.style.backgroundImage = `url('${src}')`;
    bg.style.backgroundSize = 'cover';
    bg.style.backgroundPosition = 'center';
    bgBlur.style.backgroundImage = `url('${src}')`;
    bgBlur.style.backgroundSize = 'cover';
    bgBlur.style.backgroundPosition = 'center';
  }

  function loadBackground(){
    const b = localStorage.getItem('osBackground');
    applyBackground(b);
  }

  // Lock/unlock
  function unlock(username){
    // Animate blur away
    bgBlur.style.transition = 'opacity .5s ease, filter .5s ease';
    bgBlur.style.opacity = '0';
    setTimeout(()=>{ bgBlur.classList.remove('blur'); bgBlur.style.opacity = ''; },500);

    lock.classList.add('hidden');
    desktop.classList.remove('hidden');
    sessionStorage.setItem('osLoggedIn', username);
  }

  function showLock(){
    // restore blur
    bgBlur.classList.add('blur');
    lock.classList.remove('hidden');
    desktop.classList.add('hidden');
    sessionStorage.removeItem('osLoggedIn');
  }

  // Basic credential functions (very simple for prototype)
  function getAccount(){
    const a = localStorage.getItem('osAccount');
    return a ? JSON.parse(a) : null;
  }

  function checkCredentials(user, pass){
    const acc = getAccount();
    return acc && acc.username === user && acc.password === pass;
  }

  // Modal helpers
  function openModal(m){ m.classList.remove('hidden'); }
  function closeModal(m){ m.classList.add('hidden'); }

  // Create/forgot handlers
  (function wireModals(){
    // Create account
    createBtn.addEventListener('click', (e)=>{ e.preventDefault(); openModal(createModal); });
    document.getElementById('createCancel').addEventListener('click', ()=>closeModal(createModal));
    document.getElementById('createSave').addEventListener('click', ()=>{
      const u = document.getElementById('createUser').value.trim();
      const p = document.getElementById('createPass').value;
      if(!u || !p){ alert('Enter username and password'); return; }
      localStorage.setItem('osAccount', JSON.stringify({username:u,password:p}));
      alert('Account created. You can sign in now.');
      closeModal(createModal);
    });

    // Forgot password
    forgotBtn.addEventListener('click', (e)=>{ e.preventDefault(); openModal(forgotModal); });
    document.getElementById('resetCancel').addEventListener('click', ()=>closeModal(forgotModal));
    document.getElementById('resetSave').addEventListener('click', ()=>{
      const u = document.getElementById('resetUser').value.trim();
      const p = document.getElementById('resetPass').value;
      const acc = getAccount();
      if(!acc || acc.username !== u){ alert('Username not found'); return; }
      acc.password = p; localStorage.setItem('osAccount', JSON.stringify(acc));
      alert('Password reset. Sign in with your new password.');
      closeModal(forgotModal);
    });

    // Settings
    settingsBtn.addEventListener('click', ()=>openModal(settingsModal));
    document.getElementById('settingsCancel').addEventListener('click', ()=>closeModal(settingsModal));
    document.getElementById('settingsApply').addEventListener('click', ()=>{
      const url = document.getElementById('bgUrl').value.trim();
      const fileInput = document.getElementById('bgFile');
      if(url){ localStorage.setItem('osBackground', url); loadBackground(); closeModal(settingsModal); return; }
      if(fileInput.files && fileInput.files[0]){
        const fr = new FileReader();
        fr.onload = ()=>{ localStorage.setItem('osBackground', fr.result); loadBackground(); closeModal(settingsModal); };
        fr.readAsDataURL(fileInput.files[0]);
        return;
      }
      alert('Select a file or enter a URL');
    });
  })();

  // Unlock button
  unlockBtn.addEventListener('click', ()=>{
    const u = usernameInput.value.trim();
    const p = passwordInput.value;
    if(checkCredentials(u,p)){
      unlock(u);
    } else { alert('Wrong username or password'); }
  });

  // Allow pressing Enter to submit
  passwordInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') unlockBtn.click(); });
  usernameInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') passwordInput.focus(); });

  // Double-click to open apps
  document.getElementById('icons').addEventListener('dblclick', (e)=>{
    const ic = e.target.closest('.icon');
    if(!ic) return;
    const app = ic.dataset.app;
    openAppWindow(app);
  });

  // simple window launcher
  function openAppWindow(app){
    if(app === 'settings'){ settingsBtn.click(); return; }
    const w = document.createElement('div');
    w.className = 'window';
    w.innerHTML = `<div class="title"><span>${app}</span><button class="win-close">✖</button></div><div class="content"><p>This is the <strong>${app}</strong> app.</p></div>`;
    const closeBtn = w.querySelector('.win-close');
    closeBtn.addEventListener('click', ()=>w.remove());
    document.getElementById('windows').appendChild(w);
  }

  // initialize
  ensureDefaultAccount();
  loadBackground();

  // If already logged in in session, go to desktop
  if(sessionStorage.getItem('osLoggedIn')){
    // remove blur quickly
    bgBlur.classList.remove('blur');
    lock.classList.add('hidden');
    desktop.classList.remove('hidden');
  }
})();