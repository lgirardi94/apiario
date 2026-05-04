# 🐝 Il Mio Apiario

Web app per la gestione completa di un apiario amatoriale o semi-professionale: censimento arnie, registro visite, magazzino, contabilità, obiettivi, calcolatore sciroppo. I dati sono sincronizzati automaticamente su **Google Drive** in una cartella privata.

🔗 **Live**: https://lgirardi94.github.io/apiario/

---

## ✨ Funzionalità

### 🏡 Dashboard Home
- KPI: arnie attive, miele anno/totale, ispezioni, saldo annuale e totale
- Banner stagionale con consigli del mese
- Alert su problemi (scorte basse, arnie deboli, magazzino vuoto)
- Grafici miele/anno, arnie attive/anno, contabilità entrate-uscite
- Mappa visuale arnie con ultimo stato

### 🏠 Censimento Arnie
- Schedario completo: numero, nome, status, regina (anno/razza/temperamento)
- Storico melari per ogni arnia
- Calcolo automatico produzione per anno
- Pannello dettaglio con ultima ispezione e mappa telaini grafica

### 📖 Registro Visite
- Tipi multipli: ispezione, trattamento, nutrizione, raccolta, salute, altro
- Ispezione: covata, scorte, celle reali, mappa telaini con tipologie
- Raccolta: multi-prodotto con auto-creazione movimenti magazzino
- Precompilazione automatica dall'ultima ispezione dell'arnia
- Filtri per tipo, arnia, ricerca testuale
- Esportazione CSV

### 📦 Magazzino
- Articoli divisi in categorie (prodotti, alimenti, farmaci, attrezzatura)
- Movimentazioni multi-articolo (entrate/uscite)
- Controlli automatici sui duplicati con algoritmo di similarità
- Merge bidirezionale degli articoli duplicati

### 💰 Contabilità
- Entrate e uscite con categorie predefinite
- Riepilogo annuale con grafici per categoria
- Storico mensile

### 🎯 Obiettivi
- Stagionali (primavera/estate/autunno/inverno)
- Annuali con target/attuale e barra di progresso
- Storico obiettivi completati

### 🍯 Calcolatore Sciroppo
- Modalità 1:1 (primaverile) e 2:1 (autunnale)
- Calcolo proporzioni acqua/zucchero in base al numero di arnie
- Procedimento, conservazione, integratori

### 📱 Versioni Mobile
- **`visita_rapida.html`** — Wizard 4 step ottimizzato per inserimento rapido visite in apiario
- **`inserimento_rapido.html`** — Form mobile per movimenti contabili e magazzino on-the-go

---

## 🗂️ Struttura del repository

```
apiario/
│
├── index.html               # App principale (desktop)
├── visita_rapida.html       # Wizard mobile per visite
├── inserimento_rapido.html  # Form mobile contabilità/magazzino
│
├── shared.js                # Costanti e funzioni condivise tra tutte le pagine
├── style-main.css           # Stili app desktop
├── style-mobile.css         # Stili pagine mobile
│
└── js/                      # Moduli JavaScript dell'app principale
    ├── state.js             # Variabili globali e save helpers
    ├── nav.js               # Navigazione tra sezioni
    ├── home.js              # Dashboard
    ├── arnie.js             # Censimento + dettaglio arnie
    ├── registro.js          # Registro visite + ispezione
    ├── magazzino.js         # Articoli + movimentazioni + duplicati
    ├── contabilita.js       # Riepilogo + movimenti
    ├── obiettivi.js         # Stagionali/annuali/storico
    ├── sciroppo.js          # Calcolatore
    ├── drive-app.js         # Login obbligatorio + auto-save Drive
    └── import-export.js     # Backup JSON locale
```

---

## 📚 Spiegazione dei file

### 🌐 Pagine HTML

#### `index.html` (~1100 righe)
Pagina principale dell'app desktop. Contiene solo struttura HTML — tutta la logica è nei file in `js/`. Carica i moduli JavaScript in ordine di dipendenza alla fine del body.

**Schermata di login** in cima: l'app non è accessibile finché non si è autenticati con Google.

#### `visita_rapida.html`
Wizard mobile a 4 step per registrare una visita ad un'arnia velocemente:
1. Selezione arnia (card grandi)
2. Data + tipo di intervento
3. Dettagli (ispezione + raccolta)
4. Note + riepilogo + salva

Sincronizzato con la stessa cartella Drive dell'app principale.

#### `inserimento_rapido.html`
Form mobile per registrare velocemente movimenti contabili (entrate/uscite) o di magazzino (carico/scarico articoli).

---

### 📜 File JavaScript

#### `shared.js` (~340 righe)
Codice condiviso tra **tutte** le pagine HTML:

- **Costanti**: `CLIENT_ID`, `SCOPES`, nomi file Drive, categorie contabili
- **Costanti ispezione**: `TELAINO_OPZIONI`, `CELLE_REALI_LABEL`, `COVATA_LABEL`, `SCORTE_LABEL`
- **Utility**: `fmt`, `formatDate`, `today`, `getGiacenza`, `similarity`, `getTipi`
- **Drive API**: `initDrive`, `driveLogin`, `driveLogout`, `driveReadFile`, `driveWriteFile`, `driveLoadAll`, `driveSaveAll`
- **Calendar**: `buildGCalLink`, `showCalendarPopup`
- **Helper rendering**: `getTelainoInfo`, `renderTelainiVisualHTML`

#### `js/state.js` (~80 righe)
Variabili globali e funzioni di salvataggio:

```javascript
let arnie = [];
let logBook = [];
let articoli = [];
let movimentazioni = [];
let movimentiContabili = [];
let obiettivi = [];
let settings = { duplicatiIgnorati: [] };

// Helpers che salvano localStorage + push automatico su Drive
function saveDB()           // arnie + logBook
function saveMagazzino()    // articoli + movimentazioni
function saveContabilita()  // movimentiContabili
function saveObiettivi()    // obiettivi
function saveSettings()     // settings (duplicatiIgnorati ecc.)

// Helpers di calcolo riusabili
function getMieleStats()         // { totale, perAnno: {...} }
function findUltimaIspezione(id) // ultima visita di tipo ispezione per un'arnia
```

#### `js/nav.js` (~35 righe)
Navigazione tra sezioni (`navigateTo`, `showSection`), tab utility, accordion calendario.

#### `js/home.js` (~200 righe)
Render della dashboard: banner stagionale, KPI, alert, mappa arnie, ultime visite, obiettivi in corso, grafici.

#### `js/arnie.js` (~290 righe)
- Censimento arnie: lista, modal di creazione/modifica, eliminazione
- Pannello dettaglio con ultima ispezione e mappa telaini grafica
- Gestione melari per ogni arnia

#### `js/registro.js` (~350 righe)
- Form di inserimento visita con campi adattivi al tipo
- Precompilazione automatica dall'ultima ispezione dell'arnia
- Mappa telaini interattiva con dropdown per tipologia
- Multi-raccolta con auto-creazione movimenti magazzino
- Lista visite con filtri (tipo, arnia, ricerca testo)
- Esportazione CSV

#### `js/magazzino.js` (~460 righe)
- Articoli divisi in categorie (prodotto, consumabile, farmaco, attrezzatura)
- Modal multi-riga per movimentazioni
- Controlli automatici sui duplicati (algoritmo di similarità bigram)
- Merge bidirezionale degli articoli con sposta-movimentazioni
- Coppie "ignorate" salvate in `settings.duplicatiIgnorati` (sincronizzato su Drive)

#### `js/contabilita.js` (~200 righe)
- Modal per movimenti contabili con categorie a chip
- Riepilogo per categoria con grafici annuali
- Filtro mese/anno
- Statistiche mensili

#### `js/obiettivi.js` (~350 righe)
- 3 tab: stagionali, annuali, storico
- Modal di creazione/modifica obiettivo
- Calcolo automatico progresso per obiettivi numerici
- Toggle stato (in corso → completato)

#### `js/sciroppo.js` (~70 righe)
- Slider per numero arnie e litri per arnia
- Calcolo proporzioni acqua/zucchero in base alla modalità (1:1 / 2:1)

#### `js/drive-app.js` (~200 righe)
**Cuore della sincronizzazione**:

- **Login obbligatorio**: schermata login full-screen all'apertura, app nascosta finché non autenticati
- **Auto-save con debounce**: ogni `save*()` chiama `pushToCloud()` che aspetta 800ms di silenzio prima di salvare (evita di fare 5 push se modifico 5 campi consecutivi)
- **Coda di salvataggi**: se un salvataggio è in corso quando arriva una nuova richiesta, viene accodata (non scartata) e rifatta al termine
- **Detect online/offline**: indicatore visibile, sospende i salvataggi se non sei in rete, sincronizza automaticamente quando torna la connessione
- **Retry automatico**: se Drive fallisce, ritenta dopo 5 secondi
- **Beforeunload guard**: ti avvisa se chiudi la scheda con modifiche non ancora salvate
- **Logout pulito**: cancella timer pendenti, azzera tutto lo stato, pulisce localStorage

#### `js/import-export.js` (~60 righe)
Backup locale: esportazione di tutti i dati in un singolo JSON, e importazione che ricarica tutto e sincronizza su Drive.

---

### 🎨 File CSS

#### `style-main.css` (~1270 righe)
Stili dell'app desktop. Tema "miele e legno" con palette ambra/marrone, font serif per titoli (Playfair Display) e sans per testo.

#### `style-mobile.css` (~420 righe)
Stili condivisi tra `visita_rapida.html` e `inserimento_rapido.html`. Ottimizzato per touch (target ≥44px), card grandi, layout a colonna unica.

---

## ☁️ Sincronizzazione Google Drive

L'app usa la API di Drive con scope `drive.appdata`: i file sono salvati in una **cartella nascosta privata** non visibile dall'utente in Drive (per evitare cancellazioni accidentali).

### File salvati su Drive

| File | Contenuto |
|------|-----------|
| `apiario_db.json` | Arnie + registro visite |
| `apiario_magazzino.json` | Articoli + movimentazioni |
| `apiario_contabilita.json` | Movimenti contabili |
| `apiario_obiettivi.json` | Obiettivi stagionali/annuali |
| `apiario_settings.json` | Preferenze (es. duplicati ignorati) |

Ogni file ha versione + timestamp salvataggio.

### Flusso di salvataggio

```
saveMagazzino()
    ↓
localStorage.setItem(...)   ← cache locale immediata
    ↓
pushToCloud(true)           ← debounce 800ms
    ↓
[se altro save arriva → si aggiunge alla coda]
    ↓
driveSaveAll(...)           ← push su Drive di TUTTI i file
    ↓
✅ "Salvato su Drive"
```

---

## 🚀 Setup locale

L'app è completamente **client-side**: niente backend, niente server.

1. Clona il repo
2. Apri `index.html` in un browser
3. Configura `CLIENT_ID` in `shared.js` con il tuo OAuth Client ID di Google Cloud Console
4. Aggiungi l'origine del tuo deploy alle "Authorized JavaScript origins" su Google Cloud
5. Push su GitHub → GitHub Pages serve automaticamente

### Configurazione Google Cloud (una volta sola)

1. Vai su https://console.cloud.google.com
2. Crea un progetto
3. Abilita Google Drive API
4. Crea credenziali OAuth 2.0 Client ID (tipo: Web)
5. Aggiungi l'URL del tuo sito alle "Authorized JavaScript origins"
6. Copia il Client ID in `shared.js` riga 7

---

## 🛠️ Tecnologie

- **Vanilla JavaScript** (no framework, no build step)
- **HTML5 + CSS3** con custom properties per il theming
- **Google Identity Services** per OAuth
- **Google Drive API v3** per la sincronizzazione
- **GitHub Pages** per l'hosting

Niente dipendenze npm, niente bundler, niente compilazione. Apri qualsiasi file `.js` o `.html` e leggi direttamente.

---

## 🐝 Note finali

App pensata per uso personale. Tutti i dati sono salvati nella tua cartella Drive privata e nessuno (incluso lo sviluppatore) può accedervi.

In caso di problemi di accesso, usa **Backup locale** dalla barra in alto per scaricare un JSON con tutti i tuoi dati.
