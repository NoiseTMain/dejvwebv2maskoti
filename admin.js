(function () {
  // ---------- Přihlášení (skutečný Firebase Auth) ----------
  document.getElementById('loginBtn').addEventListener('click', doLogin);
  document.getElementById('loginPassword').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });

  async function doLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    try {
      await DB.auth.signIn(email, password);
      boot();
    } catch (err) {
      document.getElementById('loginError').classList.remove('hidden');
    }
  }
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await DB.auth.signOutUser();
    location.reload();
  });

  let booted = false;
  DB.auth.onAuthChange((user) => { if (user && !booted) boot(); });

  function boot() {
    booted = true;
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('shell').classList.remove('hidden');
    window.addEventListener('hashchange', renderView);
    if (!location.hash) location.hash = '#dashboard';
    renderView();
  }

  // ---------- Dark mode ----------
  if (localStorage.getItem('admin-dark') === '1') document.body.classList.add('dark');
  document.getElementById('darkToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('admin-dark', document.body.classList.contains('dark') ? '1' : '0');
  });
  document.getElementById('menuBtn').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));

  // ---------- Router ----------
  const VIEWS = {
    dashboard: renderDashboard, prepinac: renderPrepinac, texty: renderTexty,
    katalog: renderKatalog, galeriemest: renderGalerieMest, videa: renderVidea,
    cenik: renderCenik, faq: renderFaq, kontakty: renderKontakty, socialni: renderSocialni, seo: renderSeo
  };
  function renderView() {
    const key = (location.hash || '#dashboard').replace('#', '');
    document.querySelectorAll('#sideNav a').forEach((a) => a.classList.toggle('active', a.dataset.view === key));
    document.getElementById('sidebar').classList.remove('open');
    (VIEWS[key] || renderDashboard)();
  }
  const $content = () => document.getElementById('content');

  // ================= DASHBOARD =================
  async function renderDashboard() {
    $content().innerHTML = '<p style="color:var(--muted)">Načítám…</p>';
    const [settings, items, leads, empty] = await Promise.all([DB.getSettings(), DB.getItems(), DB.getLeads(), DB.isEmpty()]);
    const newLeads = leads.filter((l) => l.status === 'new').length;
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">Přehled</h1>
      <p style="color:var(--muted);margin:0 0 20px">Vítejte zpět v administraci webu Maskoti · Atrakce365.</p>

      ${empty ? `
        <div class="panel" style="background:rgba(255,182,72,.15)">
          <h2>První spuštění — databáze je prázdná</h2>
          <p class="desc">Naplňte ji výchozími daty převzatými ze starého webu (firemní údaje, katalog atrakcí, ceník, FAQ...). Bezpečné spustit jen jednou.</p>
          <button class="btn btn-coral" id="seedBtn">Naplnit výchozí data</button>
        </div>
      ` : ''}

      <div class="panel row-between" style="background:${settings.show_full_site ? 'rgba(51,199,160,.1)' : 'rgba(255,182,72,.12)'}">
        <div>
          <strong>Aktuální režim webu: ${settings.show_full_site ? 'Celý web Atrakce365' : 'Jen stránka Maskoti'}</strong>
          <p class="desc" style="margin-top:4px">Změna se projeví okamžitě u všech návštěvníků (skutečná databáze, ne jen tento prohlížeč).</p>
        </div>
        <a href="#prepinac" class="btn btn-ghost">Změnit</a>
      </div>

      <div class="stat-grid">
        <div class="stat-card"><div class="label">🎪 Položek v katalogu</div><div class="num">${items.length}</div></div>
        <div class="stat-card"><div class="label">🐻 z toho maskotů</div><div class="num">${items.filter((i) => i.category === 'maskot').length}</div></div>
        <div class="stat-card"><div class="label">✉️ Nových poptávek</div><div class="num">${newLeads}</div></div>
      </div>
    `;
    if (empty) {
      document.getElementById('seedBtn').addEventListener('click', async () => {
        document.getElementById('seedBtn').textContent = 'Nahrávám…';
        await DB.seedDefaultData(window.SEED_DATA);
        renderDashboard();
      });
    }
  }

  // ================= PŘEPÍNAČ + SEKCE =================
  async function renderPrepinac() {
    $content().innerHTML = '<p style="color:var(--muted)">Načítám…</p>';
    const [settings, sections] = await Promise.all([DB.getSettings(), DB.getSections()]);
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">Přepínač webu &amp; sekce</h1>
      <p style="color:var(--muted);margin:0 0 20px">Klíčové nastavení celého webu — funguje pro všechny návštěvníky okamžitě.</p>
      <div class="panel">
        <h2>Zobrazovat kompletní web Atrakce365</h2>
        <p class="desc">Zapnuto: celý web (služby, atrakce, o nás...). Vypnuto: web se okamžitě přepne na jednostránkovou nabídku Maskotů.</p>
        <div style="display:flex;align-items:center;gap:12px">
          <div class="switch ${settings.show_full_site ? 'on' : ''}" id="fullSiteSwitch"></div>
          <span>${settings.show_full_site ? 'Celý web je zapnutý' : 'Zobrazuje se jen stránka Maskoti'}</span>
        </div>
      </div>
      <div class="panel">
        <h2>Sekce úvodní stránky</h2>
        <p class="desc">Sekce označené jako "celý web" se v režimu Maskoti automaticky skryjí.</p>
        <div id="sectionsList"></div>
      </div>
    `;
    document.getElementById('fullSiteSwitch').addEventListener('click', async () => {
      await DB.updateSettings({ show_full_site: !settings.show_full_site });
      renderPrepinac();
    });
    const list = document.getElementById('sectionsList');
    list.innerHTML = sections.map((s, i) => `
      <div class="item-row">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="display:flex;flex-direction:column;gap:2px">
            <button class="btn-ghost" style="border:none;background:none;padding:0" data-move="${i}:-1" ${i === 0 ? 'disabled' : ''}>▲</button>
            <button class="btn-ghost" style="border:none;background:none;padding:0" data-move="${i}:1" ${i === sections.length - 1 ? 'disabled' : ''}>▼</button>
          </div>
          <span>${escapeHtml(s.label)}${s.full_only ? ' <span class="pill" style="background:rgba(255,182,72,.18);color:#c8791a">celý web</span>' : ''}</span>
        </div>
        <div class="switch ${s.enabled ? 'on' : ''}" data-toggle="${s.key}"></div>
      </div>
    `).join('');
    list.querySelectorAll('[data-toggle]').forEach((el) => el.addEventListener('click', async () => {
      const s = sections.find((x) => x.key === el.dataset.toggle);
      await DB.updateSection(s.key, { enabled: !s.enabled });
      renderPrepinac();
    }));
    list.querySelectorAll('[data-move]').forEach((el) => el.addEventListener('click', async () => {
      const [idx, dir] = el.dataset.move.split(':').map(Number);
      const target = idx + dir;
      if (target < 0 || target >= sections.length) return;
      [sections[idx], sections[target]] = [sections[target], sections[idx]];
      await DB.setSectionsOrder(sections);
      renderPrepinac();
    }));
  }

  // ================= EDITOR TEXTŮ =================
  async function renderTexty() {
    $content().innerHTML = '<p style="color:var(--muted)">Načítám…</p>';
    const hero = (await DB.getContentBlock('hero')) || {};
    const oNas = (await DB.getContentBlock('o-nas')) || {};
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">Editor textů</h1>
      <p style="color:var(--muted);margin:0 0 20px">Uloží se okamžitě na web pro všechny návštěvníky.</p>
      <div class="panel">
        <h2>Hero — úvodní sekce</h2>
        <label style="font-size:.78rem;color:var(--muted)">Horní štítek</label>
        <input class="field" id="fEyebrow" value="${escapeAttr(hero.eyebrow || '')}" style="margin-bottom:10px">
        <label style="font-size:.78rem;color:var(--muted)">Hlavní nadpis</label>
        <input class="field" id="fTitle" value="${escapeAttr(hero.title || '')}" style="margin-bottom:10px">
        <label style="font-size:.78rem;color:var(--muted)">Podnadpis</label>
        <textarea class="field" id="fSubtitle" rows="3" style="margin-bottom:10px">${escapeHtml(hero.subtitle || '')}</textarea>
        <label style="font-size:.78rem;color:var(--muted)">Text tlačítka</label>
        <input class="field" id="fCta" value="${escapeAttr(hero.cta || '')}" style="margin-bottom:14px">
        <button class="btn btn-coral" id="saveHero">Uložit hero</button>
      </div>
      <div class="panel">
        <h2>O nás</h2>
        <textarea class="field" id="fONas" rows="5">${escapeHtml(oNas.text || '')}</textarea>
        <button class="btn btn-coral" style="margin-top:12px" id="saveONas">Uložit O nás</button>
      </div>
    `;
    document.getElementById('saveHero').addEventListener('click', async () => {
      await DB.saveContentBlock('hero', {
        eyebrow: document.getElementById('fEyebrow').value, title: document.getElementById('fTitle').value,
        subtitle: document.getElementById('fSubtitle').value, cta: document.getElementById('fCta').value
      });
      flashSaved('saveHero');
    });
    document.getElementById('saveONas').addEventListener('click', async () => {
      await DB.saveContentBlock('o-nas', { text: document.getElementById('fONas').value });
      flashSaved('saveONas');
    });
  }

  // ================= KATALOG ATRAKCÍ & MASKOTŮ =================
  const CAT_LABELS = { maskot: 'Maskoti', nafukovaci: 'Nafukovací atrakce', poutove: 'Pouťové atrakce', party: 'Párty program', ostatni: 'Ostatní' };
  let katalogFilter = 'maskot';

  async function renderKatalog() {
    $content().innerHTML = '<p style="color:var(--muted)">Načítám…</p>';
    const items = await DB.getItems();
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">Katalog atrakcí &amp; maskotů</h1>
      <p style="color:var(--muted);margin:0 0 20px">Jedno místo pro maskoty, nafukovací i pouťové atrakce a párty program.</p>
      <div class="panel">
        <h2>Přidat položku</h2>
        <div class="form-grid-2">
          <input class="field" id="iName" placeholder="Název">
          <select class="field" id="iCategory">${Object.entries(CAT_LABELS).map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select>
          <textarea class="field" id="iDesc" placeholder="Popis (volitelné)" style="grid-column:1/-1"></textarea>
          <input class="field" id="iImage" placeholder="URL obrázku (volitelné)">
          <input class="field" id="iVideo" placeholder="URL YouTube videa (volitelné)">
        </div>
        <button class="btn btn-coral" style="margin-top:12px" id="addItem">+ Přidat</button>
      </div>
      <div class="panel">
        <div class="cat-tabs" id="katTabs"></div>
        <div id="itemsList"></div>
      </div>
    `;
    document.getElementById('addItem').addEventListener('click', async () => {
      const name = document.getElementById('iName').value.trim();
      if (!name) return;
      await DB.addItem({
        name, category: document.getElementById('iCategory').value,
        description: document.getElementById('iDesc').value, image_url: document.getElementById('iImage').value || null,
        video_url: document.getElementById('iVideo').value || null, enabled: true
      });
      renderKatalog();
    });

    const tabs = document.getElementById('katTabs');
    tabs.innerHTML = Object.entries(CAT_LABELS).map(([v, l]) =>
      `<button class="tab-btn ${katalogFilter === v ? 'active' : ''}" data-cat="${v}">${l} (${items.filter((i) => i.category === v).length})</button>`
    ).join('');
    tabs.querySelectorAll('[data-cat]').forEach((b) => b.addEventListener('click', () => { katalogFilter = b.dataset.cat; renderKatalog(); }));

    const list = document.getElementById('itemsList');
    const filtered = items.filter((i) => i.category === katalogFilter);
    list.innerHTML = filtered.map((i) => `
      <div class="item-row">
        <div style="display:flex;align-items:center;gap:12px;min-width:0">
          <img class="item-thumb" src="${i.image_url || placeholderImg()}" alt="">
          <div style="min-width:0"><strong style="display:block">${escapeHtml(i.name)}</strong>${i.popular ? '<span class="pill">★ oblíbené</span>' : ''}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-shrink:0">
          <button class="btn btn-ghost" data-star="${i.id}">${i.popular ? '★' : '☆'}</button>
          <div class="switch ${i.enabled ? 'on' : ''}" data-toggle-item="${i.id}"></div>
          <button class="btn btn-ghost" data-del-item="${i.id}">🗑</button>
        </div>
      </div>
    `).join('') || '<p class="desc">V této kategorii zatím nic není.</p>';
    list.querySelectorAll('[data-toggle-item]').forEach((el) => el.addEventListener('click', async () => {
      const i = items.find((x) => x.id === el.dataset.toggleItem); await DB.updateItem(i.id, { enabled: !i.enabled }); renderKatalog();
    }));
    list.querySelectorAll('[data-star]').forEach((el) => el.addEventListener('click', async () => {
      const i = items.find((x) => x.id === el.dataset.star); await DB.updateItem(i.id, { popular: !i.popular }); renderKatalog();
    }));
    list.querySelectorAll('[data-del-item]').forEach((el) => el.addEventListener('click', async () => {
      await DB.deleteItem(el.dataset.delItem); renderKatalog();
    }));
  }

  // ================= GALERIE PODLE MĚST =================
  let openCityId = null;

  async function renderGalerieMest() {
    $content().innerHTML = '<p style="color:var(--muted)">Načítám…</p>';
    const cities = await DB.getGalleryCities();

    if (openCityId) {
      const city = cities.find((c) => c.id === openCityId);
      const photos = await DB.getGalleryPhotos(openCityId);
      $content().innerHTML = `
        <button class="btn btn-ghost" id="backToCities">← Zpět na seznam měst</button>
        <h1 class="display" style="font-size:1.4rem;margin:14px 0 4px">Fotky — ${escapeHtml(city?.name || '')}</h1>
        <div class="panel">
          <div class="form-grid-2">
            <input class="field" id="photoUrl" placeholder="URL fotky" style="grid-column:1/-1">
          </div>
          <button class="btn btn-coral" style="margin-top:12px" id="addPhoto">+ Přidat fotku</button>
        </div>
        <div class="panel"><div class="grid-thumbs" id="photosList"></div></div>
      `;
      document.getElementById('backToCities').addEventListener('click', () => { openCityId = null; renderGalerieMest(); });
      document.getElementById('addPhoto').addEventListener('click', async () => {
        const url = document.getElementById('photoUrl').value.trim();
        if (!url) return;
        await DB.addPhoto({ city_id: openCityId, url, enabled: true });
        renderGalerieMest();
      });
      const list = document.getElementById('photosList');
      list.innerHTML = photos.map((p) => `
        <div class="thumb-card">
          <img src="${escapeAttr(p.url)}" alt="">
          <div class="thumb-actions">
            <div class="switch ${p.enabled ? 'on' : ''}" data-toggle-photo="${p.id}" style="width:34px;height:20px"></div>
            <button data-del-photo="${p.id}" style="border:none;background:none">🗑</button>
          </div>
        </div>
      `).join('') || '<p class="desc">Zatím žádné fotky.</p>';
      list.querySelectorAll('[data-toggle-photo]').forEach((el) => el.addEventListener('click', async () => {
        const p = photos.find((x) => x.id === el.dataset.togglePhoto); await DB.updatePhoto(p.id, { enabled: !p.enabled }); renderGalerieMest();
      }));
      list.querySelectorAll('[data-del-photo]').forEach((el) => el.addEventListener('click', async () => {
        await DB.deletePhoto(el.dataset.delPhoto); renderGalerieMest();
      }));
      return;
    }

    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">Galerie podle měst</h1>
      <p style="color:var(--muted);margin:0 0 20px">Přidejte město, pak do něj nahrajte fotky z akcí konaných tam.</p>
      <div class="panel">
        <div class="form-grid-2">
          <input class="field" id="cityName" placeholder="Název města">
          <input class="field" id="cityCover" placeholder="URL úvodní fotky (volitelné)">
        </div>
        <button class="btn btn-coral" style="margin-top:12px" id="addCity">+ Přidat město</button>
      </div>
      <div id="citiesList"></div>
    `;
    document.getElementById('addCity').addEventListener('click', async () => {
      const name = document.getElementById('cityName').value.trim();
      if (!name) return;
      await DB.addCity({ name, cover_url: document.getElementById('cityCover').value || null, enabled: true });
      renderGalerieMest();
    });
    const list = document.getElementById('citiesList');
    list.innerHTML = cities.map((c) => `
      <div class="city-manage-card">
        ${c.cover_url ? `<img src="${escapeAttr(c.cover_url)}" alt="">` : ''}
        <div class="row-between">
          <strong>${escapeHtml(c.name)}</strong>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="switch ${c.enabled ? 'on' : ''}" data-toggle-city="${c.id}"></div>
            <button class="btn btn-ghost" data-open-city="${c.id}">Fotky →</button>
            <button class="btn btn-ghost" data-del-city="${c.id}">🗑</button>
          </div>
        </div>
      </div>
    `).join('') || '<p class="desc">Zatím žádná města.</p>';
    list.querySelectorAll('[data-open-city]').forEach((el) => el.addEventListener('click', () => { openCityId = el.dataset.openCity; renderGalerieMest(); }));
    list.querySelectorAll('[data-toggle-city]').forEach((el) => el.addEventListener('click', async () => {
      const c = cities.find((x) => x.id === el.dataset.toggleCity); await DB.updateCity(c.id, { enabled: !c.enabled }); renderGalerieMest();
    }));
    list.querySelectorAll('[data-del-city]').forEach((el) => el.addEventListener('click', async () => {
      await DB.deleteCity(el.dataset.delCity); renderGalerieMest();
    }));
  }

  // ================= VIDEA =================
  async function renderVidea() {
    $content().innerHTML = '<p style="color:var(--muted)">Načítám…</p>';
    const videos = await DB.getVideos();
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">Videa</h1>
      <p style="color:var(--muted);margin:0 0 20px">Vložte odkaz na YouTube video (třeba z vašeho kanálu) — na webu se zobrazí jako přehrávač.</p>
      <div class="panel">
        <div class="form-grid-2">
          <input class="field" id="vTitle" placeholder="Název videa">
          <input class="field" id="vUrl" placeholder="https://youtube.com/watch?v=...">
        </div>
        <button class="btn btn-coral" style="margin-top:12px" id="addVideo">+ Přidat video</button>
      </div>
      <div class="panel"><div id="videosList"></div></div>
    `;
    document.getElementById('addVideo').addEventListener('click', async () => {
      const title = document.getElementById('vTitle').value.trim();
      const url = document.getElementById('vUrl').value.trim();
      if (!title || !url) return;
      await DB.addVideo({ title, youtube_url: url, enabled: true });
      renderVidea();
    });
    const list = document.getElementById('videosList');
    list.innerHTML = videos.map((v) => `
      <div class="item-row">
        <div><strong>${escapeHtml(v.title)}</strong><br><span style="font-size:.78rem;color:var(--muted)">${escapeHtml(v.youtube_url)}</span></div>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="switch ${v.enabled ? 'on' : ''}" data-toggle-video="${v.id}"></div>
          <button class="btn btn-ghost" data-del-video="${v.id}">🗑</button>
        </div>
      </div>
    `).join('') || '<p class="desc">Zatím žádná videa.</p>';
    list.querySelectorAll('[data-toggle-video]').forEach((el) => el.addEventListener('click', async () => {
      const v = videos.find((x) => x.id === el.dataset.toggleVideo); await DB.updateVideo(v.id, { enabled: !v.enabled }); renderVidea();
    }));
    list.querySelectorAll('[data-del-video]').forEach((el) => el.addEventListener('click', async () => {
      await DB.deleteVideo(el.dataset.delVideo); renderVidea();
    }));
  }

  // ================= CENÍK =================
  async function renderCenik() {
    $content().innerHTML = '<p style="color:var(--muted)">Načítám…</p>';
    const pricing = await DB.getPricing();
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">Ceník</h1>
      <div class="panel">
        <div class="form-grid-2">
          <input class="field" id="pTitle" placeholder="Název balíčku">
          <input class="field" id="pPrice" placeholder="Cena od (Kč)" type="number">
          <textarea class="field" id="pDesc" placeholder="Popis" style="grid-column:1/-1"></textarea>
        </div>
        <button class="btn btn-coral" style="margin-top:12px" id="addPricing">+ Přidat balíček</button>
      </div>
      <div class="panel"><div id="pricingList"></div></div>
    `;
    document.getElementById('addPricing').addEventListener('click', async () => {
      const title = document.getElementById('pTitle').value.trim();
      if (!title) return;
      await DB.addPricing({ title, description: document.getElementById('pDesc').value, price_from: Number(document.getElementById('pPrice').value) || null, enabled: true });
      renderCenik();
    });
    const list = document.getElementById('pricingList');
    list.innerHTML = pricing.map((p) => `
      <div class="item-row">
        <div><strong>${escapeHtml(p.title)}</strong><br><span style="font-size:.78rem;color:var(--muted)">${p.price_from ? 'od ' + p.price_from + ' Kč' : 'na dotaz'}</span></div>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="switch ${p.enabled ? 'on' : ''}" data-toggle-price="${p.id}"></div>
          <button class="btn btn-ghost" data-del-price="${p.id}">🗑</button>
        </div>
      </div>
    `).join('') || '<p class="desc">Zatím žádné balíčky.</p>';
    list.querySelectorAll('[data-toggle-price]').forEach((el) => el.addEventListener('click', async () => {
      const p = pricing.find((x) => x.id === el.dataset.togglePrice); await DB.updatePricing(p.id, { enabled: !p.enabled }); renderCenik();
    }));
    list.querySelectorAll('[data-del-price]').forEach((el) => el.addEventListener('click', async () => {
      await DB.deletePricing(el.dataset.delPrice); renderCenik();
    }));
  }

  // ================= FAQ =================
  async function renderFaq() {
    $content().innerHTML = '<p style="color:var(--muted)">Načítám…</p>';
    const faq = await DB.getFaq();
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">Časté otázky</h1>
      <div class="panel">
        <input class="field" id="fqQ" placeholder="Otázka" style="margin-bottom:10px">
        <textarea class="field" id="fqA" placeholder="Odpověď"></textarea>
        <button class="btn btn-coral" style="margin-top:12px" id="addFaq">+ Přidat</button>
      </div>
      <div class="panel"><div id="faqAdminList"></div></div>
    `;
    document.getElementById('addFaq').addEventListener('click', async () => {
      const q = document.getElementById('fqQ').value.trim(), a = document.getElementById('fqA').value.trim();
      if (!q || !a) return;
      await DB.addFaq({ question: q, answer: a, enabled: true });
      renderFaq();
    });
    const list = document.getElementById('faqAdminList');
    list.innerHTML = faq.map((f) => `
      <div class="item-row">
        <div style="max-width:70%"><strong>${escapeHtml(f.question)}</strong><br><span style="font-size:.8rem;color:var(--muted)">${escapeHtml(f.answer)}</span></div>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="switch ${f.enabled ? 'on' : ''}" data-toggle-faq="${f.id}"></div>
          <button class="btn btn-ghost" data-del-faq="${f.id}">🗑</button>
        </div>
      </div>
    `).join('') || '<p class="desc">Zatím žádné otázky.</p>';
    list.querySelectorAll('[data-toggle-faq]').forEach((el) => el.addEventListener('click', async () => {
      const f = faq.find((x) => x.id === el.dataset.toggleFaq); await DB.updateFaq(f.id, { enabled: !f.enabled }); renderFaq();
    }));
    list.querySelectorAll('[data-del-faq]').forEach((el) => el.addEventListener('click', async () => {
      await DB.deleteFaq(el.dataset.delFaq); renderFaq();
    }));
  }

  // ================= KONTAKTY, POPTÁVKY & FIREMNÍ ÚDAJE (IČO...) =================
  async function renderKontakty() {
    $content().innerHTML = '<p style="color:var(--muted)">Načítám…</p>';
    const [settings, company, leads] = await Promise.all([DB.getSettings(), DB.getCompany(), DB.getLeads()]);
    const STATUS_LABEL = { new: 'Nová', contacted: 'Kontaktováno', done: 'Vyřízeno', archived: 'Archiv' };
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">Kontakty, poptávky &amp; firemní údaje</h1>
      <div class="panel">
        <h2>Kontakt na webu</h2>
        <div class="form-grid-2">
          <input class="field" id="cPhone" value="${escapeAttr(settings.phone)}" placeholder="Telefon">
          <input class="field" id="cEmail" value="${escapeAttr(settings.email)}" placeholder="E-mail">
        </div>
        <button class="btn btn-coral" style="margin-top:12px" id="saveContact">Uložit kontakt</button>
      </div>
      <div class="panel">
        <h2>Firemní / právní údaje (patička webu)</h2>
        <div class="form-grid-2">
          <input class="field" id="coName" value="${escapeAttr(company.provozovatel)}" placeholder="Provozovatel">
          <input class="field" id="coIco" value="${escapeAttr(company.ico)}" placeholder="IČO">
          <input class="field" id="coDic" value="${escapeAttr(company.dic)}" placeholder="DIČ">
          <input class="field" id="coYear" value="${company.founded_year}" type="number" placeholder="Rok založení">
          <input class="field" id="coAddress" value="${escapeAttr(company.address)}" placeholder="Adresa / sídlo" style="grid-column:1/-1">
        </div>
        <button class="btn btn-coral" style="margin-top:12px" id="saveCompany">Uložit firemní údaje</button>
      </div>
      <div class="panel">
        <h2>Poptávky z formuláře</h2>
        <div id="leadsList"></div>
      </div>
    `;
    document.getElementById('saveContact').addEventListener('click', async () => {
      await DB.updateSettings({ phone: document.getElementById('cPhone').value, email: document.getElementById('cEmail').value });
      flashSaved('saveContact');
    });
    document.getElementById('saveCompany').addEventListener('click', async () => {
      await DB.updateCompany({
        provozovatel: document.getElementById('coName').value, ico: document.getElementById('coIco').value,
        dic: document.getElementById('coDic').value, founded_year: Number(document.getElementById('coYear').value),
        address: document.getElementById('coAddress').value
      });
      flashSaved('saveCompany');
    });
    const list = document.getElementById('leadsList');
    list.innerHTML = leads.map((l) => `
      <div class="item-row" style="flex-direction:column;align-items:stretch">
        <div class="row-between">
          <strong>${escapeHtml(l.name)} · ${escapeHtml(l.phone)} · ${escapeHtml(l.email)}</strong>
          <select class="field" style="width:auto" data-status="${l.id}">
            ${Object.entries(STATUS_LABEL).map(([v, label]) => `<option value="${v}" ${l.status === v ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </div>
        <span style="font-size:.8rem;color:var(--muted)">${l.event_date || '—'} · ${escapeHtml(l.event_place || '—')} · ${escapeHtml(l.guest_count || '—')} hostů</span>
        ${l.note ? `<span style="font-size:.85rem;margin-top:4px">${escapeHtml(l.note)}</span>` : ''}
      </div>
    `).join('') || '<p class="desc">Zatím žádné poptávky.</p>';
    list.querySelectorAll('[data-status]').forEach((el) => el.addEventListener('change', async () => {
      await DB.updateLeadStatus(el.dataset.status, el.value);
    }));
  }

  // ================= SOCIÁLNÍ SÍTĚ =================
  async function renderSocialni() {
    $content().innerHTML = '<p style="color:var(--muted)">Načítám…</p>';
    const social = await DB.getSocial();
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">Sociální sítě</h1>
      <div class="panel">
        <div class="form-grid-2">
          <select class="field" id="sPlatform"><option value="facebook">Facebook</option><option value="instagram">Instagram</option><option value="youtube">YouTube</option></select>
          <input class="field" id="sUrl" placeholder="https://...">
        </div>
        <button class="btn btn-coral" style="margin-top:12px" id="addSocial">+ Přidat</button>
      </div>
      <div class="panel"><div id="socialList"></div></div>
    `;
    document.getElementById('addSocial').addEventListener('click', async () => {
      const url = document.getElementById('sUrl').value.trim();
      if (!url) return;
      await DB.addSocial({ platform: document.getElementById('sPlatform').value, url, enabled: true });
      renderSocialni();
    });
    const list = document.getElementById('socialList');
    list.innerHTML = social.map((s) => `
      <div class="item-row">
        <div><strong style="text-transform:capitalize">${escapeHtml(s.platform)}</strong><br><span style="font-size:.78rem;color:var(--muted)">${escapeHtml(s.url)}</span></div>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="switch ${s.enabled ? 'on' : ''}" data-toggle-social="${s.id}"></div>
          <button class="btn btn-ghost" data-del-social="${s.id}">🗑</button>
        </div>
      </div>
    `).join('') || '<p class="desc">Zatím žádné odkazy.</p>';
    list.querySelectorAll('[data-toggle-social]').forEach((el) => el.addEventListener('click', async () => {
      const s = social.find((x) => x.id === el.dataset.toggleSocial); await DB.updateSocial(s.id, { enabled: !s.enabled }); renderSocialni();
    }));
    list.querySelectorAll('[data-del-social]').forEach((el) => el.addEventListener('click', async () => {
      await DB.deleteSocial(el.dataset.delSocial); renderSocialni();
    }));
  }

  // ================= SEO =================
  async function renderSeo() {
    $content().innerHTML = '<p style="color:var(--muted)">Načítám…</p>';
    const seo = await DB.getSeo();
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">SEO</h1>
      <div class="panel">
        <label style="font-size:.78rem;color:var(--muted)">Meta title</label>
        <input class="field" id="seoTitle" value="${escapeAttr(seo.title)}" style="margin-bottom:10px">
        <label style="font-size:.78rem;color:var(--muted)">Meta description</label>
        <textarea class="field" id="seoDesc" rows="3">${escapeHtml(seo.description)}</textarea>
        <button class="btn btn-coral" style="margin-top:12px" id="saveSeo">Uložit SEO</button>
      </div>
    `;
    document.getElementById('saveSeo').addEventListener('click', async () => {
      await DB.updateSeo({ title: document.getElementById('seoTitle').value, description: document.getElementById('seoDesc').value });
      flashSaved('saveSeo');
    });
  }

  function flashSaved(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const original = btn.textContent;
    btn.textContent = '✓ Uloženo';
    setTimeout(() => { if (document.getElementById(btnId)) document.getElementById(btnId).textContent = original; }, 1200);
  }
  function placeholderImg() {
    return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e2e8f0%22/%3E%3C/svg%3E';
  }
  function escapeHtml(s) { return (s ?? '').toString().replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function escapeAttr(s) { return escapeHtml(s); }
})();
