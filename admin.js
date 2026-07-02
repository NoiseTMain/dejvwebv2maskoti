(function () {
  let data = loadData();

  // ---------- Přihlášení ----------
  const SESSION_KEY = 'maskoti_admin_session';
  function isLoggedIn() { return sessionStorage.getItem(SESSION_KEY) === '1'; }

  document.getElementById('loginBtn').addEventListener('click', doLogin);
  document.getElementById('loginPassword').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
  function doLogin() {
    const val = document.getElementById('loginPassword').value;
    if (val === data.settings.adminPassword) {
      sessionStorage.setItem(SESSION_KEY, '1');
      boot();
    } else {
      document.getElementById('loginError').classList.remove('hidden');
    }
  }
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  });

  function boot() {
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('shell').classList.remove('hidden');
    window.addEventListener('hashchange', renderView);
    if (!location.hash) location.hash = '#dashboard';
    renderView();
  }

  if (isLoggedIn()) boot();

  // ---------- Dark mode ----------
  if (localStorage.getItem('admin-dark') === '1') document.body.classList.add('dark');
  document.getElementById('darkToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('admin-dark', document.body.classList.contains('dark') ? '1' : '0');
  });

  // ---------- Mobilní menu ----------
  document.getElementById('menuBtn').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));

  // ---------- Router ----------
  const VIEWS = {
    dashboard: renderDashboard,
    prepinac: renderPrepinac,
    texty: renderTexty,
    maskoti: renderMaskoti,
    galerie: renderGalerie,
    cenik: renderCenik,
    faq: renderFaq,
    kontakty: renderKontakty,
    socialni: renderSocialni,
    seo: renderSeo
  };

  function renderView() {
    const key = (location.hash || '#dashboard').replace('#', '');
    document.querySelectorAll('#sideNav a').forEach((a) => a.classList.toggle('active', a.dataset.view === key));
    document.getElementById('sidebar').classList.remove('open');
    const fn = VIEWS[key] || renderDashboard;
    fn();
  }

  function persist() {
    saveData(data);
    // ve stejné kartě "storage" event nenaskočí -> ručně přerenderujeme
    renderView();
  }

  const $content = () => document.getElementById('content');

  // ================= DASHBOARD =================
  function renderDashboard() {
    const newLeads = data.leads.filter((l) => l.status === 'new').length;
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">Přehled</h1>
      <p style="color:var(--muted);margin:0 0 20px">Vítejte zpět v administraci webu Maskoti.</p>

      <div class="panel row-between" style="background:${data.settings.showFullSite ? 'rgba(51,199,160,.1)' : 'rgba(255,182,72,.12)'}">
        <div>
          <strong>Aktuální režim webu: ${data.settings.showFullSite ? 'Celý web' : 'Jen stránka Maskoti'}</strong>
          <p class="desc" style="margin-top:4px">Změna se projeví okamžitě u otevřených karet tohoto prohlížeče.</p>
        </div>
        <a href="#prepinac" class="btn btn-ghost">Změnit</a>
      </div>

      <div class="stat-grid">
        <div class="stat-card"><div class="label">🐻 Maskotů v nabídce</div><div class="num">${data.mascots.length}</div></div>
        <div class="stat-card"><div class="label">🖼️ Fotek v galerii</div><div class="num">${data.gallery.length}</div></div>
        <div class="stat-card"><div class="label">✉️ Nových poptávek</div><div class="num">${newLeads}</div></div>
      </div>

      <div class="panel">
        <h2>Poznámka k realtime</h2>
        <p class="desc" style="margin:0">
          Úpravy se ukládají do localStorage tohoto prohlížeče a okamžitě se promítnou do
          <a href="index.html" target="_blank" style="color:var(--coral);font-weight:600">index.html</a>,
          pokud ho máte otevřený v jiné kartě stejného zařízení. Pro sdílení dat mezi více zařízeními
          je potřeba doplnit backend — viz README.md.
        </p>
      </div>
    `;
  }

  // ================= PŘEPÍNAČ + SEKCE =================
  function renderPrepinac() {
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">Přepínač webu &amp; sekce</h1>
      <p style="color:var(--muted);margin:0 0 20px">Klíčové nastavení celého webu.</p>

      <div class="panel">
        <h2>Zobrazovat kompletní web</h2>
        <p class="desc">Zapnuto: celý web. Vypnuto: web se okamžitě přepne na jednostránkovou nabídku Maskotů — na stejné URL adrese.</p>
        <div style="display:flex;align-items:center;gap:12px">
          <div class="switch ${data.settings.showFullSite ? 'on' : ''}" id="fullSiteSwitch"></div>
          <span>${data.settings.showFullSite ? 'Celý web je zapnutý' : 'Zobrazuje se jen stránka Maskoti'}</span>
        </div>
      </div>

      <div class="panel">
        <h2>Sekce úvodní stránky</h2>
        <p class="desc">Zapínejte/vypínejte a měňte pořadí sekcí. Sekce označené (celý web) se v režimu "jen Maskoti" automaticky skryjí.</p>
        <div id="sectionsList"></div>
      </div>
    `;
    document.getElementById('fullSiteSwitch').addEventListener('click', () => {
      data.settings.showFullSite = !data.settings.showFullSite;
      persist();
    });

    const list = document.getElementById('sectionsList');
    list.innerHTML = data.sections.map((s, i) => `
      <div class="item-row">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="display:flex;flex-direction:column;gap:2px">
            <button class="btn-ghost" style="border:none;background:none;padding:0;font-size:.9rem" data-move="${i}:-1" ${i === 0 ? 'disabled' : ''}>▲</button>
            <button class="btn-ghost" style="border:none;background:none;padding:0;font-size:.9rem" data-move="${i}:1" ${i === data.sections.length - 1 ? 'disabled' : ''}>▼</button>
          </div>
          <span>${escapeHtml(s.label)}</span>
        </div>
        <div class="switch ${s.enabled ? 'on' : ''}" data-toggle-section="${s.key}"></div>
      </div>
    `).join('');
    list.querySelectorAll('[data-toggle-section]').forEach((el) => {
      el.addEventListener('click', () => {
        const sec = data.sections.find((s) => s.key === el.dataset.toggleSection);
        sec.enabled = !sec.enabled;
        persist();
      });
    });
    list.querySelectorAll('[data-move]').forEach((el) => {
      el.addEventListener('click', () => {
        const [idx, dir] = el.dataset.move.split(':').map(Number);
        const target = idx + dir;
        if (target < 0 || target >= data.sections.length) return;
        [data.sections[idx], data.sections[target]] = [data.sections[target], data.sections[idx]];
        persist();
      });
    });
  }

  // ================= EDITOR TEXTŮ =================
  function renderTexty() {
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">Editor textů</h1>
      <p style="color:var(--muted);margin:0 0 20px">Upravte hlavní texty hero sekce — uloží se okamžitě na web.</p>
      <div class="panel">
        <h2>Hero — úvodní sekce</h2>
        <label style="font-size:.78rem;color:var(--muted)">Horní štítek</label>
        <input class="field" id="fEyebrow" value="${escapeAttr(data.content.heroEyebrow)}" style="margin-bottom:10px">
        <label style="font-size:.78rem;color:var(--muted)">Hlavní nadpis</label>
        <input class="field" id="fTitle" value="${escapeAttr(data.content.heroTitle)}" style="margin-bottom:10px">
        <label style="font-size:.78rem;color:var(--muted)">Podnadpis</label>
        <textarea class="field" id="fSubtitle" rows="3" style="margin-bottom:10px">${escapeHtml(data.content.heroSubtitle)}</textarea>
        <label style="font-size:.78rem;color:var(--muted)">Text tlačítka</label>
        <input class="field" id="fCta" value="${escapeAttr(data.content.heroCta)}" style="margin-bottom:14px">
        <button class="btn btn-coral" id="saveTexty">Uložit</button>
        <span class="saved-note hidden" id="savedNoteTexty">✓ Uloženo</span>
      </div>
    `;
    document.getElementById('saveTexty').addEventListener('click', () => {
      data.content.heroEyebrow = document.getElementById('fEyebrow').value;
      data.content.heroTitle = document.getElementById('fTitle').value;
      data.content.heroSubtitle = document.getElementById('fSubtitle').value;
      data.content.heroCta = document.getElementById('fCta').value;
      saveData(data);
      document.getElementById('savedNoteTexty').classList.remove('hidden');
      setTimeout(renderTexty, 1200);
    });
  }

  // ================= MASKOTI =================
  function renderMaskoti() {
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">Maskoti</h1>
      <p style="color:var(--muted);margin:0 0 20px">Nabídka postav zobrazená na webu.</p>
      <div class="panel">
        <h2>Přidat maskota</h2>
        <div class="form-grid-2">
          <input class="field" id="mName" placeholder="Název">
          <select class="field" id="mCategory">
            <option>Pohádkové postavy</option><option>Zvířátka</option><option>Superhrdinové</option>
          </select>
          <textarea class="field" id="mDesc" placeholder="Krátký popis" style="grid-column:1/-1"></textarea>
          <input class="field" id="mImage" placeholder="URL obrázku (volitelné)" style="grid-column:1/-1">
        </div>
        <button class="btn btn-coral" style="margin-top:12px" id="addMascot">+ Přidat maskota</button>
      </div>
      <div class="panel">
        <h2>Seznam</h2>
        <div id="mascotList"></div>
      </div>
    `;
    document.getElementById('addMascot').addEventListener('click', () => {
      const name = document.getElementById('mName').value.trim();
      if (!name) return;
      data.mascots.push({
        id: uid('m'), name, description: document.getElementById('mDesc').value,
        image: document.getElementById('mImage').value, category: document.getElementById('mCategory').value,
        popular: false, enabled: true
      });
      persist();
    });

    const list = document.getElementById('mascotList');
    list.innerHTML = data.mascots.map((m) => `
      <div class="item-row">
        <div style="display:flex;align-items:center;gap:12px;min-width:0">
          <img class="item-thumb" src="${m.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e2e8f0%22/%3E%3C/svg%3E'}" alt="">
          <div style="min-width:0">
            <strong style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(m.name)}</strong>
            <span style="font-size:.78rem;color:var(--muted)">${escapeHtml(m.category)}${m.popular ? ' · ★ oblíbený' : ''}</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-shrink:0">
          <button class="btn btn-ghost" data-star="${m.id}">${m.popular ? '★' : '☆'}</button>
          <div class="switch ${m.enabled ? 'on' : ''}" data-toggle-mascot="${m.id}"></div>
          <button class="btn btn-ghost" data-del-mascot="${m.id}">🗑</button>
        </div>
      </div>
    `).join('') || '<p class="desc">Zatím žádní maskoti.</p>';

    list.querySelectorAll('[data-toggle-mascot]').forEach((el) => el.addEventListener('click', () => {
      const m = data.mascots.find((x) => x.id === el.dataset.toggleMascot); m.enabled = !m.enabled; persist();
    }));
    list.querySelectorAll('[data-star]').forEach((el) => el.addEventListener('click', () => {
      const m = data.mascots.find((x) => x.id === el.dataset.star); m.popular = !m.popular; persist();
    }));
    list.querySelectorAll('[data-del-mascot]').forEach((el) => el.addEventListener('click', () => {
      data.mascots = data.mascots.filter((x) => x.id !== el.dataset.delMascot); persist();
    }));
  }

  // ================= GALERIE =================
  function renderGalerie() {
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">Správa galerie</h1>
      <p style="color:var(--muted);margin:0 0 20px">Přidejte fotky přes URL adresu (např. z Google Fotek, Imgur apod.).</p>
      <div class="panel">
        <div class="form-grid-2">
          <input class="field" id="gUrl" placeholder="https://... URL obrázku">
          <select class="field" id="gCategory">
            <option value="akce">Akce</option><option value="maskoti">Maskoti</option>
            <option value="firemni">Firemní</option><option value="deti">Dětské oslavy</option>
          </select>
        </div>
        <button class="btn btn-coral" style="margin-top:12px" id="addGallery">+ Přidat fotku</button>
      </div>
      <div class="panel">
        <h2>Fotky</h2>
        <div class="grid-thumbs" id="galleryList"></div>
      </div>
    `;
    document.getElementById('addGallery').addEventListener('click', () => {
      const url = document.getElementById('gUrl').value.trim();
      if (!url) return;
      data.gallery.push({ id: uid('g'), url, category: document.getElementById('gCategory').value, enabled: true });
      persist();
    });
    const list = document.getElementById('galleryList');
    list.innerHTML = data.gallery.map((g) => `
      <div class="thumb-card">
        <img src="${escapeAttr(g.url)}" alt="">
        <div class="thumb-actions">
          <div class="switch ${g.enabled ? 'on' : ''}" data-toggle-gallery="${g.id}" style="width:34px;height:20px"></div>
          <button data-del-gallery="${g.id}" style="border:none;background:none">🗑</button>
        </div>
      </div>
    `).join('') || '<p class="desc">Zatím žádné fotky.</p>';
    list.querySelectorAll('[data-toggle-gallery]').forEach((el) => el.addEventListener('click', () => {
      const g = data.gallery.find((x) => x.id === el.dataset.toggleGallery); g.enabled = !g.enabled; persist();
    }));
    list.querySelectorAll('[data-del-gallery]').forEach((el) => el.addEventListener('click', () => {
      data.gallery = data.gallery.filter((x) => x.id !== el.dataset.delGallery); persist();
    }));
  }

  // ================= CENÍK =================
  function renderCenik() {
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">Ceník</h1>
      <p style="color:var(--muted);margin:0 0 20px">Balíčky zobrazené v sekci Ceník na webu.</p>
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
    document.getElementById('addPricing').addEventListener('click', () => {
      const title = document.getElementById('pTitle').value.trim();
      if (!title) return;
      data.pricing.push({
        id: uid('p'), title, description: document.getElementById('pDesc').value,
        priceFrom: Number(document.getElementById('pPrice').value) || null, enabled: true
      });
      persist();
    });
    const list = document.getElementById('pricingList');
    list.innerHTML = data.pricing.map((p) => `
      <div class="item-row">
        <div><strong>${escapeHtml(p.title)}</strong><br><span style="font-size:.78rem;color:var(--muted)">${p.priceFrom ? 'od ' + p.priceFrom + ' Kč' : 'na dotaz'}</span></div>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="switch ${p.enabled ? 'on' : ''}" data-toggle-price="${p.id}"></div>
          <button class="btn btn-ghost" data-del-price="${p.id}">🗑</button>
        </div>
      </div>
    `).join('') || '<p class="desc">Zatím žádné balíčky.</p>';
    list.querySelectorAll('[data-toggle-price]').forEach((el) => el.addEventListener('click', () => {
      const p = data.pricing.find((x) => x.id === el.dataset.togglePrice); p.enabled = !p.enabled; persist();
    }));
    list.querySelectorAll('[data-del-price]').forEach((el) => el.addEventListener('click', () => {
      data.pricing = data.pricing.filter((x) => x.id !== el.dataset.delPrice); persist();
    }));
  }

  // ================= FAQ =================
  function renderFaq() {
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">Časté otázky</h1>
      <p style="color:var(--muted);margin:0 0 20px">Spravujte FAQ sekci na webu.</p>
      <div class="panel">
        <input class="field" id="fqQ" placeholder="Otázka" style="margin-bottom:10px">
        <textarea class="field" id="fqA" placeholder="Odpověď"></textarea>
        <button class="btn btn-coral" style="margin-top:12px" id="addFaq">+ Přidat otázku</button>
      </div>
      <div class="panel"><div id="faqAdminList"></div></div>
    `;
    document.getElementById('addFaq').addEventListener('click', () => {
      const q = document.getElementById('fqQ').value.trim();
      const a = document.getElementById('fqA').value.trim();
      if (!q || !a) return;
      data.faq.push({ id: uid('f'), question: q, answer: a, enabled: true });
      persist();
    });
    const list = document.getElementById('faqAdminList');
    list.innerHTML = data.faq.map((f) => `
      <div class="item-row">
        <div style="max-width:70%"><strong>${escapeHtml(f.question)}</strong><br><span style="font-size:.8rem;color:var(--muted)">${escapeHtml(f.answer)}</span></div>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="switch ${f.enabled ? 'on' : ''}" data-toggle-faq="${f.id}"></div>
          <button class="btn btn-ghost" data-del-faq="${f.id}">🗑</button>
        </div>
      </div>
    `).join('') || '<p class="desc">Zatím žádné otázky.</p>';
    list.querySelectorAll('[data-toggle-faq]').forEach((el) => el.addEventListener('click', () => {
      const f = data.faq.find((x) => x.id === el.dataset.toggleFaq); f.enabled = !f.enabled; persist();
    }));
    list.querySelectorAll('[data-del-faq]').forEach((el) => el.addEventListener('click', () => {
      data.faq = data.faq.filter((x) => x.id !== el.dataset.delFaq); persist();
    }));
  }

  // ================= KONTAKTY & POPTÁVKY =================
  function renderKontakty() {
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">Kontakty &amp; poptávky</h1>
      <p style="color:var(--muted);margin:0 0 20px">Firemní kontakt zobrazený na webu a příchozí poptávky.</p>
      <div class="panel">
        <div class="form-grid-2">
          <input class="field" id="cPhone" value="${escapeAttr(data.settings.phone)}" placeholder="Telefon">
          <input class="field" id="cEmail" value="${escapeAttr(data.settings.email)}" placeholder="E-mail">
        </div>
        <button class="btn btn-coral" style="margin-top:12px" id="saveContact">Uložit kontakt</button>
      </div>
      <div class="panel">
        <h2>Poptávky z formuláře</h2>
        <p class="desc">Poptávky se ukládají jen v tomto prohlížeči (bez backendu je nevidí návštěvník na jiném zařízení).</p>
        <div id="leadsList"></div>
      </div>
    `;
    document.getElementById('saveContact').addEventListener('click', () => {
      data.settings.phone = document.getElementById('cPhone').value;
      data.settings.email = document.getElementById('cEmail').value;
      persist();
    });
    const STATUS_LABEL = { new: 'Nová', contacted: 'Kontaktováno', done: 'Vyřízeno', archived: 'Archiv' };
    const list = document.getElementById('leadsList');
    list.innerHTML = data.leads.map((l) => `
      <div class="item-row" style="flex-direction:column;align-items:stretch">
        <div class="row-between">
          <strong>${escapeHtml(l.name)} · ${escapeHtml(l.phone)} · ${escapeHtml(l.email)}</strong>
          <select class="field" style="width:auto" data-status="${l.id}">
            ${Object.entries(STATUS_LABEL).map(([v, label]) => `<option value="${v}" ${l.status === v ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </div>
        <span style="font-size:.8rem;color:var(--muted)">${l.eventDate || '—'} · ${escapeHtml(l.eventPlace || '—')} · ${escapeHtml(l.guestCount || '—')} hostů</span>
        ${l.note ? `<span style="font-size:.85rem;margin-top:4px">${escapeHtml(l.note)}</span>` : ''}
      </div>
    `).join('') || '<p class="desc">Zatím žádné poptávky.</p>';
    list.querySelectorAll('[data-status]').forEach((el) => el.addEventListener('change', () => {
      const l = data.leads.find((x) => x.id === el.dataset.status); l.status = el.value; persist();
    }));
  }

  // ================= SOCIÁLNÍ SÍTĚ =================
  function renderSocialni() {
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">Sociální sítě</h1>
      <p style="color:var(--muted);margin:0 0 20px">Odkazy zobrazené v patičce webu.</p>
      <div class="panel">
        <div class="form-grid-2">
          <select class="field" id="sPlatform"><option value="facebook">Facebook</option><option value="instagram">Instagram</option><option value="youtube">YouTube</option></select>
          <input class="field" id="sUrl" placeholder="https://...">
        </div>
        <button class="btn btn-coral" style="margin-top:12px" id="addSocial">+ Přidat</button>
      </div>
      <div class="panel"><div id="socialList"></div></div>
    `;
    document.getElementById('addSocial').addEventListener('click', () => {
      const url = document.getElementById('sUrl').value.trim();
      if (!url) return;
      data.social.push({ id: uid('s'), platform: document.getElementById('sPlatform').value, url, enabled: true });
      persist();
    });
    const list = document.getElementById('socialList');
    list.innerHTML = data.social.map((s) => `
      <div class="item-row">
        <div><strong style="text-transform:capitalize">${escapeHtml(s.platform)}</strong><br><span style="font-size:.78rem;color:var(--muted)">${escapeHtml(s.url)}</span></div>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="switch ${s.enabled ? 'on' : ''}" data-toggle-social="${s.id}"></div>
          <button class="btn btn-ghost" data-del-social="${s.id}">🗑</button>
        </div>
      </div>
    `).join('') || '<p class="desc">Zatím žádné odkazy.</p>';
    list.querySelectorAll('[data-toggle-social]').forEach((el) => el.addEventListener('click', () => {
      const s = data.social.find((x) => x.id === el.dataset.toggleSocial); s.enabled = !s.enabled; persist();
    }));
    list.querySelectorAll('[data-del-social]').forEach((el) => el.addEventListener('click', () => {
      data.social = data.social.filter((x) => x.id !== el.dataset.delSocial); persist();
    }));
  }

  // ================= SEO =================
  function renderSeo() {
    $content().innerHTML = `
      <h1 class="display" style="font-size:1.5rem;margin:0 0 4px">SEO</h1>
      <p style="color:var(--muted);margin:0 0 20px">Meta title a description webu (index.html).</p>
      <div class="panel">
        <label style="font-size:.78rem;color:var(--muted)">Meta title</label>
        <input class="field" id="seoTitle" value="${escapeAttr(data.seo.title)}" style="margin-bottom:10px">
        <label style="font-size:.78rem;color:var(--muted)">Meta description</label>
        <textarea class="field" id="seoDesc" rows="3">${escapeHtml(data.seo.description)}</textarea>
        <button class="btn btn-coral" style="margin-top:12px" id="saveSeo">Uložit SEO</button>
      </div>
    `;
    document.getElementById('saveSeo').addEventListener('click', () => {
      data.seo.title = document.getElementById('seoTitle').value;
      data.seo.description = document.getElementById('seoDesc').value;
      persist();
    });
  }

  function escapeHtml(s) { return (s ?? '').toString().replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function escapeAttr(s) { return escapeHtml(s); }
})();
