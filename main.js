(function () {
  let settings, company, sections, items, cities, videos, pricing, faq, testimonials, social, seo;
  let catalogFilter = 'nafukovaci';
  let activeCity = null;

  async function loadAll() {
    [settings, company, sections, items, cities, videos, pricing, faq, testimonials, social, seo] = await Promise.all([
      DB.getSettings(), DB.getCompany(), DB.getSections(), DB.getItems(), DB.getGalleryCities(),
      DB.getVideos(), DB.getPricing(), DB.getFaq(), DB.getTestimonials(), DB.getSocial(), DB.getSeo()
    ]);
    const hero = await DB.getContentBlock('hero');
    const oNas = await DB.getContentBlock('o-nas');
    render(hero, oNas);
  }

  function render(hero, oNas) {
    renderNav();
    renderHero(hero);
    renderMascots();
    renderCatalog();
    renderCities();
    renderVideos();
    renderPricing();
    renderONas(oNas);
    renderTestimonials();
    renderFaq();
    renderFooter();
    applySeo();
    applyModeAndOrder();
    initReveal();
  }

  // ---------- Přepínač "Celý web" + pořadí/viditelnost sekcí ----------
  function applyModeAndOrder() {
    const full = settings.show_full_site;
    document.querySelectorAll('#navFull a[href^="#"], #navFooterServices a').forEach((a) => {
      const key = a.getAttribute('href')?.replace('#', '');
      const sec = sections.find((s) => s.key === key || (key === 'top' && s.key === 'hero'));
      a.style.display = sec && sec.full_only && !full ? 'none' : '';
    });
    document.getElementById('navFooterServices').style.display = full ? '' : 'none';

    sections.forEach((sec) => {
      const el = document.querySelector(`[data-section="${sec.key}"]`);
      if (!el) return;
      el.style.display = sec.enabled && (full || !sec.full_only) ? '' : 'none';
    });

    const footer = document.querySelector('.site-footer');
    sections.forEach((sec) => {
      const el = document.querySelector(`[data-section="${sec.key}"]`);
      if (el && footer) footer.parentNode.insertBefore(el, footer);
    });
  }

  function renderNav() {
    document.getElementById('mobileNav').innerHTML = document.getElementById('navFull').innerHTML;
    document.getElementById('menuToggle').addEventListener('click', () => document.getElementById('mobileNav').classList.toggle('open'));
  }

  function renderHero(hero) {
    if (!hero) return;
    document.getElementById('heroEyebrow').textContent = hero.eyebrow || '';
    document.getElementById('heroTitle').textContent = hero.title || '';
    document.getElementById('heroSubtitle').textContent = hero.subtitle || '';
    document.getElementById('heroCta').textContent = hero.cta || '';
  }

  function renderMascots() {
    const grid = document.getElementById('mascotsGrid');
    const list = items.filter((i) => i.category === 'maskot' && i.enabled);
    grid.innerHTML = list.map((m) => `
      <div class="mascot-card reveal">
        <div class="mascot-media">
          ${m.image_url ? `<img src="${escapeAttr(m.image_url)}" alt="${escapeAttr(m.name)}">` : '🧸'}
          ${m.popular ? '<span class="badge-popular">★ Nejoblíbenější</span>' : ''}
        </div>
        <div class="mascot-body"><h3>${escapeHtml(m.name)}</h3><p>${escapeHtml(m.description)}</p></div>
      </div>
    `).join('') || '<p style="color:rgba(255,248,239,.5)">Maskoti se právě aktualizují.</p>';
  }

  const CATEGORY_LABEL = { nafukovaci: 'Nafukovací atrakce', poutove: 'Pouťové atrakce', party: 'Párty program' };

  function renderCatalog() {
    const tabs = document.getElementById('catalogTabs');
    tabs.innerHTML = Object.entries(CATEGORY_LABEL).map(([key, label]) =>
      `<button class="catalog-tab ${catalogFilter === key ? 'active' : ''}" data-cat="${key}">${label}</button>`
    ).join('');
    tabs.querySelectorAll('.catalog-tab').forEach((btn) => btn.addEventListener('click', () => { catalogFilter = btn.dataset.cat; renderCatalog(); }));

    const grid = document.getElementById('catalogGrid');
    const list = items.filter((i) => i.category === catalogFilter && i.enabled);
    grid.innerHTML = list.map((i) => `
      <div class="catalog-card reveal">
        <div class="catalog-media">${i.image_url ? `<img src="${escapeAttr(i.image_url)}" alt="${escapeAttr(i.name)}">` : '🎪'}</div>
        <div class="catalog-body"><h4>${escapeHtml(i.name)}</h4></div>
      </div>
    `).join('') || '<p style="color:rgba(27,16,53,.5)">V této kategorii zatím nic není — doplňte v administraci.</p>';
  }

  function renderCities() {
    const grid = document.getElementById('cityGrid');
    const list = cities.filter((c) => c.enabled);
    grid.innerHTML = list.map((c) => `
      <div class="city-card reveal" data-city="${c.id}">
        <img src="${escapeAttr(c.cover_url || fallbackImg())}" alt="${escapeAttr(c.name)}">
        <span>${escapeHtml(c.name)}</span>
      </div>
    `).join('') || '<p style="color:rgba(255,248,239,.5)">Zatím žádná města — přidejte je v administraci.</p>';
    grid.querySelectorAll('[data-city]').forEach((el) => el.addEventListener('click', () => openCity(el.dataset.city)));
  }

  async function openCity(cityId) {
    activeCity = cities.find((c) => c.id === cityId);
    document.getElementById('cityView').classList.add('hidden');
    document.getElementById('cityPhotosView').classList.remove('hidden');
    document.getElementById('cityPhotosTitle').textContent = 'Fotky z akcí — ' + activeCity.name;
    const photos = (await DB.getGalleryPhotos(cityId)).filter((p) => p.enabled);
    const grid = document.getElementById('cityPhotosGrid');
    grid.innerHTML = photos.map((p) => `<img src="${escapeAttr(p.url)}" alt="" loading="lazy" data-full="${escapeAttr(p.url)}">`).join('')
      || '<p style="color:rgba(255,248,239,.5)">V tomto městě zatím nejsou fotky.</p>';
    grid.querySelectorAll('img').forEach((img) => img.addEventListener('click', () => openLightbox(img.dataset.full)));
  }
  document.getElementById('cityBackBtn').addEventListener('click', () => {
    document.getElementById('cityPhotosView').classList.add('hidden');
    document.getElementById('cityView').classList.remove('hidden');
  });

  function openLightbox(src) {
    document.getElementById('lightboxImg').src = src;
    document.getElementById('lightbox').classList.add('open');
  }
  document.getElementById('lightboxClose').addEventListener('click', () => document.getElementById('lightbox').classList.remove('open'));
  document.getElementById('lightbox').addEventListener('click', (e) => { if (e.target.id === 'lightbox') e.currentTarget.classList.remove('open'); });

  function renderVideos() {
    const grid = document.getElementById('videoGrid');
    grid.innerHTML = videos.filter((v) => v.enabled).map((v) => `
      <div class="reveal">
        <div class="video-frame"><iframe src="${escapeAttr(youtubeEmbed(v.youtube_url))}" title="${escapeAttr(v.title)}" loading="lazy" allowfullscreen></iframe></div>
        <p class="video-title">${escapeHtml(v.title)}</p>
      </div>
    `).join('') || '<p style="color:rgba(27,16,53,.5)">Videa se připravují — doplňte je v administraci.</p>';
  }
  function youtubeEmbed(url) {
    const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : url;
  }

  function renderPricing() {
    document.getElementById('pricingGrid').innerHTML = pricing.filter((p) => p.enabled).map((p) => `
      <div class="price-card reveal">
        <h3>${escapeHtml(p.title)}</h3>
        <p class="desc">${escapeHtml(p.description)}</p>
        <div class="price-value">${p.price_from ? 'od ' + Number(p.price_from).toLocaleString('cs-CZ') : 'Na dotaz'}</div>
        ${p.price_from ? '<div class="price-unit">Kč / akce</div>' : ''}
      </div>
    `).join('');
  }

  function renderONas(oNas) {
    document.getElementById('oNasText').textContent = oNas?.text || '';
    if (company) document.getElementById('statYears').textContent = (new Date().getFullYear() - company.founded_year) + '+';
    document.getElementById('statItems').textContent = items.filter((i) => i.enabled).length + '+';
  }

  function renderTestimonials() {
    document.getElementById('testimonialsGrid').innerHTML = testimonials.filter((t) => t.enabled).map((t) => `
      <div class="card reveal">
        <div class="stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
        <p style="font-size:.9rem;color:rgba(27,16,53,.7);margin:12px 0 0">„${escapeHtml(t.quote)}“</p>
        <p class="display" style="margin:14px 0 0">${escapeHtml(t.author)}</p>
        <p style="font-size:.75rem;text-transform:uppercase;letter-spacing:.04em;color:rgba(27,16,53,.4);margin:2px 0 0">${escapeHtml(t.event_type)}</p>
      </div>
    `).join('');
  }

  function renderFaq() {
    const list = document.getElementById('faqList');
    list.innerHTML = faq.filter((f) => f.enabled).map((f, i) => `
      <div class="faq-item ${i === 0 ? 'open' : ''}">
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
    document.getElementById('footerPhone').textContent = '📞 ' + settings.phone;
    document.getElementById('footerEmail').textContent = '✉️ ' + settings.email;
    document.getElementById('yearFrom').textContent = company?.founded_year ?? '2010';
    document.getElementById('year').textContent = new Date().getFullYear();
    if (company) {
      document.getElementById('legalRow').textContent =
        `${company.provozovatel} · IČO ${company.ico} · DIČ ${company.dic} · ${company.address}`;
    }
    const icons = { facebook: '📘', instagram: '📸', youtube: '▶️' };
    document.getElementById('socialRow').innerHTML = social.filter((s) => s.enabled).map((s) =>
      `<a href="${escapeAttr(s.url)}" target="_blank" rel="noreferrer">${icons[s.platform] || '🔗'}</a>`
    ).join('');
    document.getElementById('callBtn').href = 'tel:' + settings.phone.replace(/\s+/g, '');
    document.getElementById('whatsappBtn').href = 'https://wa.me/' + settings.phone.replace(/[^\d]/g, '');
  }

  function applySeo() {
    if (!seo) return;
    document.getElementById('pageTitle').textContent = seo.title;
    document.getElementById('metaDescription').setAttribute('content', seo.description);
    document.getElementById('ogTitle').setAttribute('content', seo.title);
    document.getElementById('ogDescription').setAttribute('content', seo.description);
  }

  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
  }

  // ---------- Kontaktní formulář ----------
  document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await DB.submitLead({
      name: fd.get('name'), phone: fd.get('phone'), email: fd.get('email'),
      event_date: fd.get('eventDate') || null, event_place: fd.get('eventPlace'),
      guest_count: fd.get('guestCount'), note: fd.get('note')
    });
    e.target.classList.add('hidden');
    document.getElementById('contactSuccess').classList.remove('hidden');
  });

  // ---------- Cookie lišta ----------
  if (!localStorage.getItem('cookie-consent')) document.getElementById('cookieBar').classList.add('show');
  document.getElementById('cookieAccept').addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'accepted');
    document.getElementById('cookieBar').classList.remove('show');
  });

  // ---------- Skrytý vstup do administrace: 5× klik na logo ----------
  let logoClicks = 0, logoClickTimer = null;
  document.getElementById('logoClick').addEventListener('click', (e) => {
    logoClicks += 1;
    clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => { logoClicks = 0; }, 2500);
    if (logoClicks >= 5) {
      e.preventDefault();
      logoClicks = 0;
      window.location.href = 'admin.html';
    }
  });

  // ---------- Realtime napříč VŠEMI návštěvníky (ne jen kartami) ----------
  DB.subscribeRealtime(() => loadAll());

  function fallbackImg() {
    return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%233D2A66%22/%3E%3C/svg%3E';
  }
  function escapeHtml(s) { return (s ?? '').toString().replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function escapeAttr(s) { return escapeHtml(s); }

  loadAll();
})();
