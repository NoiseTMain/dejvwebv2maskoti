/**
 * db.js — jediné místo, přes které web i administrace mluví s Firebase.
 * Načítá se jako ES modul (viz <script type="module" src="db.js"> v HTML),
 * proto může použít "import" — žádný build ani npm není potřeba, prohlížeč
 * si SDK stáhne přímo z CDN.
 */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc,
  collection, getDocs, query, orderBy, where, onSnapshot, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

const app = initializeApp(window.FIREBASE_CONFIG);
const fs = getFirestore(app);
const authInst = getAuth(app);

function withId(d) { return { id: d.id, ...d.data() }; }
async function getAll(colName, orderField) {
  const q = orderField ? query(collection(fs, colName), orderBy(orderField)) : collection(fs, colName);
  const snap = await getDocs(q);
  return snap.docs.map(withId);
}

window.DB = {
  auth: {
    signIn: (email, password) => signInWithEmailAndPassword(authInst, email, password),
    signOutUser: () => signOut(authInst),
    onAuthChange: (cb) => onAuthStateChanged(authInst, cb),
    getCurrentUser: () => authInst.currentUser
  },

  // ---------- Nastavení / firma / SEO (jednotlivé dokumenty) ----------
  async getSettings() {
    const snap = await getDoc(doc(fs, 'settings', 'main'));
    return snap.exists() ? snap.data() : { show_full_site: true, phone: '', email: '' };
  },
  updateSettings: (patch) => setDoc(doc(fs, 'settings', 'main'), patch, { merge: true }),

  async getCompany() {
    const snap = await getDoc(doc(fs, 'company', 'main'));
    return snap.exists() ? snap.data() : { provozovatel: '', ico: '', dic: '', address: '', founded_year: 2010 };
  },
  updateCompany: (patch) => setDoc(doc(fs, 'company', 'main'), patch, { merge: true }),

  async getSeo() {
    const snap = await getDoc(doc(fs, 'seo', 'main'));
    return snap.exists() ? snap.data() : { title: '', description: '' };
  },
  updateSeo: (patch) => setDoc(doc(fs, 'seo', 'main'), patch, { merge: true }),

  // ---------- Sekce ----------
  async getSections() {
    const list = await getAll('sections', 'sort_order');
    return list.map((s) => ({ ...s, key: s.id }));
  },
  updateSection: (key, patch) => updateDoc(doc(fs, 'sections', key), patch),
  setSectionsOrder: (rows) => Promise.all(rows.map((r, i) => updateDoc(doc(fs, 'sections', r.key), { sort_order: i }))),

  // ---------- Editovatelný text ----------
  async getContentBlock(key) {
    const snap = await getDoc(doc(fs, 'content', key));
    return snap.exists() ? snap.data() : null;
  },
  saveContentBlock: (key, value) => setDoc(doc(fs, 'content', key), value, { merge: true }),

  // ---------- Katalog atrakcí & maskotů ----------
  getItems: () => getAll('items', 'sort_order'),
  addItem: (item) => addDoc(collection(fs, 'items'), { ...item, sort_order: Date.now() }),
  updateItem: (id, patch) => updateDoc(doc(fs, 'items', id), patch),
  deleteItem: (id) => deleteDoc(doc(fs, 'items', id)),

  // ---------- Galerie podle měst ----------
  getGalleryCities: () => getAll('galleryCities', 'sort_order'),
  addCity: (city) => addDoc(collection(fs, 'galleryCities'), { ...city, sort_order: Date.now() }),
  updateCity: (id, patch) => updateDoc(doc(fs, 'galleryCities', id), patch),
  deleteCity: (id) => deleteDoc(doc(fs, 'galleryCities', id)),

  async getGalleryPhotos(cityId) {
    const snap = await getDocs(query(collection(fs, 'galleryPhotos'), where('city_id', '==', cityId)));
    return snap.docs.map(withId).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  },
  addPhoto: (photo) => addDoc(collection(fs, 'galleryPhotos'), { ...photo, sort_order: Date.now() }),
  updatePhoto: (id, patch) => updateDoc(doc(fs, 'galleryPhotos', id), patch),
  deletePhoto: (id) => deleteDoc(doc(fs, 'galleryPhotos', id)),

  // ---------- Videa ----------
  getVideos: () => getAll('videos', 'sort_order'),
  addVideo: (v) => addDoc(collection(fs, 'videos'), { ...v, sort_order: Date.now() }),
  updateVideo: (id, patch) => updateDoc(doc(fs, 'videos', id), patch),
  deleteVideo: (id) => deleteDoc(doc(fs, 'videos', id)),

  // ---------- Ceník / FAQ / Reference / Sociální sítě ----------
  getPricing: () => getAll('pricing', 'sort_order'),
  addPricing: (p) => addDoc(collection(fs, 'pricing'), { ...p, sort_order: Date.now() }),
  updatePricing: (id, patch) => updateDoc(doc(fs, 'pricing', id), patch),
  deletePricing: (id) => deleteDoc(doc(fs, 'pricing', id)),

  getFaq: () => getAll('faq', 'sort_order'),
  addFaq: (f) => addDoc(collection(fs, 'faq'), { ...f, sort_order: Date.now() }),
  updateFaq: (id, patch) => updateDoc(doc(fs, 'faq', id), patch),
  deleteFaq: (id) => deleteDoc(doc(fs, 'faq', id)),

  getTestimonials: () => getAll('testimonials', 'sort_order'),

  getSocial: () => getAll('social'),
  addSocial: (s) => addDoc(collection(fs, 'social'), s),
  updateSocial: (id, patch) => updateDoc(doc(fs, 'social', id), patch),
  deleteSocial: (id) => deleteDoc(doc(fs, 'social', id)),

  // ---------- Poptávky ----------
  submitLead: (lead) => addDoc(collection(fs, 'leads'), { ...lead, status: 'new', created_at: serverTimestamp() }),
  async getLeads() {
    const snap = await getDocs(query(collection(fs, 'leads'), orderBy('created_at', 'desc')));
    return snap.docs.map(withId);
  },
  updateLeadStatus: (id, status) => updateDoc(doc(fs, 'leads', id), { status }),

  /**
   * Přihlásí se k realtime změnám na hlavních kolekcích a při JAKÉKOLIV
   * změně (od kohokoliv, odkudkoliv) zavolá callback — díky tomu se web
   * i administrace přerenderují se skutečně aktuálními daty pro úplně
   * všechny návštěvníky, ne jen v rámci jednoho prohlížeče/zařízení.
   */
  subscribeRealtime(callback) {
    let timer = null;
    const debounced = () => { clearTimeout(timer); timer = setTimeout(callback, 150); };
    const unsubs = [
      onSnapshot(doc(fs, 'settings', 'main'), debounced),
      onSnapshot(doc(fs, 'company', 'main'), debounced),
      onSnapshot(doc(fs, 'seo', 'main'), debounced),
      onSnapshot(collection(fs, 'sections'), debounced),
      onSnapshot(collection(fs, 'content'), debounced),
      onSnapshot(collection(fs, 'items'), debounced),
      onSnapshot(collection(fs, 'galleryCities'), debounced),
      onSnapshot(collection(fs, 'galleryPhotos'), debounced),
      onSnapshot(collection(fs, 'videos'), debounced),
      onSnapshot(collection(fs, 'pricing'), debounced),
      onSnapshot(collection(fs, 'faq'), debounced),
      onSnapshot(collection(fs, 'testimonials'), debounced),
      onSnapshot(collection(fs, 'social'), debounced)
    ];
    return () => unsubs.forEach((u) => u());
  },

  /** Zjistí, jestli je databáze prázdná (ještě neproběhlo první naplnění dat). */
  async isEmpty() {
    const snap = await getDocs(collection(fs, 'items'));
    return snap.empty;
  },

  /** Jednorázově naplní databázi výchozími daty — viz seed-data.js. Bezpečné spustit jen jednou. */
  async seedDefaultData(seed) {
    await setDoc(doc(fs, 'settings', 'main'), seed.settings);
    await setDoc(doc(fs, 'company', 'main'), seed.company);
    await setDoc(doc(fs, 'seo', 'main'), seed.seo);
    for (const s of seed.sections) await setDoc(doc(fs, 'sections', s.key), s);
    for (const [key, value] of Object.entries(seed.content)) await setDoc(doc(fs, 'content', key), value);
    for (const i of seed.items) await addDoc(collection(fs, 'items'), i);
    for (const c of seed.cities) await addDoc(collection(fs, 'galleryCities'), c);
    for (const p of seed.pricing) await addDoc(collection(fs, 'pricing'), p);
    for (const f of seed.faq) await addDoc(collection(fs, 'faq'), f);
    for (const t of seed.testimonials) await addDoc(collection(fs, 'testimonials'), t);
    for (const s of seed.social) await addDoc(collection(fs, 'social'), s);
  }
};

window.uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2));
