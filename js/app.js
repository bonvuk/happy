/* =====================================================================
   GỬI EM — birthday surprise micro-site
   app.js

   Structure:
     1. CONFIG          – everything a user is likely to want to edit
     2. UTILITIES        – small shared helpers
     3. BACKGROUND PETALS – ambient decoration
     4. AUDIO             – sound effects + unlock veil
     5. LOCK SCREEN       – passcode pad + bloom transition
     6. HOME MENU         – grid navigation to overlays
     7. MUSIC PLAYER      – playlist + transport controls
     8. LETTER             – typewriter reveal
     9. GALLERY            – carousel + like burst
    10. CAKE 3D            – rotating tiers + blow-out-candles
    11. BALLOON ENDING     – final screen
    12. INIT                – wire everything up
===================================================================== */

(() => {
  'use strict';

  /* ===================================================================
     1. CONFIG — edit these to personalize the surprise
  =================================================================== */
  const CONFIG = {
    // 4-digit passcode required to unlock the lock screen.
    // Tip: a meaningful date works great, e.g. "1408" for Aug 14th.
    passcode: '0606',
    passcodeHint: 'Gợi ý: ngày mình quen nhau ❤️',

    mainPhoto: 'assets/images/main-photo.svg',

    songs: [
      { title: 'In Love x Có Đôi Điều',  cover: 'assets/images/cover1.svg', src: 'assets/music/song1.mp3' },
      { title: 'Ai Ngoài Anh',           cover: 'assets/images/cover2.svg', src: 'assets/music/song2.mp3' },
      { title: 'Track 06 x Nói Này Có Anh', cover: 'assets/images/cover3.svg', src: 'assets/music/song3.mp3' },
      { title: 'Missing You',            cover: 'assets/images/cover4.svg', src: 'assets/music/song4.mp3' }
    ],

    // Each string becomes one "typed" paragraph in the letter.
    // Leave a blank string '' to insert a pause/blank line.
    letterParagraphs: [
      'Gửi người con gái anh yêu,',
      'Hôm nay là một ngày đặc biệt.',
      '',
      'Cảm ơn em vì đã luôn ở bên anh, mang đến cho anh những khoảnh khắc ấm áp và ý nghĩa. Em là món quà quý giá nhất mà cuộc sống đã dành cho anh.',
      '',
      'Sinh nhật vui vẻ nhé, cô gái của anh! 🐱🌸'
    ],

    gallery: [
      { src: 'assets/images/photo1.svg',  caption: 'Lần đầu mình đi chơi cùng nhau' },
      { src: 'assets/images/photo2.svg',  caption: 'Buổi chiều hai đứa cười nhiều nhất' },
      { src: 'assets/images/photo3.svg',  caption: 'Em xinh nhất khi không để ý ống kính' },
      { src: 'assets/images/photo4.svg',  caption: 'Ngày mình ăn mừng một điều nhỏ' },
      { src: 'assets/images/photo5.svg',  caption: 'Chuyến đi mình nhắc lại mãi' },
      { src: 'assets/images/photo6.svg',  caption: 'Một buổi tối rất bình yên' }
    ],

    // photos wrapped around the 3D cake tiers (top tier uses first N, bottom uses the rest)
    // tip: each tier repeats its photo list to fill faceCount below — more faces = a rounder-looking cake.
    cakeTopPhotos:    ['assets/images/photo7.svg', 'assets/images/photo8.svg', 'assets/images/photo9.svg'],
    cakeBottomPhotos: ['assets/images/photo10.svg', 'assets/images/photo11.svg', 'assets/images/photo12.svg', 'assets/images/photo1.svg', 'assets/images/photo2.svg'],
    cakeTopFaceCount: 6,
    cakeBottomFaceCount: 10,

    // photos floating up as balloons in the finale (reuses gallery photos by default)
    balloonPhotos: [
      'assets/images/photo3.svg', 'assets/images/photo5.svg', 'assets/images/photo7.svg',
      'assets/images/photo9.svg', 'assets/images/photo11.svg', 'assets/images/photo2.svg',
      'assets/images/photo4.svg', 'assets/images/photo6.svg'
    ],

    popSoundSrc: 'assets/pop.mp3'
  };

  /* ===================================================================
     2. UTILITIES
  =================================================================== */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const rand = (min, max) => Math.random() * (max - min) + min;
  const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function formatTime(seconds){
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  /** Plays a short sound effect; fails silently if autoplay is blocked. */
  function playSfx(src, volume = 0.5){
    try{
      const sfx = new Audio(src);
      sfx.volume = volume;
      sfx.play().catch(() => { /* autoplay blocked — ignore */ });
    } catch (err){ /* Audio not supported — ignore */ }
  }

  /* ===================================================================
     3. BACKGROUND PETALS — ambient floating decoration
  =================================================================== */
  function initBgPetals(){
    const host = $('#bgPetals');
    if (!host) return;
    const glyphs = ['🌸', '🌼', '🌷', '💗'];
    const COUNT = 14;

    for (let i = 0; i < COUNT; i++){
      const span = document.createElement('span');
      span.textContent = choice(glyphs);
      span.style.left = `${rand(2, 98)}vw`;
      span.style.fontSize = `${rand(12, 22)}px`;
      span.style.opacity = String(rand(.25, .6));
      span.style.animationDuration = `${rand(10, 22)}s`;
      span.style.animationDelay = `-${rand(0, 20)}s`;
      host.appendChild(span);
    }
  }

  /* ===================================================================
     4. AUDIO — unlock veil (mobile autoplay needs a user gesture first)
  =================================================================== */
  function initAudioVeil(){
    const veil = $('#audioVeil');
    if (!veil) return;

    veil.addEventListener('click', () => {
      // "Warm up" the audio context with a near-silent blip so later
      // programmatic .play() calls are allowed by mobile browsers.
      playSfx(CONFIG.popSoundSrc, 0.001);
      veil.classList.add('is-hidden');
    }, { once: true });
  }

  /* ===================================================================
     5. LOCK SCREEN
  =================================================================== */
  function initLockScreen(onUnlock){
    const screen   = $('#screen-lock');
    const keypad   = $('#lockKeypad');
    const dotsHost = $('#lockDots');
    const dots     = $$('.dot', dotsHost);
    const hintText = $('#lockHintText');
    const bloom    = $('#bloomOverlay');

    let entered = '';
    let isLocked = false; // true while showing error/animating, blocks input

    function renderDots(){
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-filled', i < entered.length);
        dot.classList.remove('is-error');
      });
    }

    function shakeError(){
      isLocked = true;
      dots.forEach(d => d.classList.add('is-error'));
      dotsHost.style.animation = 'none';
      // force reflow so the animation can restart
      void dotsHost.offsetWidth;
      dotsHost.style.animation = 'shake-dots .45s ease';
      hintText.textContent = 'Chưa đúng rồi, thử lại nhé 🥺';
      hintText.classList.add('is-error');

      setTimeout(() => {
        entered = '';
        renderDots();
        hintText.textContent = CONFIG.passcodeHint;
        hintText.classList.remove('is-error');
        isLocked = false;
      }, 700);
    }

    function bloomThenUnlock(){
      isLocked = true;
      // scatter little flowers across the bloom overlay
      const glyphs = ['🌸', '🌺', '🌷', '🌼', '💐', '🌻'];
      bloom.innerHTML = '';
      const COUNT = 16;
      for (let i = 0; i < COUNT; i++){
        const span = document.createElement('span');
        span.textContent = choice(glyphs);
        span.style.left = `${rand(8, 92)}%`;
        span.style.top = `${rand(8, 92)}%`;
        span.style.setProperty('--rot', `${rand(-40, 40)}deg`);
        span.style.animationDelay = `${rand(0, .35)}s`;
        bloom.appendChild(span);
      }
      bloom.classList.add('is-blooming');
      playSfx(CONFIG.popSoundSrc, 0.55);
      screen.classList.add('is-unlocking');

      setTimeout(() => {
        screen.classList.remove('is-active');
        screen.classList.remove('is-unlocking');
        onUnlock();
      }, 1250);
    }

    function handleKey(key){
      if (isLocked) return;

      if (key === 'del'){
        entered = entered.slice(0, -1);
        renderDots();
        return;
      }
      if (key === 'hint'){
        hintText.textContent = CONFIG.passcodeHint;
        return;
      }

      if (entered.length >= 4) return;
      entered += key;
      renderDots();

      if (entered.length === 4){
        if (entered === CONFIG.passcode){
          bloomThenUnlock();
        } else {
          shakeError();
        }
      }
    }

    keypad.addEventListener('click', (e) => {
      const btn = e.target.closest('.key');
      if (!btn) return;
      handleKey(btn.dataset.key);
    });

    // allow physical keyboard too (nice for desktop testing)
    document.addEventListener('keydown', (e) => {
      if (!screen.classList.contains('is-active')) return;
      if (/^[0-9]$/.test(e.key)) handleKey(e.key);
      if (e.key === 'Backspace') handleKey('del');
    });

    hintText.textContent = CONFIG.passcodeHint;
    renderDots();
  }

  /* ===================================================================
     6. HOME MENU — grid navigation to overlays
  =================================================================== */
  function initHomeMenu(overlayControllers){
    const menuScreen = $('#screen-menu');
    const grid = $('#appGrid');

    grid.addEventListener('click', (e) => {
      const tile = e.target.closest('.app-tile');
      if (!tile || tile.disabled) return;
      const target = tile.dataset.target;
      if (!target || !overlayControllers[target]) return;
      playSfx(CONFIG.popSoundSrc, 0.45);
      overlayControllers[target].open();
    });

    return {
      show(){ menuScreen.hidden = false; menuScreen.classList.add('is-active'); },
      hide(){ menuScreen.classList.remove('is-active'); menuScreen.hidden = true; }
    };
  }

  /** Generic overlay open/close wiring shared by music/letter/gallery/cake panels. */
  function wireOverlayClose(overlayId, name, onOpen, onClose){
    const overlay = document.getElementById(overlayId);
    const closeBtns = $$(`[data-close="${name}"]`, overlay);

    function open(){
      overlay.hidden = false;
      if (typeof onOpen === 'function') onOpen();
    }
    function close(){
      overlay.hidden = true;
      if (typeof onClose === 'function') onClose();
    }

    closeBtns.forEach(btn => btn.addEventListener('click', close));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(); // click on backdrop closes
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !overlay.hidden) close();
    });

    return { open, close, el: overlay };
  }

  /* ===================================================================
     7. MUSIC PLAYER
  =================================================================== */
  function initMusicPlayer(){
    const playlistHost = $('#playlist');
    const art   = $('#playerArt');
    const title = $('#playerTitle');
    const seek  = $('#playerSeek');
    const tCur  = $('#playerTimeCurrent');
    const tTot  = $('#playerTimeTotal');
    const btnPlay = $('#btnPlay');
    const btnPrev = $('#btnPrev');
    const btnNext = $('#btnNext');
    const iconPlay = $('#iconPlay');

    const audio = new Audio();
    audio.preload = 'metadata';

    let index = 0;
    let isSeeking = false;

    const ICON_PLAY  = '<path d="M8 5v14l11-7L8 5z" fill="currentColor"/>';
    const ICON_PAUSE = '<path d="M7 5h4v14H7V5zm6 0h4v14h-4V5z" fill="currentColor"/>';

    function renderPlaylist(){
      playlistHost.innerHTML = '';
      CONFIG.songs.forEach((song, i) => {
        const li = document.createElement('li');
        li.className = 'playlist-item' + (i === index ? ' is-playing' : '');
        li.innerHTML = `
          <img src="${song.cover}" alt="" />
          <span class="playlist-item__name">${song.title}</span>
          <span class="playlist-item__eq"><span></span><span></span><span></span></span>
        `;
        li.addEventListener('click', () => loadSong(i, true));
        playlistHost.appendChild(li);
      });
    }

    function loadSong(i, autoplay){
      index = (i + CONFIG.songs.length) % CONFIG.songs.length;
      const song = CONFIG.songs[index];
      audio.src = song.src;
      art.src = song.cover;
      title.textContent = song.title;
      renderPlaylist();
      if (autoplay) play();
    }

    function play(){
      audio.play().then(() => {
        btnPlay.classList.add('is-playing');
        iconPlay.innerHTML = ICON_PAUSE;
      }).catch(() => { /* blocked until user gesture — ignore */ });
    }
    function pause(){
      audio.pause();
      btnPlay.classList.remove('is-playing');
      iconPlay.innerHTML = ICON_PLAY;
    }
    function togglePlay(){
      if (audio.paused) play(); else pause();
    }

    btnPlay.addEventListener('click', togglePlay);
    btnPrev.addEventListener('click', () => loadSong(index - 1, true));
    btnNext.addEventListener('click', () => loadSong(index + 1, true));

    audio.addEventListener('loadedmetadata', () => {
      seek.max = String(Math.floor(audio.duration) || 0);
      tTot.textContent = formatTime(audio.duration);
    });
    audio.addEventListener('timeupdate', () => {
      if (isSeeking) return;
      seek.value = String(Math.floor(audio.currentTime));
      tCur.textContent = formatTime(audio.currentTime);
    });
    audio.addEventListener('ended', () => loadSong(index + 1, true));

    seek.addEventListener('input', () => { isSeeking = true; tCur.textContent = formatTime(Number(seek.value)); });
    seek.addEventListener('change', () => {
      audio.currentTime = Number(seek.value);
      isSeeking = false;
    });

    loadSong(0, false);

    return {
      open(){ /* nothing extra needed; playlist already loaded */ },
      close(){ pause(); }
    };
  }

  /* ===================================================================
     8. LETTER — typewriter reveal
  =================================================================== */
  function initLetter(){
    const body = $('#letterBody');
    const skipBtn = $('#letterSkip');

    let timerId = null;
    let isTyping = false;

    function renderFullText(){
      clearTimeout(timerId);
      isTyping = false;
      body.innerHTML = CONFIG.letterParagraphs
        .map(p => `<p class="letter-line">${escapeHtml(p) || '&nbsp;'}</p>`)
        .join('');
    }

    function escapeHtml(str){
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    function typeOut(){
      clearTimeout(timerId);
      body.innerHTML = '';
      isTyping = true;

      let paraIndex = 0;
      let charIndex = 0;
      let currentP = null;

      function step(){
        if (paraIndex >= CONFIG.letterParagraphs.length){
          isTyping = false;
          const caret = body.querySelector('.caret');
          if (caret) caret.remove();
          return;
        }

        const fullPara = CONFIG.letterParagraphs[paraIndex];

        if (!currentP){
          currentP = document.createElement('p');
          currentP.className = 'letter-line';
          const caretSpan = document.createElement('span');
          caretSpan.className = 'caret';
          currentP.appendChild(caretSpan);
          body.appendChild(currentP);
        }

        if (charIndex < fullPara.length){
          currentP.textContent = fullPara.slice(0, charIndex + 1);
          const caretSpan = document.createElement('span');
          caretSpan.className = 'caret';
          currentP.appendChild(caretSpan);
          charIndex++;
          timerId = setTimeout(step, 32);
        } else {
          // paragraph finished — drop caret, move to next paragraph
          const caret = currentP.querySelector('.caret');
          if (caret) caret.remove();
          paraIndex++;
          charIndex = 0;
          currentP = null;
          timerId = setTimeout(step, fullPara === '' ? 80 : 420);
        }
      }
      step();
    }

    skipBtn.addEventListener('click', renderFullText);

    return {
      open(){ typeOut(); },
      close(){ clearTimeout(timerId); isTyping = false; }
    };
  }

  /* ===================================================================
     9. GALLERY — carousel + like burst
  =================================================================== */
  function initGallery(){
    const photoEl = $('#galleryPhoto');
    const captionEl = $('#galleryCaption');
    const prevBtn = $('#galleryPrev');
    const nextBtn = $('#galleryNext');
    const likeBtn = $('#galleryLike');
    const burstHost = $('#galleryBurst');

    let index = 0;

    function render(){
      const item = CONFIG.gallery[index];
      photoEl.src = item.src;
      photoEl.alt = item.caption;
      captionEl.textContent = item.caption;
      // restart the swap-in animation
      photoEl.style.animation = 'none';
      void photoEl.offsetWidth;
      photoEl.style.animation = '';
    }

    function go(delta){
      index = (index + delta + CONFIG.gallery.length) % CONFIG.gallery.length;
      render();
    }

    function burstHearts(){
      const glyphs = ['💗', '✨', '🌸', '💕'];
      const COUNT = 10;
      for (let i = 0; i < COUNT; i++){
        const span = document.createElement('span');
        span.textContent = choice(glyphs);
        span.style.setProperty('--bx', `${rand(-120, 120)}px`);
        span.style.setProperty('--by', `${rand(-220, -120)}px`);
        span.style.setProperty('--br', `${rand(-90, 90)}deg`);
        span.style.left = `${rand(35, 65)}%`;
        span.style.animationDelay = `${rand(0, .25)}s`;
        burstHost.appendChild(span);
        setTimeout(() => span.remove(), 1100);
      }
    }

    prevBtn.addEventListener('click', () => go(-1));
    nextBtn.addEventListener('click', () => go(1));
    likeBtn.addEventListener('click', () => {
      likeBtn.classList.remove('is-liked');
      void likeBtn.offsetWidth;
      likeBtn.classList.add('is-liked');
      burstHearts();
      playSfx(CONFIG.popSoundSrc, 0.4);
    });

    return {
      open(){ index = 0; render(); },
      close(){}
    };
  }

  /* ===================================================================
     10. CAKE 3D — rotating tiers built from radial "face" divs
  =================================================================== */
  function buildTier(tierEl, photos, radiusPx, faceCount){
    tierEl.innerHTML = '';
    const n = Math.max(faceCount || photos.length, photos.length);
    const step = 360 / n;
    // face width approximated so adjacent faces touch at the given radius
    const faceWidth = Math.round(2 * radiusPx * Math.tan(Math.PI / n)) + 2;

    tierEl.style.setProperty('--n', n);
    tierEl.style.setProperty('--step', `${step}deg`);
    tierEl.style.setProperty('--radius', `${radiusPx}px`);
    tierEl.style.setProperty('--face-w', `${faceWidth}px`);

    for (let i = 0; i < n; i++){
      const face = document.createElement('div');
      face.className = 'tier-face';
      face.style.setProperty('--i', i);
      face.style.backgroundImage = `url(${photos[i % photos.length]})`;
      tierEl.appendChild(face);
    }
    // frosting trim along the bottom edge of the tier
    const frosting = document.createElement('div');
    frosting.className = 'tier-face--frosting';
    tierEl.appendChild(frosting);
  }

  function initCake(){
    const cakeEl = $('#cake3d');
    const tierTop = $('#tierTop');
    const tierBottom = $('#tierBottom');
    const caption = $('#cakeCaption');
    const blowBtn = $('#cakeBlowBtn');
    const reactBtn = $('#cakeReact');
    const flash = $('#cakeFlash');

    let built = false;
    let blown = false;

    function build(){
      if (built) return;
      buildTier(tierTop, CONFIG.cakeTopPhotos, 59, CONFIG.cakeTopFaceCount);
      buildTier(tierBottom, CONFIG.cakeBottomPhotos, 85, CONFIG.cakeBottomFaceCount);
      built = true;
    }

    function blowCandles(onDone){
      if (blown) return;
      blown = true;
      cakeEl.classList.add('is-blown');
      blowBtn.disabled = true;
      caption.textContent = 'Ước đã thành rồi đó 💫';
      playSfx(CONFIG.popSoundSrc, 0.5);

      flash.classList.add('is-flashing');
      setTimeout(() => {
        flash.classList.remove('is-flashing');
        if (typeof onDone === 'function') onDone();
      }, 950);
    }

    reactBtn.addEventListener('click', () => {
      reactBtn.textContent = choice(['😍', '🥰', '💖', '🎉']);
      playSfx(CONFIG.popSoundSrc, 0.35);
    });

    blowBtn.addEventListener('click', () => {
      blowCandles(() => {
        // after the flash, jump straight to the balloon finale
        document.dispatchEvent(new CustomEvent('cake:blown'));
      });
    });

    return {
      open(){
        build();
        // reset for repeat visits
        blown = false;
        blowBtn.disabled = false;
        cakeEl.classList.remove('is-blown');
        caption.textContent = 'Nhắm mắt, ước một điều, rồi chạm vào nến để thổi nhé 🕯️';
      },
      close(){}
    };
  }

  /* ===================================================================
     11. BALLOON ENDING
  =================================================================== */
  function initBalloonEnding(onReplay){
    const screen = $('#screen-balloon');
    const field = $('#balloonField');
    const replayBtn = $('#balloonReplay');

    function spawnBalloons(){
      field.innerHTML = '';
      CONFIG.balloonPhotos.forEach((src, i) => {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        balloon.style.left = `${rand(4, 86)}%`;
        balloon.style.setProperty('--drift', `${rand(-40, 40)}px`);
        balloon.style.animationDuration = `${rand(9, 15)}s`;
        balloon.style.animationDelay = `${(i * 0.5) + rand(0, .6)}s`;
        balloon.innerHTML = `
          <div class="balloon__body"><img src="${src}" alt="" /></div>
          <div class="balloon__string"></div>
        `;
        field.appendChild(balloon);
      });
    }

    replayBtn.addEventListener('click', () => {
      if (typeof onReplay === 'function') onReplay();
    });

    return {
      show(){
        screen.hidden = false;
        screen.classList.add('is-active');
        spawnBalloons();
      },
      hide(){
        screen.classList.remove('is-active');
        screen.hidden = true;
        field.innerHTML = '';
      }
    };
  }

  /* ===================================================================
     12. INIT — wire everything together
  =================================================================== */
  function init(){
    initBgPetals();
    initAudioVeil();

    // set main photo from config (so editing CONFIG is enough, no HTML edits needed)
    const mainPhotoImg = $('.lock-photo img');
    if (mainPhotoImg) mainPhotoImg.src = CONFIG.mainPhoto;

    const music  = initMusicPlayer();
    const letter = initLetter();
    const gallery = initGallery();
    const cake    = initCake();

    const musicCtrl  = wireOverlayClose('overlay-music',  'music',  music.open,  music.close);
    const letterCtrl = wireOverlayClose('overlay-letter', 'letter', letter.open, letter.close);
    const galleryCtrl = wireOverlayClose('overlay-gallery', 'gallery', gallery.open, gallery.close);
    const cakeCtrl    = wireOverlayClose('overlay-cake', 'cake', cake.open, cake.close);

    const homeMenu = initHomeMenu({
      music: musicCtrl,
      letter: letterCtrl,
      gallery: galleryCtrl,
      cake: cakeCtrl
    });

    const balloonEnding = initBalloonEnding(() => {
      // replay from the very beginning
      balloonEnding.hide();
      location.reload();
    });

    // Lock screen unlock -> reveal the home menu
    initLockScreen(() => {
      homeMenu.show();
    });

    // When candles are blown out on the cake, jump straight to the finale
    document.addEventListener('cake:blown', () => {
      cakeCtrl.close();
      homeMenu.hide();
      balloonEnding.show();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
