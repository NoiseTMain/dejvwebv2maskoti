(function () {
  let data = loadData();
  let galleryFilter = 'vše';

  function render() {
    renderNav();
    renderHero();
    renderMascots();
    renderGallery();
    renderPricing();
    renderTestimonials();
    renderFaq();
    renderFooter();
    renderFloating();
    applySeo();
    applyModeAndOrder();
    initReveal();
  }

  // ---------- Přepínač "Celý web" + pořadí sekcí ----------
  function applyModeAndOrder() {
    const full = data.settings.showFullSite;
    document.getElementById('navFull').classList.toggle('hidden', false); // nav se řeší přes viditelnost odkazů
    // schová odkazy na sekce, které v daném režimu nejsou k dispozici
    document.querySelectorAll('#navFull a[href^="#"], #navFooterServices a').forEach((a) => {
      const key = a.getAttribute('href')?.replace('#', '');
      const sec = data.sections.find((s) => s.key === key || (key === 'top' && s.key === 'hero'));
      if (sec && sec.fullOnly && !full) a.style.display = 'none';
      else a.style.display = '';
    });
    document.getElementById('navFooterServices').style.display = full ? '' : 'none';

    // zapnutí/vypnutí a pořadí sekcí podle admin nastavení
    data.sections.forEach((sec) => {
      const el = document.querySelector(`[data-section="${sec.key}"]`);
      if (!el) return;
      const shouldShow = sec.enabled && (full || !sec.fullOnly);
      el.style.display = shouldShow ? '' : 'none';
    });
    // fyzicky přeuspořádá sekce v DOM podle pořadí, v jakém jsou uložené
    // v data.sections (to pořadí admin mění šipkami nahoru/dolů)
    const footer = document.querySelector('.site-footer');
    data.sections.forEach((sec) => {
      const el = document.querySelector(`[data-section="${sec.key}"]`);
      if (el && footer) footer.parentNode.insertBefore(el, footer);
    });
  }

  function renderNav() {
    const mobile = document.getElementById('mobileNav');
    mobile.innerHTML = document.getElementById('navFull').innerHTML;
    document.getElementById('menuToggle').addEventListener('click', () => {
      mobile.classList.toggle('open');
    });
  }

  function renderHero() {
    document.getElementById('heroEyebrow').textContent = data.content.heroEyebrow;
    document.getElementById('heroTitle').textContent = data.content.heroTitle;
    document.getElementById('heroSubtitle').textContent = data.content.heroSubtitle;
    document.getElementById('heroCta').textContent = data.content.heroCta;
  }

  function renderMascots() {
    const grid = document.getElementById('mascotsGrid');
    const list = data.mascots.filter((m) => m.enabled);
    grid.innerHTML = list.map((m) => `
      <div class="mascot-card reveal">
        <div class="mascot-media">
          ${m.image ? `<img src="${escapeAttr(m.image)}" alt="${escapeAttr(m.name)}">` : '🧸'}
          ${m.popular ? '<span class="badge-popular">★ Nejoblíbenější</span>' : ''}
        </div>
        <div class="mascot-body">
          <h3>${escapeHtml(m.name)}</h3>
          <p>${escapeHtml(m.description)}</p>
        </div>
      </div>
    `).join('') || '<p style="color:rgba(255,248,239,.5)">Maskoti se právě aktualizují.</p>';
  }

  function renderGallery() {
    const items = data.gallery.filter((g) => g.enabled);
    const cats = ['vše', ...new Set(items.map((g) => g.category))];
    const filters = document.getElementById('galleryFilters');
    filters.innerHTML = cats.map((c) => `<button class="filter-btn ${c === galleryFilter ? 'active' : ''}" data-cat="${escapeAttr(c)}">${escapeHtml(c)}</button>`).join('');
    filters.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => { galleryFilter = btn.dataset.cat; renderGallery(); });
    });

    const visible = galleryFilter === 'vše' ? items : items.filter((g) => g.category === galleryFilter);
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = visible.map((g) => `<img src="${escapeAttr(g.url)}" alt="" loading="lazy" data-full="${escapeAttr(g.url)}">`).join('')
      || '<p style="color:rgba(27,16,53,.5)">Zatím žádné fotky v této kategorii.</p>';
    grid.querySelectorAll('img').forEach((img) => {
      img.addEventListener('click', () => openLightbox(img.dataset.full));
    });
  }

  function openLightbox(src) {
    document.getElementById('lightboxImg').src = src;
    document.getElementById('lightbox').classList.add('open');
  }
  document.getElementById('lightboxClose').addEventListener('click', () => document.getElementById('lightbox').classList.remove('open'));
  document.getElementById('lightbox').addEventListener('click', (e) => { if (e.target.id === 'lightbox') e.currentTarget.classList.remove('open'); });

  function renderPricing() {
    const grid = document.getElementById('pricingGrid');
    grid.innerHTML = data.pricing.filter((p) => p.enabled).map((p) => `
      <div class="price-card reveal">
        <h3>${escapeHtml(p.title)}</h3>
        <p class="desc">${escapeHtml(p.description)}</p>
        <div class="price-value">${p.priceFrom ? 'od ' + Number(p.priceFrom).toLocaleString('cs-CZ') : 'Na dotaz'}</div>
        ${p.priceFrom ? '<div class="price-unit">Kč / akce</div>' : ''}
      </div>
    `).join('');
  }

  function renderTestimonials() {
    const grid = document.getElementById('testimonialsGrid');
    grid.innerHTML = data.testimonials.filter((t) => t.enabled).map((t) => `
      <div class="card reveal">
        <div class="stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
        <p style="font-size:.9rem;color:rgba(27,16,53,.7);margin:12px 0 0">„${escapeHtml(t.quote)}“</p>
        <p class="display" style="margin:14px 0 0">${escapeHtml(t.author)}</p>
        <p style="font-size:.75rem;text-transform:uppercase;letter-spacing:.04em;color:rgba(27,16,53,.4);margin:2px 0 0">${escapeHtml(t.eventType)}</p>
      </div>
    `).join('');
  }

  function renderFaq() {
    const list = document.getElementById('faqList');
    list.innerHTML = data.faq.filter((f) => f.enabled).map((f, i) => `
      <div class="faq-item ${i === 0 ? 'open' : ''}" data-id="${f.id}">
        <button class="faq-q">${escapeHtml(f.question)} <span class="chev">▾</span></button>
        <div class="faq-a">${escapeHtml(f.answer)}</div>
      </div>
    `).join('');
    list.querySelectorAll('.faq-item').forEach((item) => {
      item.querySelector('.faq-q').addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        list.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  function renderFooter() {
    document.getElementById('footerPhone').textContent = '📞 ' + data.settings.phone;
    document.getElementById('footerEmail').textContent = '✉️ ' + data.settings.email;
    document.getElementById('year').textContent = new Date().getFullYear();
    const icons = { facebook: '📘', instagram: '📸', youtube: '▶️' };
    document.getElementById('socialRow').innerHTML = data.social.filter((s) => s.enabled).map((s) =>
      `<a href="${escapeAttr(s.url)}" target="_blank" rel="noreferrer">${icons[s.platform] || '🔗'}</a>`
    ).join('');
  }

  function renderFloating() {
    document.getElementById('callBtn').href = 'tel:' + data.settings.phone.replace(/\s+/g, '');
    document.getElementById('whatsappBtn').href = 'https://wa.me/' + data.settings.phone.replace(/[^\d]/g, '');
  }

  function applySeo() {
    document.getElementById('pageTitle').textContent = data.seo.title;
    document.getElementById('metaDescription').setAttribute('content', data.seo.description);
    document.getElementById('ogTitle').setAttribute('content', data.seo.title);
    document.getElementById('ogDescription').setAttribute('content', data.seo.description);
  }

  function initReveal() {
    const els = document.querySelectorAll('.reveal:not(.in)');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
  }

  // ---------- Kontaktní formulář ----------
  document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const lead = {
      id: uid('lead'),
      name: fd.get('name'), phone: fd.get('phone'), email: fd.get('email'),
      eventDate: fd.get('eventDate'), eventPlace: fd.get('eventPlace'), guestCount: fd.get('guestCount'),
      note: fd.get('note'), status: 'new', createdAt: new Date().toISOString()
    };
    data.leads = [lead, ...data.leads];
    saveData(data);
    e.target.classList.add('hidden');
    document.getElementById('contactSuccess').classList.remove('hidden');

    // Volitelné: pošli poptávku i na e-mail přes Formspree (viz README.md).
    // fetch('https://formspree.io/f/TVUJ_FORM_ID', { method: 'POST', headers: {Accept:'application/json'}, body: fd });
  });

  // ---------- Cookie lišta ----------
  if (!localStorage.getItem('cookie-consent')) document.getElementById('cookieBar').classList.add('show');
  document.getElementById('cookieAccept').addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'accepted');
    document.getElementById('cookieBar').classList.remove('show');
  });

  // ---------- Realtime napříč kartami stejného prohlížeče ----------
  onDataChanged((newData) => { data = newData; render(); });

  function escapeHtml(s) { return (s ?? '').toString().replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function escapeAttr(s) { return escapeHtml(s); }

  render();
})();
