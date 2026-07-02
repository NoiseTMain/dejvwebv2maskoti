/**
 * seed-data.js — výchozí obsah převzatý ze starého webu zabavniservis365.cz.
 * Nahraje se do Firestore jedním klikem na tlačítko "Naplnit výchozí data"
 * na Dashboardu v administraci (jen když je databáze prázdná).
 */
window.SEED_DATA = {
  settings: { show_full_site: true, phone: '+420 604 600 603', email: 'info@atrakce365.cz' },
  company: {
    provozovatel: 'David Jůna', ico: '717 87 615', dic: 'CZ7701080046',
    address: 'Šífařská 568/18, 147 00 Praha 4 - Hodkovičky', founded_year: 2006
  },
  seo: {
    title: 'Maskoti | Atrakce365 — zábava pro dětské oslavy i firemní akce',
    description: 'Kostýmovaní maskoti, nafukovací a pouťové atrakce, párty program pro dětské oslavy, firemní akce a městské slavnosti po celé ČR a SK.'
  },
  sections: [
    { key: 'hero', label: 'Hero', enabled: true, full_only: false, sort_order: 0 },
    { key: 'sluzby', label: 'Nabídka služeb', enabled: true, full_only: true, sort_order: 1 },
    { key: 'maskoti', label: 'Nejoblíbenější maskoti', enabled: true, full_only: false, sort_order: 2 },
    { key: 'atrakce', label: 'Nafukovací a pouťové atrakce', enabled: true, full_only: true, sort_order: 3 },
    { key: 'galerie', label: 'Galerie podle měst', enabled: true, full_only: false, sort_order: 4 },
    { key: 'videa', label: 'Videa z akcí', enabled: true, full_only: false, sort_order: 5 },
    { key: 'jak-to-probiha', label: 'Jak to probíhá', enabled: true, full_only: false, sort_order: 6 },
    { key: 'cenik', label: 'Ceník', enabled: true, full_only: false, sort_order: 7 },
    { key: 'portfolio', label: 'O nás', enabled: true, full_only: true, sort_order: 8 },
    { key: 'reference', label: 'Reference', enabled: true, full_only: false, sort_order: 9 },
    { key: 'faq', label: 'Časté otázky', enabled: true, full_only: false, sort_order: 10 },
    { key: 'kontakt', label: 'Kontaktní formulář', enabled: true, full_only: false, sort_order: 11 }
  ],
  content: {
    hero: {
      eyebrow: 'Maskoti pro nezapomenutelné oslavy',
      title: 'Kouzlo v kostýmu, úsměv na tváři',
      subtitle: 'Přivedeme oblíbené pohádkové postavičky přímo na vaši oslavu, firemní akci nebo městskou slavnost — s profesionálním animátorem a plným servisem.',
      cta: 'Vybrat maskota'
    },
    'o-nas': {
      text: 'Na trhu jsme od roku 2006. Realizujeme doprovodné a zábavné programy pro společenské a firemní akce po celé ČR a SK — od pronájmu nafukovacích a pouťových atrakcí přes balónkové dekorace a animační programy až po maskoty a produkční zajištění celé akce.'
    }
  },
  items: [
    // Maskoti
    { name: 'Méďa Karkulka', description: 'Oblíbený plyšový medvídek pro nejmenší návštěvníky oslav.', category: 'maskot', popular: true, enabled: true, sort_order: 0 },
    { name: 'Kouzelná víla', description: 'Třpytivá víla s kouzelnou hůlkou a bublinovou show.', category: 'maskot', popular: true, enabled: true, sort_order: 1 },
    { name: 'Piráti z Karibiku', description: 'Dobrodružný pirátský program s pokladem a soutěžemi.', category: 'maskot', popular: false, enabled: true, sort_order: 2 },
    { name: 'Superhrdina', description: 'Silák v kostýmu, který rozdává úsměvy a energii.', category: 'maskot', popular: true, enabled: true, sort_order: 3 },
    // Nafukovací atrakce
    ...['Zlatá rybka 3v1', 'Klaun jedlík 3v1', 'Pirátská loď', 'Bourací kladivo', 'Opičí dráha',
      'Skákací hrad Ostrov pirátů', 'Skluzavka Tučňáci', 'Skákací hrad Jungle', 'Skluzavka Tarzan',
      'Skluzavka Slon', 'Sumo ring pro děti', 'Sumo ring pro dospělé', 'Skákací hrad Pohádka',
      'Skákací hrad Myška', 'Skákací hrad Myšák', 'Skákací hrad Safari', 'Skákací hrad Tygr',
      'Skákací hrad Pyramida', 'Skákací hrad Bowling', 'Skákací hrad Pejsek', 'Skákací hrad Pevnost',
      'Triple kalhoty', 'Nafukovací reklama'
    ].map((name, i) => ({ name, description: '', category: 'nafukovaci', popular: false, enabled: true, sort_order: 10 + i })),
    // Pouťové atrakce
    ...['Bungee trampolíny 4v1', 'Pouťový vláček Western', 'Pouťový vláček Cirkus', 'Řetízkový kolotoč', 'Dětský koutek', 'Mini bike']
      .map((name, i) => ({ name, description: '', category: 'poutove', popular: false, enabled: true, sort_order: 40 + i })),
    // Párty program
    ...['Animační programy', 'Balónková dílna', 'Balónkové dekorace', 'Cukrová vata', 'Popcorn — catering',
      'Fotokoutek', 'Klaun', 'Malování na obličej', 'Třpytivé tetování', 'Bublinová show',
      'Tvořivé dílny', 'Mikuláš, čert a anděl', 'Párty servis — půjčovna'
    ].map((name, i) => ({ name, description: '', category: 'party', popular: false, enabled: true, sort_order: 50 + i }))
  ],
  cities: [
    { name: 'Praha', enabled: true, sort_order: 0 },
    { name: 'Brno', enabled: true, sort_order: 1 },
    { name: 'Ostrava', enabled: true, sort_order: 2 }
  ],
  pricing: [
    { title: 'Základní balíček', description: 'Maskot + 60 minut animačního programu.', price_from: 2900, enabled: true, sort_order: 0 },
    { title: 'Rozšířený balíček', description: 'Maskot + animátor + hry a soutěže na 2 hodiny.', price_from: 4500, enabled: true, sort_order: 1 },
    { title: 'Firemní den', description: 'Celodenní program pro firemní akce a dny dětí.', price_from: 9900, enabled: true, sort_order: 2 }
  ],
  faq: [
    { question: 'Jak dlouho dopředu mám akci objednat?', answer: 'Doporučujeme rezervaci alespoň 2 týdny předem, o víkendech a v sezóně i dříve.', enabled: true, sort_order: 0 },
    { question: 'Je doprava v ceně?', answer: 'Doprava do 20 km je zahrnuta v ceně balíčku, další km účtujeme dle ceníku.', enabled: true, sort_order: 1 },
    { question: 'Působíte i mimo Prahu?', answer: 'Ano, působíme po celé ČR a SK.', enabled: true, sort_order: 2 }
  ],
  testimonials: [
    { author: 'Petra N.', event_type: 'Dětská oslava', quote: 'Syn byl naprosto nadšený, animátor si s dětmi báječně poradil.', rating: 5, enabled: true, sort_order: 0 },
    { author: 'Firma Delta s.r.o.', event_type: 'Firemní den', quote: 'Profesionální přístup od poptávky až po realizaci akce.', rating: 5, enabled: true, sort_order: 1 }
  ],
  social: [
    { platform: 'facebook', url: 'https://www.facebook.com/Atrakce365/', enabled: true },
    { platform: 'youtube', url: 'https://www.youtube.com/channel/UCQsasDzpRh7tE6cgO6kYB0w', enabled: true }
  ]
};
