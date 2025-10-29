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
    // mobil menü içindeki bağlantılara tıklandığında menüyü kapat
    mobileNav.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=>{
        navToggle.classList.remove('open');
        mobileNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded','false');
        mobileNav.setAttribute('aria-hidden','true');
        document.body.style.overflow = '';
      });
    });
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
  function createMailTo(subject, data){
    const body = [];
    if(data.name) body.push('Ad: ' + data.name);
    if(data.email) body.push('E-posta: ' + data.email);
    if(data.date) body.push('Tarih: ' + data.date);
    if(data.people) body.push('Kişi sayısı: ' + data.people);
    if(data.message) body.push('\nMesaj:\n' + data.message);
    const mail = 'mailto:info@golgerotalar.example'
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
          message: fd.get('message')
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

        // If a date is provided, create a simple .ics calendar file and prompt download
        if(data.date){
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
        }

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