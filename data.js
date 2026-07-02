/**
 * data.js — jediný zdroj dat pro web i administraci.
 *
 * Jak to funguje:
 * - Všechna data (texty, maskoti, galerie, ceník, FAQ, ...) žijí v jednom
 *   objektu a ukládají se do localStorage prohlížeče (klíč MASKOTI_DATA_KEY).
 * - Když admin něco uloží v admin.html, zavolá se saveData(), která zapíše
 *   nová data do localStorage.
 * - Prohlížeč automaticky vyšle "storage" event do VŠECH OSTATNÍCH OTEVŘENÝCH
 *   KARET/OKEN stejného prohlížeče (index.html i admin.html) — díky tomu se
 *   změna projeví okamžitě bez obnovení stránky. To je "realtime" v rámci
 *   jednoho prohlížeče/zařízení.
 * - DŮLEŽITÉ OMEZENÍ: localStorage je vázaný na konkrétní prohlížeč a
 *   zařízení. Změna, kterou uložíš na svém mobilu, se NEPROJEVÍ u návštěvníka
 *   na jiném telefonu/počítači — na to by bylo potřeba připojit databázi na
 *   serveru (viz poznámka v README.md, jak to později doplnit).
 */

const MASKOTI_DATA_KEY = 'maskoti_site_data_v1';

const DEFAULT_DATA = {
  settings: {
    showFullSite: true,
    siteName: 'Maskoti | Atrakce365',
    phone: '+420 604 600 603',
    email: 'info@atrakce365.cz',
    adminPassword: 'maskoti2026' // ZMĚŇ v admin.html po prvním přihlášení!
  },
  sections: [
    { key: 'hero', label: 'Hero', enabled: true, fullOnly: false },
    { key: 'sluzby', label: 'Nabídka služeb (celý web)', enabled: true, fullOnly: true },
    { key: 'maskoti', label: 'Nejoblíbenější maskoti', enabled: true, fullOnly: false },
    { key: 'galerie', label: 'Galerie', enabled: true, fullOnly: false },
    { key: 'jak-to-probiha', label: 'Jak to probíhá', enabled: true, fullOnly: false },
    { key: 'cenik', label: 'Ceník', enabled: true, fullOnly: false },
    { key: 'portfolio', label: 'O nás / Portfolio (celý web)', enabled: true, fullOnly: true },
    { key: 'reference', label: 'Reference', enabled: true, fullOnly: false },
    { key: 'faq', label: 'Časté otázky', enabled: true, fullOnly: false },
    { key: 'kontakt', label: 'Kontaktní formulář', enabled: true, fullOnly: false }
  ],
  content: {
    heroEyebrow: 'Maskoti pro nezapomenutelné oslavy',
    heroTitle: 'Kouzlo v kostýmu, úsměv na tváři',
    heroSubtitle:
      'Přivedeme oblíbené pohádkové postavičky přímo na vaši oslavu, firemní akci nebo městskou slavnost — s profesionálním animátorem a plným servisem.',
    heroCta: 'Vybrat maskota'
  },
  mascots: [
    { id: 'm1', name: 'Méďa Karkulka', description: 'Oblíbený plyšový medvídek pro nejmenší návštěvníky oslav.', image: '', category: 'Zvířátka', popular: true, enabled: true },
    { id: 'm2', name: 'Kouzelná víla', description: 'Třpytivá víla s kouzelnou hůlkou a bublinovou show.', image: '', category: 'Pohádkové postavy', popular: true, enabled: true },
    { id: 'm3', name: 'Piráti z Karibiku', description: 'Dobrodružný pirátský program s pokladem a soutěžemi.', image: '', category: 'Pohádkové postavy', popular: false, enabled: true },
    { id: 'm4', name: 'Superhrdina', description: 'Silák v kostýmu, který rozdává úsměvy a energii.', image: '', category: 'Superhrdinové', popular: true, enabled: true }
  ],
  gallery: [
    { id: 'g1', url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600', category: 'akce', enabled: true },
    { id: 'g2', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600', category: 'deti', enabled: true },
    { id: 'g3', url: 'https://images.unsplash.com/photo-1541535881962-3b6de3f38a48?w=600', category: 'firemni', enabled: true }
  ],
  pricing: [
    { id: 'p1', title: 'Základní balíček', description: 'Maskot + 60 minut animačního programu.', priceFrom: 2900, enabled: true },
    { id: 'p2', title: 'Rozšířený balíček', description: 'Maskot + animátor + hry a soutěže na 2 hodiny.', priceFrom: 4500, enabled: true },
    { id: 'p3', title: 'Firemní den', description: 'Celodenní program pro firemní akce a dny dětí.', priceFrom: 9900, enabled: true }
  ],
  faq: [
    { id: 'f1', question: 'Jak dlouho dopředu mám akci objednat?', answer: 'Doporučujeme rezervaci alespoň 2 týdny předem, o víkendech a v sezóně i dříve.', enabled: true },
    { id: 'f2', question: 'Je doprava v ceně?', answer: 'Doprava do 20 km je zahrnuta v ceně balíčku, další km účtujeme dle ceníku.', enabled: true },
    { id: 'f3', question: 'Můžeme si vybrat konkrétního maskota?', answer: 'Ano, výběr maskota potvrzujeme při rezervaci podle aktuální dostupnosti.', enabled: true }
  ],
  testimonials: [
    { id: 't1', author: 'Petra N.', eventType: 'Dětská oslava', quote: 'Syn byl naprosto nadšený, animátor si s dětmi báječně poradil.', rating: 5, enabled: true },
    { id: 't2', author: 'Firma Delta s.r.o.', eventType: 'Firemní den', quote: 'Profesionální přístup od poptávky až po realizaci akce.', rating: 5, enabled: true }
  ],
  social: [
    { id: 's1', platform: 'facebook', url: 'https://facebook.com', enabled: true },
    { id: 's2', platform: 'instagram', url: 'https://instagram.com', enabled: true }
  ],
  seo: {
    title: 'Maskoti | Atrakce365 — zábava pro dětské oslavy i firemní akce',
    description: 'Kostýmovaní maskoti, animátoři a párty program pro dětské oslavy, firemní akce a městské slavnosti po celé ČR.'
  },
  leads: []
};

function loadData() {
  try {
    const raw = localStorage.getItem(MASKOTI_DATA_KEY);
    if (!raw) return structuredClone(DEFAULT_DATA);
    const parsed = JSON.parse(raw);
    // doplní chybějící klíče, kdyby se DEFAULT_DATA v budoucnu rozšířil
    return { ...structuredClone(DEFAULT_DATA), ...parsed };
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

function saveData(data) {
  localStorage.setItem(MASKOTI_DATA_KEY, JSON.stringify(data));
}

function uid(prefix) {
  return prefix + '_' + Math.random().toString(36).slice(2, 9);
}

/**
 * Zavolej listener(data) pokaždé, když se data změní v JINÉ kartě/okně
 * stejného prohlížeče (např. web v jedné kartě, admin ve druhé).
 */
function onDataChanged(listener) {
  window.addEventListener('storage', (e) => {
    if (e.key === MASKOTI_DATA_KEY) {
      listener(loadData());
    }
  });
}
