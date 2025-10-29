// Küçük etkileşimler: giriş butonu ve tarih güncellemesi
(function(){
  const enterBtn = document.getElementById('enter-btn');
  const hero = document.getElementById('hero');
  const video = document.getElementById('hero-video');
  const pageTransition = document.getElementById('page-transition');

  // küçük helper: navigate with transition
  function navigateWithTransition(href){
    if(pageTransition){
      pageTransition.classList.add('active');
    }
    if(video && !video.paused){ try{ video.pause(); }catch(e){} }
    setTimeout(()=>{ window.location.href = href; }, 700);
  }

  if(enterBtn){
    enterBtn.addEventListener('click', function(e){
      e.preventDefault();
      // fade out hero (visual) and run page transition
      if(hero) hero.classList.add('fade-out');
      navigateWithTransition(enterBtn.getAttribute('href'));
    });
  }

  // year update for footer(s)
  try{
    const y = new Date().getFullYear();
    const el = document.getElementById('year');
    if(el) el.textContent = y;
  }catch(e){}

  // Scroll reveal: IntersectionObserver ile .reveal öğelerini görünür hale getir
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  if('IntersectionObserver' in window && revealEls.length){
    const io = new IntersectionObserver((entries, obs)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('show');
          obs.unobserve(entry.target);
        }
      });
    },{threshold:0.12,rootMargin:'0px 0px -8% 0px'});

    revealEls.forEach((el, i)=>{
      // küçük gecikme ekle (stagger) - sadece görsel
      el.style.transitionDelay = (i * 70) + 'ms';
      io.observe(el);
    });
  } else {
    // fallback: hemen göster
    revealEls.forEach(el => el.classList.add('show'));
  }

  // küçük başlangıç animasyonu: hero öğelerini biraz gecikmeli göster
  document.addEventListener('DOMContentLoaded', ()=>{
    const heroItems = document.querySelectorAll('.hero-item.reveal');
    heroItems.forEach((it, idx)=>{
      setTimeout(()=> it.classList.add('show'), 90 + idx * 80);
    });
  });

  // Mobil menü toggle
  const navToggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if(navToggle && mobileNav){
    navToggle.addEventListener('click', ()=>{
      const isOpen = navToggle.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileNav.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      // sayfa kaymasını engelle
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    // mobil menü içindeki bağlantılara tıklama davranışı: navigasyonu garanti et
    // (tek bir handler ile hem sayfa içi anchor hem sayfa değiştirme işler)
    mobileNav.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', (ev)=>{
        const href = a.getAttribute('href');
        // debug log for troubleshooting (visible in F12 Console)
        try{ console.log('mobileNav click', href); }catch(e){}
        // close the menu visually
        setTimeout(closeMobileNav, 50);
        // If this is an in-page anchor, update hash after closing
        if(href && href.startsWith('#')){
          ev.preventDefault();
          setTimeout(()=>{ location.hash = href; }, 120);
          return;
        }
        // If the link explicitly points to blog.html, force navigation after a short delay
        if(href && href.replace(/\?.*/,'').endsWith('blog.html')){
          ev.preventDefault();
          setTimeout(()=>{ window.location.href = href; }, 120);
          return;
        }
        // otherwise allow the browser to handle navigation naturally
      });
    });

    // extra: pointerdown handler for touch devices to ensure immediate navigation for blog link
    mobileNav.addEventListener('pointerdown', function(e){
      const a = e.target.closest && e.target.closest('a');
      if(!a) return;
      const href = a.getAttribute('href') || '';
      try{ console.log('mobileNav pointerdown', href); }catch(_){ }
      if(href.replace(/\?.*/,'').endsWith('blog.html')){
        e.preventDefault();
        closeMobileNav();
        // small timeout so close animation begins before navigation
        setTimeout(()=>{ window.location.href = href; }, 80);
      }
    }, {passive:false});
      // helper to close mobile nav from code
      function closeMobileNav(){
        navToggle.classList.remove('open');
        mobileNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded','false');
        mobileNav.setAttribute('aria-hidden','true');
        document.body.style.overflow = '';
      }

      // Add a visible close button to mobile nav for easier UX
      if(!mobileNav.querySelector('.mobile-close')){
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mobile-close';
        btn.setAttribute('aria-label','Menüyü kapat');
        btn.textContent = '✕';
        btn.style.position = 'absolute';
        btn.style.top = '12px';
        btn.style.right = '12px';
        btn.style.background = 'transparent';
        btn.style.border = '0';
        btn.style.color = '#fff';
        btn.style.fontSize = '24px';
        btn.style.cursor = 'pointer';
        mobileNav.appendChild(btn);
        btn.addEventListener('click', closeMobileNav);
      }

      // (link click handling implemented above)

      // Close mobile nav on Escape key for accessibility
      document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ closeMobileNav(); } });
  }

  // Lazy load için ek IntersectionObserver (img[data-src])
  const lazyImgs = Array.from(document.querySelectorAll('img.lazy'));
  if('IntersectionObserver' in window && lazyImgs.length){
    const imgIO = new IntersectionObserver((entries, obs)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const img = entry.target;
          const src = img.getAttribute('data-src');
          if(src){ img.src = src; img.removeAttribute('data-src'); }
          img.classList.remove('lazy');
          obs.unobserve(img);
        }
      });
    },{rootMargin:'0px 0px 120px 0px',threshold:0.01});
    lazyImgs.forEach(i=>imgIO.observe(i));
  }

  /* Community: local comments (index.html) */
  // Feature flag: keep comments UI present but submission disabled by default
  const COMMUNITY_COMMENTS_ENABLED = false; // set to true to allow local comments (not recommended for public sites)

  function renderCommunityComments(){
    try{
      const listEl = document.getElementById('community-list');
      if(!listEl) return;
      const key = 'gr_public_comments_v1';
        // If comments are disabled, show a clear message instead of rendering saved comments
        if(!COMMUNITY_COMMENTS_ENABLED){
          listEl.innerHTML = '<p style="color:var(--muted)">Yorumlar şu an devre dışıdır.</p>';
          return;
        }

        const items = JSON.parse(localStorage.getItem(key) || '[]').slice().reverse();
        listEl.innerHTML = '';
        if(items.length === 0){ listEl.innerHTML = '<p style="color:var(--muted)">Henüz yorum yok. İlk yorumu siz bırakın!</p>'; return }
        items.forEach(it=>{
          const el = document.createElement('div');
          el.style.background = 'var(--card)';
          el.style.padding = '.6rem';
          el.style.borderRadius = '8px';
          el.innerHTML = '<strong style="color:var(--gold)">' + (it.name || 'Anonim') + '</strong> <div style="color:var(--muted);font-size:.9rem;margin-top:.25rem">' + (new Date(it.createdAt).toLocaleString()) + '</div><p style="margin-top:.4rem">' + (it.comment || '') + '</p>';
          listEl.appendChild(el);
        });
    }catch(e){ console.warn('renderCommunityComments', e) }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    // local community form handling
    try{
      const f = document.getElementById('community-local-form');
      const key = 'gr_public_comments_v1';
      if(f){
        // If comments are disabled, show a non-intrusive message and keep inputs disabled
        if(!COMMUNITY_COMMENTS_ENABLED){
          try{
            // disable inputs and buttons
            Array.from(f.querySelectorAll('input,textarea,button')).forEach(el=>{ el.setAttribute('disabled','disabled'); });
            const submitBtn = f.querySelector('button[type="submit"]');
            if(submitBtn) submitBtn.textContent = 'Yorumlar devre dışı';
            // add a visible note (HTML contains #community-disabled-note placeholder)
            const note = document.getElementById('community-disabled-note');
            if(note) note.style.display = 'block';
          }catch(e){/* ignore */}
          // attach a guard to prevent accidental submission (defensive)
          f.addEventListener('submit', ev=>{
            ev.preventDefault();
            alert('Yorumlar şu an devre dışıdır. Etkinleştirmek için admin ile iletişime geçin.');
          });
        } else {
          f.addEventListener('submit', ev=>{
            ev.preventDefault();
            const fd = new FormData(f);
            const obj = { name: fd.get('name') || '', comment: fd.get('comment') || '', createdAt: new Date().toISOString() };
            const arr = JSON.parse(localStorage.getItem(key) || '[]');
            arr.push(obj);
            localStorage.setItem(key, JSON.stringify(arr));
            f.reset();
            renderCommunityComments();
          });
        }
      }
      const clearBtn = document.getElementById('community-clear');
      if(clearBtn){ clearBtn.addEventListener('click', ()=>{ if(confirm('Local yorumları temizlemek istiyor musunuz?')){ localStorage.removeItem('gr_public_comments_v1'); renderCommunityComments(); } }); }

      // Public embed removed: no client-side embed handling required

      // initial render
      renderCommunityComments();
    }catch(e){ /* ignore */ }
  });

  /* Lightbox / Gallery */
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = '<button class="btn-ctrl prev">‹</button><img src="" alt=""><button class="btn-ctrl next">›</button>';
  document.body.appendChild(lightbox);
  const lbImg = lightbox.querySelector('img');
  let galleryItems = [];
  let currentIndex = -1;

  function openLightbox(items, idx){
    galleryItems = items;
    currentIndex = idx;
    lbImg.src = galleryItems[currentIndex];
    lightbox.classList.add('open');
  }
  function closeLightbox(){ lightbox.classList.remove('open'); currentIndex = -1 }
  function showNext(){ if(currentIndex < galleryItems.length-1){ currentIndex++; lbImg.src = galleryItems[currentIndex]; } }
  function showPrev(){ if(currentIndex > 0){ currentIndex--; lbImg.src = galleryItems[currentIndex]; } }

  document.addEventListener('click', function(e){
    // open gallery
    const thumb = e.target.closest('.thumb');
    if(thumb && thumb.dataset && thumb.dataset.full){
      const container = thumb.closest('.gallery');
      const items = Array.from(container.querySelectorAll('.thumb')).map(t => t.dataset.full);
      const idx = Array.from(container.querySelectorAll('.thumb')).indexOf(thumb);
      openLightbox(items, idx);
      return;
    }
    // lightbox controls
    if(e.target.classList.contains('next')){ showNext(); return }
    if(e.target.classList.contains('prev')){ showPrev(); return }
    if(e.target === lightbox || e.target === lbImg){ closeLightbox(); return }
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeLightbox(); if(e.key === 'ArrowRight') showNext(); if(e.key === 'ArrowLeft') showPrev(); });

  /* Reservation modal (client-side mailto) */
  // Feature flag: enable or disable automatic .ics calendar file creation/download
  const ENABLE_ICS_DOWNLOAD = false; // set to true to re-enable .ics download
  // Optional public endpoints (set to a URL string to redirect users to your public form)
  const PUBLIC_RESERVATION_FORM_URL = ''; // e.g. 'https://docs.google.com/forms/d/e/FORM_ID/viewform'
  const PUBLIC_COMMENTS_FORM_URL = ''; // not used directly here; index.html contains an embed placeholder
  function createMailTo(subject, data){
    const body = [];
    if(data.name) body.push('Ad: ' + data.name);
    if(data.email) body.push('E-posta: ' + data.email);
    if(data.date) body.push('Tarih: ' + data.date);
    if(data.pickup) body.push('Kalkış Noktası: ' + data.pickup);
    if(data.departure_time) body.push('Kalkış Saati: ' + data.departure_time);
    if(data.people) body.push('Kişi sayısı: ' + data.people);
    if(data.message) body.push('\nMesaj:\n' + data.message);
    const mail = 'mailto:bugraakbugra@hotmail.com'
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(body.join('\n'));
    return mail;
  }

  // modal open/close handlers: works on route pages where modal exists
  const modal = document.querySelector('.modal-overlay');
  if(modal){
    document.addEventListener('click', function(e){
      const openBtn = e.target.closest('[data-open-reservation]');
      if(openBtn){
        modal.classList.add('open');
        modal.setAttribute('aria-hidden','false');
        return;
      }
      // Close modal when clicking the overlay or a close-type button inside modal
      const insideModal = e.target.closest('.modal');
      const isCloseBtn = e.target.classList.contains('close') || (e.target.tagName === 'BUTTON' && e.target.type === 'button' && insideModal);
      if(e.target === modal || isCloseBtn){
        // If the clicked button is a cancel-type button inside the modal, clear the form and remove status
        if(e.target.tagName === 'BUTTON' && e.target.type === 'button' && insideModal){
          const f = modal.querySelector('form');
          if(f){
            try{ f.reset(); }catch(e){ /* ignore */ }
            const st = modal.querySelector('.modal-status');
            if(st) st.remove();
          }
        }
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden','true');
      }
    });

    const form = modal.querySelector('form');
    if(form){
      form.addEventListener('submit', function(ev){
        ev.preventDefault();
        const fd = new FormData(form);
        const data = {
          name: fd.get('name'),
          email: fd.get('email'),
          date: fd.get('date'),
          people: fd.get('people'),
          message: fd.get('message'),
          pickup: fd.get('pickup'),
          departure_time: fd.get('departure_time')
        };
        const route = form.dataset.route || 'Rezervasyon';
  const mailto = createMailTo(route + ' - Rezervasyon', data);

        // Save reservation locally (so admin can later export / inspect)
        try{
          const key = 'gr_reservations_v1';
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          existing.push({route, data, createdAt: new Date().toISOString()});
          localStorage.setItem(key, JSON.stringify(existing));
        }catch(e){ console.warn('localStorage error', e) }

        // If a public reservation form URL is configured, open it instead of triggering mailto/download
        if(PUBLIC_RESERVATION_FORM_URL){
          try{
            window.open(PUBLIC_RESERVATION_FORM_URL, '_blank');
          }catch(e){ console.warn('open public form failed', e) }
          const status = document.createElement('div');
          status.className = 'modal-status';
          status.style.marginTop = '.6rem';
          status.style.color = 'var(--muted)';
          status.textContent = 'Rezervasyon formu yeni sekmede açıldı. Teşekkürler!';
          form.parentNode.insertBefore(status, form.nextSibling);
          // close modal after short delay
          setTimeout(()=>{ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }, 900);
          return;
        }

        // If a date is provided, optionally create a simple .ics calendar file and prompt download
        // (disabled by default because some browsers/downloads block the flow)
        if(data.date && ENABLE_ICS_DOWNLOAD){
          try{
            const uid = 'gr-' + Date.now();
            const dtStart = data.date.replace(/-/g,'') + 'T' + '200000';
            const dtEnd = data.date.replace(/-/g,'') + 'T' + '230000';
            const ics = [
              'BEGIN:VCALENDAR',
              'VERSION:2.0',
              'PRODID:-//Golge Rotalar//EN',
              'BEGIN:VEVENT',
              'UID:' + uid,
              'DTSTAMP:' + new Date().toISOString().replace(/[-:]|\.\d+/g,''),
              'DTSTART:' + dtStart,
              'DTEND:' + dtEnd,
              'SUMMARY:' + route + ' rezervasyon',
              'DESCRIPTION:' + (data.message || '') + '\nRezervasyon sahibi: ' + (data.name || ''),
              'END:VEVENT',
              'END:VCALENDAR'
            ].join('\r\n');
            const blob = new Blob([ics], {type: 'text/calendar'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = (route.replace(/\s+/g,'-').toLowerCase() || 'reservation') + '-' + data.date + '.ics';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }catch(e){ console.warn('ics generate failed', e) }
        } // end optional ics

        // Show a user-friendly confirmation in the modal
        const status = document.createElement('div');
        status.className = 'modal-status';
        status.style.marginTop = '.6rem';
        status.style.color = 'var(--muted)';
        status.textContent = 'Rezervasyon talebiniz hazırlanıyor. E-posta uygulamanız açılacaktır...';
        form.parentNode.insertBefore(status, form.nextSibling);

        // Open user's mail client with prefilled email (small timeout so status is visible)
        setTimeout(()=>{
          window.location.href = mailto;
        }, 600);
      });
    }
  }

})();