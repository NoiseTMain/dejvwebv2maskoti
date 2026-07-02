# Maskoti · Atrakce365 — statická verze (bez buildu, bez složek)

Čisté HTML / CSS / JavaScript. Žádný Node.js, žádný `npm install`, žádný build.
Nahraješ soubory na GitHub (nebo kamkoliv jinam) a funguje to hned.

## Soubory

| Soubor        | Co dělá |
|---------------|---------|
| `index.html`  | Veřejný web (jedna stránka se všemi sekcemi) |
| `admin.html`  | Administrace |
| `style.css`   | Vzhled veřejného webu |
| `admin.css`   | Vzhled administrace |
| `main.js`     | Logika veřejného webu (načítání dat, galerie, FAQ, formulář...) |
| `admin.js`    | Logika administrace (přihlášení, editace obsahu) |
| `data.js`     | Výchozí data + ukládání do localStorage prohlížeče |

## Jak to spustit

Stačí otevřít `index.html` v prohlížeči. Pro administraci otevři `admin.html`
(výchozí heslo je `maskoti2026`, nastavené v `data.js` → `settings.adminPassword`
— **doporučuju si ho hned po nahrání na GitHub v souboru změnit**).

## ⚠️ Důležité omezení — přečti si, prosím

Tahle verze **nemá žádný server ani databázi**. Všechna data (texty, maskoti,
galerie, poptávky...) se ukládají do **localStorage tvého prohlížeče**.

Co to znamená prakticky:

- ✅ Když upravíš něco v `admin.html` a máš zároveň otevřený `index.html` **ve
  stejném prohlížeči** (jiná karta/okno), změna se projeví okamžitě — to je
  skutečný realtime.
- ❌ Když upravíš něco na svém mobilu, **návštěvník na jiném telefonu nebo
  počítači tu změnu neuvidí** — jeho prohlížeč má vlastní, oddělený
  localStorage.
- ❌ Poptávky odeslané přes kontaktní formulář se uloží jen v prohlížeči
  toho, kdo formulář odeslal — ty je v administraci neuvidíš, pokud si
  nedoplníš e-mailovou službu (viz níže).

Pro web, který má mít víc obsahu než jen "vizitku", a kde potřebuješ, aby se
změny z administrace opravdu projevily u všech návštěvníků, je dřív nebo
později potřeba **backend** (např. znovu využít Supabase řešení, které jsem
připravil dřív, nebo jednodušší službu). Tahle statická verze je skvělý start
a dá se na backend napojit později bez přepisování designu.

## Jak nahrát na GitHub (z mobilu)

1. Vytvoř na GitHubu nový prázdný repozitář.
2. V Codespaces (nebo přes web upload) nahraj **všechny tyto soubory přímo do
   kořene repozitáře** — žádná podsložka, přesně jak potřebuješ.
3. Zapni **GitHub Pages** (Settings → Pages → Branch: main → Save) a web
   poběží na `https://tvoje-jmeno.github.io/nazev-repo/`.

## Jak zprovoznit reálné odesílání poptávek e-mailem

1. Zaregistruj se zdarma na [formspree.io](https://formspree.io) a vytvoř formulář.
2. V `main.js` najdi řádek:
   ```js
   // fetch('https://formspree.io/f/TVUJ_FORM_ID', ...)
   ```
   Odkomentuj ho a doplň svoje `TVUJ_FORM_ID`.
3. Poptávky ti pak budou chodit na e-mail bez ohledu na to, kdo a odkud
   formulář odeslal.

## Jak přidat další texty do editoru

V `admin.js` najdi funkci `renderTexty()` — je tam jen hero sekce jako vzor.
Podle stejného vzoru (input → `data.content.klic` → `saveData(data)`) přidáš
libovolné další pole; ve `main.js` ho pak vypíšeš stejně jako
`document.getElementById('heroTitle').textContent = data.content.heroTitle`.

## Barvy a fonty (kdyby ses chtěl/a přeptat na úpravu vzhledu)

Design tokeny jsou nahoře v `style.css` v `:root { ... }` (barvy `--coral`,
`--amber`, `--candy`, `--mint`, `--ink`) — stačí tam změnit hex kódy a
promítne se to po celém webu.
