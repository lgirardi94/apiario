# 🐝 Il Mio Apiario

Web app completa per la gestione di un apiario amatoriale o semi-professionale: censimento arnie con genealogia, registro visite, magazzino, contabilità, obiettivi, trattamenti antivarroa, calcolatori di sciroppo/candito/propoli, generatore di etichette per i vasi di miele, schede dettagliate per arnia e report PDF annuali. I dati sono sincronizzati automaticamente su **Google Drive** in una cartella privata dell'utente.

🔗 **Live**: https://lgirardi94.github.io/apiario/

---

## ✨ Funzionalità principali

### 🏡 Dashboard Home
- KPI cliccabili: **famiglie attive** (con breakdown nuclei/fecondazione/sciami), miele anno/totale, giorni di visita, saldo annuale e totale
- Banner stagionale con consigli del mese
- Alert intelligenti:
  - Scorte magazzino basse / esaurite
  - Arnie deboli o con problemi
  - **Nuclei pronti per promozione a Famiglia** (≥7 favi nelle ultime 2 visite)
  - **Sciami da valutare** (cattura recente, da classificare)
- Grafici miele/anno, arnie attive/anno, contabilità entrate-uscite
- Mappa visuale arnie con ultimo stato, ultima ispezione e composizione telaini
- Link rapidi a "Vedi tutte le visite" e "Vedi tutti gli obiettivi"

### 🏠 Censimento Arnie
- **4 tipi di arnia** con distinzione grafica:
  - 🏠 **Famiglia** (standard)
  - 🍯 **Nucleo** (in sviluppo, bordo ambra tratteggiato)
  - 👑 **Nucleo fecondazione** (mini-arnia per regine, viola)
  - 🐝 **Sciame catturato** (verde con ombra)
- **Numerazione automatica** progressiva univoca tra tutti i tipi (es. #1, #2, #3...)
- Schedario completo: nome, status, regina (anno/razza/temperamento), produttività, sciamatura, anno introduzione, anno dismissione
- **Mappa telaini** visualizzata sulla card + pulsante "🍯 Telaini" per modificarla
- Visualizzazione automatica accessori attivi (melari / rete propoli / trappola polline)

### 🌳 Genealogia (per Nucleo/Sciame/Fecondazione)
- **Data di costituzione/cattura**
- **Composizione telaini**: tipo (covata/scorte/misto/foglio cereo) + arnia di provenienza + note
- **Origine regina** in 3 varianti con date previste automatiche:
  - 🥚 **Allevata sul posto** → calcola sfarfallamento (+16gg), voli fecondazione (+30gg), prima deposizione (+38gg)
  - 👑 **Inserita** da altra arnia → date accettazione + primo controllo
  - 📥 **Acquistata** da fornitore esterno → date accettazione + primo controllo
- Per sciami: dimensione stimata + luogo di cattura
- **Check evoluzione sciame** automatico alla prima visita successiva (promuovere a famiglia/nucleo, lasciare come sciame o segnare come perso)

### 🔍 Scheda dettagliata arnia (full-screen, 4 tab)

**📋 Anagrafica**
- **Punteggio salute adattivo 0-10** calcolato sulle ultime 3 visite (5 componenti: sviluppo telaini, covata, scorte, celle reali, frequenza visite — pesi adattivi se mancano dati)
- Card con dati base (regina, età colonia, razza, ultima visita, miele anno, melari, temperamento, sciamatura)
- **Genealogia visiva**: arnie sorgenti, telaini ricevuti, origine regina, discendenti

**📅 Timeline**
- Storia cronologica colorata: ispezioni (verde), trattamenti (rosso), raccolte (giallo)
- Dettagli per ogni evento (covata, scorte, kg raccolti, prodotto trattamento)

**📊 Statistiche**
- Grafici a barre: produzione/anno, visite/anno, trattamenti/anno
- Giorni medi tra visite (ultimi 90 giorni)
- **Insight automatici** ("Produzione in crescita", "Frequenza ottimale", "Salute critica", ecc.)
- Tabella componenti del punteggio salute con scores e pesi

**📝 Note**
- Spazio libero per appunti personali, salvato su Drive

**🏷️ Tag automatici** + custom personalizzati:
- 🍯 Forte produttrice (≥25 kg) / Produttiva (≥15 kg)
- 😊 Docile / 😡 Aggressiva
- 👑 Regina giovane / 🌲 Colonia consolidata
- ⚠️ Tendenza sciamatura / Debole / Problema

### ⬆️ Promozione Nucleo → Famiglia
- **Manuale**: pulsante "⬆️ Promuovi a Famiglia" nella scheda dettagliata
- **Suggerimento automatico** in home quando ≥7 favi popolati nelle ultime 2 visite
- Mantiene il numero progressivo originale (#3 nucleo → #3 famiglia)
- Annotazione nelle note con data

### 🍯 Accessori produttivi (Melari / Rete propoli / Trappola polline)

**Melari** (multipli per arnia):
- N° telaini, data posizionamento, stato (in produzione / smielato / rimosso)
- Modifica diretta dalla card arnia o durante visita

**Rete propoli** (max 1 per arnia):
- Toggle attiva/disattiva con data di posizionamento
- Storico delle attivazioni passate

**Trappola polline** (max 1 per arnia):
- Toggle attiva/disattiva
- Posizione (Entrata / Fondo / Interna)
- Storico delle attivazioni passate

**Gestione durante visita** (sia normale che rapida):
- Sezione "Accessori produttivi" attiva quando selezioni un'arnia
- Aggiungi/rimuovi melari direttamente
- Attiva/disattiva rete e trappola con un click
- Le modifiche si applicano al salvataggio della visita

### 📝 Registro Visite
- Form unico per: ispezione, trattamento, nutrizione, raccolta, salute
- **Ispezione dettagliata**:
  - Covata 0-5, scorte 0-5, celle reali, regina vista, temperamento
  - Telaini totali con **mappa visuale** (covata opercolata, aperta, scorte, foglio cereo, vuoto)
  - Precompilazione automatica dall'ultima ispezione della stessa arnia
- **Trattamenti antivarroa**: prodotto, principio attivo, dose, lotto, note
- **Raccolta miele**: integrazione automatica con magazzino (entrata automatica)
- Filtri: testo, tipo, arnia, anno
- Modifica/cancellazione di entry esistenti

### ⚡ Visita Rapida (mobile)
- App separata ottimizzata per smartphone: wizard 4-step con haptic feedback
- Selezione arnia con cards visuali
- Tipo intervento con chip multi-select
- Form compatto per ispezione/raccolta/trattamento
- **Sezione accessori produttivi** integrata
- Salvataggio sincronizzato su Drive

### 📦 Magazzino
- Articoli con: categoria (miele, vasetti, etichette, attrezzatura, prodotti vari), unità, soglia minima
- Movimentazioni: entrate (acquisti, raccolte) e uscite (consumi, vendite)
- **Giacenza automatica** con alert sotto soglia
- **Controlli intelligenti**: duplicati, articoli simili (suggerimenti di merge)
- 4 tab: Articoli, Movimentazioni, Categorie, Stats

### 💰 Contabilità
- **Movimenti** con: data, tipo (entrata/uscita), categorie multiple, importo, descrizione, link a vendita/raccolta
- **6 categorie entrate**: vendita miele, nuclei/regine, cera/propoli, contributi, altro
- **7 categorie uscite**: farmaci, alimentazione, attrezzatura, arnie, trasporti, burocrazia, altro
- **6 grafici avanzati**:
  - Top dell'anno (entrata principale, uscita principale, mese migliore)
  - Diamante mensile entrate vs uscite
  - Saldo cumulativo SVG con area positiva/negativa
  - Torte per categoria (entrate e uscite)
  - Top 5 movimenti dell'anno
  - Heatmap pluriennale mesi×anni
- Filtri per anno (con anni futuri 2027-2029 disponibili)
- Riepilogo entrate/uscite/saldo

### 🎯 Obiettivi
- Schede per stagione (primavera, estate, autunno, inverno) o annuali
- Stati: pianificato, in corso, completato, sospeso
- Anni futuri (fino a 3 anni) per pianificazione strategica
- Visualizzazione progressi annuali

### 🛠️ Utility — Sezioni multiple

**📅 Calendario lavori stagionale**
- Attività mese per mese
- Periodi di trattamento consigliati
- Date chiave dell'anno apistico

**🍬 Sciroppo zuccherino** (4 tab)
- **Calcolatore**: slider alveari, scelta proporzione 1:1 o 2:1, dosi acido citrico (0.5 g/L)
- **Procedimento**: step-by-step con bustine Dr.Oetker, temperature, miscelazione
- **Conservazione**: in frigo / temperatura ambiente per 1:1 e 2:1
- **Quando si usa**: stagioni e quantità per situazione

**🍯 Candito** (4 tab)
- Calcolatore con toggle Classico (82% zucchero + 18% miele) / Con polline (75% + 15% + 10%)
- Slider alveari (1-20) e grammi/alveare (250-2500)
- Procedimento, conservazione, periodi d'uso

**🌿 Propoli** (4 tab) — **NUOVO**
- **Calcolatore tintura** alcolica/analcolica:
  - Slider grammi propoli (50-500g)
  - 3 concentrazioni: 10%, 20% (standard), 30%
  - 3 gradazioni alcool di partenza: 90°, 95°, 96°
  - Output: ml alcool puro + ml acqua distillata + barattolo consigliato
- **Procedimento**: 5 step (pulizia con congelamento, diluizione con tabella di riferimento, macerazione, riposo, doppio filtraggio)
- **Conservazione**: alcolica 3-5 anni, analcolica 12-18 mesi
- **Usi e dosi**: prevenzione, mal di gola, ferite, igiene orale, verruche + controindicazioni e tabella comparativa

**💊 Trattamenti antivarroa**
- Schede prodotti (Api-Bioxal, VarroMed, ApiGuard, ecc.)
- Linee guida ministeriali IZS Venezie
- Periodo di sospensione miele

**🏷️ Etichette** (app separata)
- Generatore etichette personalizzabili per vasetti
- 8 stili predefiniti (Tondo classico, Hexagon, Linea moderna, ecc.)
- Editor visuale con drag&drop di testi
- Bordino nero personalizzabile (0-2pt) per stili tondi
- Sincronizzazione default utente su Drive
- Stampa PDF in formato A4 con multi-etichetta

### 📄 Report PDF annuali (13 sezioni)

**Report completo**:
1. Panoramica generale (KPI)
2. Produzione per varietà (con barre)
3. Produzione per arnia
4. Bilancio
5. Trattamenti
6. Obiettivi
7. **Dettaglio per arnia** (tabella con punteggio salute colorato)
8. **Contabilità dettagliata** (entrate/uscite per categoria, andamento mensile, top 5)
9. **Inventario magazzino al 31/12** (con alert articoli sotto soglia)
10. **Statistiche genealogia** (nuclei creati, sciami catturati, promozioni, origine regine)
11. **Confronto con anni precedenti** (ultimi 3 anni)
12. **Calendario attività mensile**
13. **Riepilogo finale** (statistiche chiave + trend automatici)

**Registro trattamenti**: formato ufficiale per ispezione veterinaria con firma apicoltore.

Apertura in nuova finestra con tasto **🖨️ Stampa / Salva come PDF** del browser.

---

## ☁️ Sincronizzazione Google Drive

I dati sono salvati automaticamente in una cartella **`appdata`** privata su Google Drive (invisibile all'utente, gestita solo dall'app).

**File salvati**:
- `apiario_db.json` — Arnie + registro visite
- `apiario_magazzino.json` — Articoli + movimentazioni
- `apiario_contabilita.json` — Movimenti contabili
- `apiario_obiettivi.json` — Obiettivi stagionali/annuali
- `apiario_settings.json` — Preferenze utente
- `apiario_etichette.json` — Template etichette + default utente

**Flusso**:
1. Click "🔐 Accedi con Google" → autorizza scope `drive.appdata`
2. Caricamento automatico dei dati esistenti
3. Salvataggio dopo ogni modifica
4. Pulsante "💾 Salva ora" per forzare il sync

---

## 🛠️ Architettura tecnica

### Stack
- **Frontend puro**: HTML5 + CSS3 + JavaScript ES6+ (no framework)
- **No build step**: tutto il codice gira direttamente nel browser
- **Hosting**: GitHub Pages
- **Storage**: Google Drive API v3 (scope `appdata` privato)
- **OAuth2**: Google Identity Services

### Struttura file
```
apiario/
├── index.html              # App principale
├── visita_rapida.html      # Wizard mobile per visite
├── inserimento_rapido.html # (legacy)
├── etichette.html          # App generatore etichette
├── shared.js               # Costanti e helper condivisi
├── style-main.css          # Stili desktop
├── style-mobile.css        # Stili mobile
└── js/
    ├── state.js            # Stato globale + storage
    ├── nav.js              # Navigazione tab
    ├── home.js             # Dashboard
    ├── arnie.js            # Gestione arnie + scheda dettagliata
    ├── registro.js         # Form visite
    ├── magazzino.js        # Articoli + giacenze
    ├── contabilita.js      # Movimenti + grafici
    ├── obiettivi.js        # Obiettivi stagionali
    ├── sciroppo.js         # Calcolatore sciroppo
    ├── candito.js          # Calcolatore candito
    ├── propoli.js          # Calcolatore propoli
    ├── report.js           # Generazione PDF
    ├── drive-app.js        # Integrazione Google Drive
    └── import-export.js    # Backup/restore JSON
```

### Cache busting
Tutti gli script JS hanno query string versione (`?v=YYYYMMDDx`) per forzare il reload dopo gli aggiornamenti.

---

## 🚀 Installazione e uso

### Per l'utente finale
1. Apri https://lgirardi94.github.io/apiario/
2. Click "🔐 Accedi con Google"
3. Autorizza l'accesso a Drive (solo cartella `appdata` dell'app)
4. Inizia a usare l'app — i dati si sincronizzano automaticamente

### Per modifiche / fork

```bash
# Clone
git clone https://github.com/lgirardi94/apiario.git
cd apiario

# Per testare in locale, serve un server HTTP (non file://)
# Su macOS/Linux:
python3 -m http.server 8000

# Su Windows con Python:
python -m http.server 8000

# Poi apri: http://localhost:8000
```

**Configurazione Google Drive (solo per fork)**:
1. Vai su Google Cloud Console → crea progetto
2. Abilita Drive API
3. Crea credenziali OAuth2 "Web application"
4. Aggiungi origini autorizzate (es. `https://tuoutente.github.io`)
5. Sostituisci il `CLIENT_ID` in `js/drive-app.js`

---

## 📱 PWA / Mobile

L'app è **responsive** e ottimizzata per smartphone:
- Visita rapida con wizard a step
- Haptic feedback su tap
- Layout adattivo per schermi piccoli
- Click su KPI per navigazione veloce

Per usarla come **app mobile**:
- iOS Safari: condividi → "Aggiungi alla schermata home"
- Android Chrome: menu → "Installa app"

---

## 📊 Modello dati (per sviluppatori)

### Arnia
```javascript
{
  id, num, tipo,                        // famiglia / nucleo / nucleo_fec / sciame
  nome, status, reginaAnno,
  razza, razzaOrigine, temperamento, sciamatura, produttivita,
  annoIntroduzione, annoDismissione,
  melari: [{ id, num, data, status, note }],
  retePropoli: { data, note, attiva, storico: [{ dataInizio, dataFine, ... }] },
  trappolaPolline: { posizione, data, note, attiva, storico: [...] },
  // Genealogia
  dataCostituzione,
  telainiOrigine: [{ tipo, arniaSrcId, note }],
  reginaOrigine,                        // allevata / inserita / acquistata
  reginaArniaSrc, reginaFornitore,
  sciameDim, sciameLuogo, sciameNeedsEvolutionCheck,
  // Scheda
  customTags: [],
  notaLibera: ''
}
```

### Visita (logBook entry)
```javascript
{
  id, data, arniaId, arniaNome,
  tipo: ['ispezione', 'raccolta', ...],
  note, varroa,
  ispezione: { covata, scorte, celleReali, telaini, mappa: [...] },
  raccolta: [{ articoloId, qta }],
  trattamento: { prodotto, principioAttivo, dose, lotto }
}
```

---

## 🐝 Crediti

Sviluppato per **lgirardi94** (apicoltore in Ticino, Svizzera) con il supporto di Claude AI per il design e l'implementazione iterativa.

Versione corrente: **maggio 2026**

---

## 📜 Licenza

Codice rilasciato per uso personale dell'apicoltore. Per fork o uso commerciale, contattare l'autore.
