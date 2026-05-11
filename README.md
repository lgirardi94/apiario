# 🐝 Il Mio Apiario

Web app completa per la gestione di un apiario amatoriale o semi-professionale: censimento arnie, registro visite con ispezione dettagliata, magazzino, contabilità, obiettivi, trattamenti antivarroa, calcolatore sciroppo e generatore di etichette per i vasi di miele. I dati sono sincronizzati automaticamente su **Google Drive** in una cartella privata.

🔗 **Live**: https://lgirardi94.github.io/apiario/

---

## ✨ Funzionalità

### 🏡 Dashboard Home
- KPI cliccabili: arnie attive, miele anno/totale, giorni di visita, saldo annuale e totale
- Banner stagionale con consigli del mese
- Alert su problemi (scorte basse, arnie deboli, magazzino vuoto)
- Grafici miele/anno, arnie attive/anno, contabilità entrate-uscite
- Mappa visuale arnie con ultimo stato e ultima ispezione
- Link rapidi a "Vedi tutte le visite" e "Vedi tutti gli obiettivi"

### 🏠 Censimento Arnie
- Schedario completo: numero, nome, status, regina (anno/razza/temperamento)
- Storico melari per ogni arnia
- Calcolo automatico produzione per anno (multi-prodotto)
- Pannello dettaglio con ultima ispezione e mappa telaini grafica

### 📖 Registro Visite
- Tipi multipli per visita: ispezione, trattamento, nutrizione, raccolta, salute, altro
- **Ispezione**: covata, scorte, celle reali, mappa telaini con tipologie colorate
- **Trattamento**: dropdown con VarroMed/Api-Bioxal/Altro + campo dosaggio
- **Raccolta**: multi-prodotto con auto-creazione movimenti magazzino
- Precompilazione automatica dall'ultima ispezione dell'arnia
- Conteggio "giorni di visita" (più arnie visitate lo stesso giorno = 1)
- Filtri per tipo, arnia, ricerca testuale
- Esportazione CSV

### 📦 Magazzino
- Articoli divisi in categorie (prodotti finiti, consumabili, materiale, farmaci)
- Movimentazioni multi-articolo (entrate/uscite)
- Controlli automatici sui duplicati con algoritmo di similarità bigram
- Merge bidirezionale degli articoli duplicati (sposta movimentazioni ed elimina)
- Coppie "ignorate" salvate su Drive (no falsi positivi ricorrenti)

### 💰 Contabilità
- Entrate e uscite con categorie predefinite (a chip multipli)
- Riepilogo annuale con grafici per categoria
- Storico mensile e filtri anno

### 🎯 Obiettivi
- Stagionali (primavera/estate/autunno/inverno)
- Annuali con target/attuale, unità di misura e barra di progresso
- Storico obiettivi completati

### 📚 Utility (4 tab)

**📅 Calendario Lavori**
Guida completa alle attività stagionali nell'apiario, mese per mese con accordion espandibile.

**🍬 Sciroppo**
- Calcolatore con slider per numero di arnie e litri per arnia
- Modalità 1:1 (primaverile) e 2:1 (autunnale)
- Procedimento di preparazione, conservazione, integratori

**💊 Trattamenti**
Guida ai trattamenti antivarroa con i due prodotti più usati:
- **VarroMed** (primavera + fine estate): periodo, modalità, dosaggio 40-60 ml/arnia
- **Api-Bioxal liquido** (inverno): pronto all'uso, 5 ml per favo
- Tabella riassuntiva annuale e buone pratiche generali
- Link alle linee guida ufficiali IZS Venezie/Ministero della Salute

**🏷️ Etichette**
Card grafica con call-to-action per aprire il [Generatore etichette](#-generatore-etichette).

### 📱 Pagine Mobile/Touch dedicate

**`visita_rapida.html`** — Wizard mobile 4 step
1. Selezione arnia (card grandi con stato e ultima visita)
2. Data + tipo intervento (chip a griglia)
3. Dettagli adattivi (ispezione, raccolta, trattamento)
4. Note + riepilogo + salva
- Pre-selezione automatica trattamento in base alla stagione
- Suggerimenti note rapidi (chip cliccabili)
- Validazione realtime tasto "Avanti"
- Banner sticky con arnia selezionata negli step 2-4
- Haptic feedback su mobile
- Popup Google Calendar per programmare la prossima visita

**`inserimento_rapido.html`** — Form contabilità/magazzino veloce
- Tab Contabilità: importo, descrizione, categorie a chip
- Tab Magazzino: filtro per categoria + ricerca, dropdown raggruppato, barra giacenza colorata
- Suggerimenti note rapidi
- Validazione realtime e haptic feedback
- Riepilogo "movimenti oggi" in fondo alla home

### 🏷️ Generatore etichette
Pagina dedicata `etichette.html` per creare e stampare etichette personalizzate per i vasi di miele:
- Layout A4 con etichette **50×30 mm** (24 per foglio)
- 3 stili pronti: **Rustico**, **Minimal**, **Vintage** — completamente personalizzabili
- Tipi di prodotto custom (con colore personalizzato)
- Personalizzazione completa: font, dimensioni, decorazioni, colori per ogni elemento
- **Configurazioni salvate** (manuale con nome): salva e ricarica i tuoi standard ricorrenti
- **Storico ultime 5 stampe** (automatico): ogni stampa salva uno snapshot ricaricabile
- Stampa diretta o esportazione PDF
- Tutti i dati sincronizzati su Drive

---

## 🗂️ Struttura del repository

```
apiario/
│
├── index.html                  # App principale (desktop)
├── visita_rapida.html          # Wizard mobile per visite
├── inserimento_rapido.html     # Form mobile contabilità/magazzino
├── etichette.html              # Generatore etichette
│
├── shared.js                   # Costanti e funzioni condivise tra tutte le pagine
├── style-main.css              # Stili app desktop
├── style-mobile.css            # Stili pagine mobile
│
└── js/                         # Moduli JavaScript dell'app principale
    ├── state.js                # Variabili globali + save helpers + helper statistiche
    ├── nav.js                  # Navigazione tra sezioni e tab Utility
    ├── home.js                 # Dashboard
    ├── arnie.js                # Censimento + dettaglio arnie
    ├── registro.js             # Registro visite + ispezione + trattamenti
    ├── magazzino.js            # Articoli + movimentazioni + controlli duplicati
    ├── contabilita.js          # Riepilogo + movimenti contabili
    ├── obiettivi.js            # Stagionali/annuali/storico
    ├── sciroppo.js             # Calcolatore
    ├── drive-app.js            # Login obbligatorio + auto-save Drive
    └── import-export.js        # Backup JSON locale
```

---

## 📚 Spiegazione dei file

### 🌐 Pagine HTML

#### `index.html` (~1100 righe)
App principale desktop. Contiene solo struttura HTML — la logica è tutta nei file in `js/`. Schermata di login Drive obbligatoria all'apertura.

#### `visita_rapida.html`
Wizard mobile a 4 step per registrare velocemente una visita. Sincronizzato con la stessa cartella Drive dell'app principale.

#### `inserimento_rapido.html`
Form mobile dedicato a contabilità e magazzino: 2 tab + home con riepilogo dei movimenti del giorno.

#### `etichette.html`
Generatore etichette completo con anteprima A4 live, 3 stili predefiniti, configurazioni salvate e storico. Salva tutto su `apiario_etichette.json` in Drive.

---

### 📜 File JavaScript

#### `shared.js` (~340 righe)
Codice condiviso tra **tutte** le pagine HTML:

- **Costanti**: `CLIENT_ID`, `SCOPES`, nomi file Drive, categorie contabili
- **Costanti ispezione**: `TELAINO_OPZIONI` (con colori e label), `CELLE_REALI_LABEL`, `COVATA_LABEL`, `SCORTE_LABEL`
- **Utility**: `fmt`, `formatDate`, `today`, `getGiacenza`, `similarity`, `getTipi`
- **Drive API**: `initDrive`, `driveLogin`, `driveLogout`, `driveReadFile`, `driveWriteFile`, `driveLoadAll`, `driveSaveAll`
- **Calendar**: `buildGCalLink`, `showCalendarPopup`
- **Helper rendering**: `getTelainoInfo`, `renderTelainiVisualHTML`

#### `js/state.js`
Variabili globali e funzioni di salvataggio:

```javascript
let arnie, logBook, articoli, movimentazioni,
    movimentiContabili, obiettivi, settings;

// Helpers che salvano localStorage + push automatico su Drive
saveDB() saveMagazzino() saveContabilita() saveObiettivi() saveSettings()

// Helpers di calcolo riusabili
getMieleStats()                 // { totale, perAnno: {...} }
findUltimaIspezione(arniaId)    // ultima visita di tipo ispezione
countGiorniVisita(annoFilter)   // giorni distinti con almeno una visita
```

#### `js/nav.js`
- Navigazione tra sezioni (`navigateTo`, `showSection`)
- Tab Utility (Calendario / Sciroppo / Trattamenti / Etichette)
- Accordion calendario mensile

#### `js/home.js`
Render della dashboard: banner stagionale, KPI, alert, mappa arnie con telaini, ultime visite, obiettivi in corso, grafici.

#### `js/arnie.js`
Censimento arnie: lista, modal di creazione/modifica, pannello dettaglio con mappa telaini grafica, gestione melari.

#### `js/registro.js`
- Form di inserimento visita con campi adattivi al tipo
- Sezione **trattamento** con dropdown prodotto + dosaggio
- Sezione **ispezione** con mappa telaini interattiva
- Multi-raccolta con auto-creazione movimenti magazzino
- Precompilazione automatica dall'ultima ispezione
- Lista visite con filtri ed esportazione CSV

#### `js/magazzino.js`
Articoli + movimentazioni + controlli duplicati (algoritmo similarità bigram, merge bidirezionale, ignore list su Drive).

#### `js/contabilita.js`
Modal multi-categoria, riepilogo per anno/mese, grafici.

#### `js/obiettivi.js`
3 tab stagionali/annuali/storico, modal di creazione, calcolo automatico del progresso.

#### `js/sciroppo.js`
Calcolatore proporzioni acqua/zucchero in base alla modalità (1:1 / 2:1).

#### `js/drive-app.js`
**Cuore della sincronizzazione**:

- **Login obbligatorio**: schermata login full-screen, app nascosta finché non autenticati
- **Auto-save con debounce 800ms**: aspetta il silenzio prima di salvare
- **Coda di salvataggi**: se uno è in corso e arriva un altro, viene accodato (non scartato)
- **Detect online/offline**: indicatore visibile, sospende salvataggi offline, sincronizza al ritorno della connessione
- **Retry automatico** dopo 5 secondi in caso di errore di rete
- **Beforeunload guard**: avvisa se chiudi la scheda con modifiche non salvate
- **Logout pulito**: cancella timer pendenti, azzera stato, pulisce localStorage

#### `js/import-export.js`
Backup locale: esportazione JSON completo, importazione con sincronizzazione automatica su Drive.

---

### 🎨 File CSS

#### `style-main.css`
Stili dell'app desktop. Tema "miele e legno" con palette ambra/marrone, font serif per titoli (Playfair Display) e sans per testo.

#### `style-mobile.css`
Stili condivisi tra `visita_rapida.html` e `inserimento_rapido.html`. Ottimizzato per touch (target ≥44px), card grandi, layout a colonna unica.

---

## ☁️ Sincronizzazione Google Drive

L'app usa la API di Drive con scope `drive.appdata`: i file sono salvati in una **cartella nascosta privata** non visibile dall'utente in Drive (evita cancellazioni accidentali).

### File salvati su Drive

| File | Contenuto |
|------|-----------|
| `apiario_db.json` | Arnie + registro visite |
| `apiario_magazzino.json` | Articoli + movimentazioni |
| `apiario_contabilita.json` | Movimenti contabili |
| `apiario_obiettivi.json` | Obiettivi stagionali/annuali |
| `apiario_settings.json` | Preferenze (es. duplicati ignorati) |
| `apiario_etichette.json` | Tipi prodotto, righe, stili, configurazioni e storico stampe |

Ogni file ha versione + timestamp salvataggio.

### Flusso di salvataggio

```
saveMagazzino()
    ↓
localStorage.setItem(...)        ← cache locale immediata
    ↓
pushToCloud(true)                ← debounce 800ms
    ↓
[se altro save arriva → si aggiunge alla coda]
    ↓
driveSaveAll(...)                ← push su Drive di TUTTI i file principali
    ↓
✅ "Salvato su Drive"
```

La pagina `etichette.html` ha un flusso simile dedicato sul suo file.

---

## 📅 Integrazione Google Calendar

Dopo il salvataggio di una visita (sia da `index.html` che da `visita_rapida.html`), appare un popup che propone di **schedulare la prossima visita**:
- Suggerimento data automatico (+14 giorni)
- Campo note opzionale per memo
- Tasto **"Aggiungi al Calendario"** apre Google Calendar con evento precompilato (titolo, durata 1h, descrizione)

Funziona via link URL `calendar.google.com/calendar/render` — zero configurazione, niente API aggiuntive.

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
3. Abilita **Google Drive API**
4. Crea credenziali OAuth 2.0 Client ID (tipo: Web)
5. Aggiungi l'URL del tuo sito alle "Authorized JavaScript origins"
6. Copia il Client ID in `shared.js`

---

## 🛠️ Tecnologie

- **Vanilla JavaScript** (no framework, no build step)
- **HTML5 + CSS3** con custom properties per il theming
- **Google Identity Services** per OAuth
- **Google Drive API v3** per la sincronizzazione (scope `drive.appdata`)
- **GitHub Pages** per l'hosting

Niente dipendenze npm, niente bundler, niente compilazione. Apri qualsiasi file `.js` o `.html` e leggi direttamente.

---

## 🎯 Caratteristiche tecniche notevoli

- **Login obbligatorio** su tutte le pagine: Drive come fonte unica di verità, localStorage solo come cache
- **Race condition resilient**: gestione coda salvataggi, retry, debounce 800ms
- **Offline-aware**: detect connessione, indicatore visivo, retry automatico al ripristino
- **Performance**: lookup `Map` per articoli/log con migliaia di entry, calcolo statistiche centralizzato
- **Type safety**: `parseInt(x, 10)` ovunque, conversioni esplicite stringa/numero
- **CSS modulare**: una sola fonte di verità per colori telaini (`TELAINO_OPZIONI` in `shared.js`)
- **UX mobile**: haptic feedback, validazione realtime, suggerimenti note rapidi

---

## 🐝 Note finali

App pensata per uso personale. Tutti i dati sono salvati nella tua cartella Drive privata (`drive.appdata`) e **nessuno** (incluso lo sviluppatore) può accedervi.

In caso di problemi di accesso, usa **"⬇ Backup locale"** dalla barra in alto dell'app principale per scaricare un JSON con tutti i tuoi dati.
