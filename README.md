# 🐝 Il Mio Apiario

Web app completa per la gestione di un apiario amatoriale o semi-professionale: censimento arnie con genealogia, registro visite (anche multi-arnia), magazzino intelligente, contabilità integrata, ordini, obiettivi, trattamenti antivarroa, calcolatori di sciroppo/candito/propoli, generatore di etichette, analisi economiche e report PDF annuali. I dati sono sincronizzati automaticamente su **Google Drive** in una cartella privata dell'utente, con backup automatici settimanali e ripristino.

🔗 **Live**: https://lgirardi94.github.io/apiario/

---

## ✨ Funzionalità principali

### 🏡 Dashboard Home
- KPI cliccabili: famiglie attive (con breakdown nuclei/fecondazione/sciami), miele anno/totale, giorni di visita, saldo annuale e totale
- Banner stagionale con consigli del mese
- **Barra di ricerca globale** sempre in alto: cerca tra arnie, visite, articoli di magazzino e ordini, con risultati raggruppati e navigazione diretta
- Alert intelligenti:
  - Scorte magazzino basse / esaurite
  - Articoli **scaduti** o **in scadenza** entro 3 mesi
  - Articoli **in esaurimento** (< 1 mese) in base al consumo storico
  - Arnie deboli o con problemi
  - Nuclei pronti per promozione a Famiglia (≥7 favi nelle ultime 2 visite)
  - Sciami da valutare
  - Ordini urgenti / con scadenza entro 7 giorni
- **Box "Da ordinare"**: riepilogo sintetico degli ordini con conteggi per priorità, top 3 voci, totale stimato e copia lista. Mostra separatamente gli ordini "in arrivo"
- Grafici miele/anno, arnie attive/anno, contabilità entrate-uscite
- Mappa visuale arnie con ultimo stato, ultima ispezione e composizione telaini

### 🏠 Censimento Arnie
- **4 tipi di arnia** con distinzione grafica:
  - 🏠 **Famiglia** (standard)
  - 🍯 **Nucleo** (in sviluppo, bordo ambra tratteggiato)
  - 👑 **Nucleo fecondazione** (mini-arnia per regine, viola)
  - 🐝 **Sciame catturato** (verde con ombra)
- **Numerazione automatica** progressiva univoca tra tutti i tipi (es. #1, #2, #3…)
- Schedario completo: nome, status, regina (anno/razza/temperamento), produttività, sciamatura, anno introduzione, anno dismissione
- **Mappa telaini** visualizzata sulla card + pulsante per modificarla
- Visualizzazione automatica accessori attivi (melari / rete propoli / trappola polline)
- Eliminazione con conferma e avviso sulle visite collegate
- **Scheda dettagliata** con 5 tab: Anagrafica, Produzioni, Timeline, Statistiche, Note

### 🌳 Genealogia (per Nucleo/Sciame/Fecondazione)
- Data di costituzione/cattura
- Composizione telaini: tipo (covata/scorte/misto/foglio cereo) + arnia di provenienza + note
- **Origine regina** in 3 varianti con date previste automatiche:
  - 🥚 **Allevata sul posto** → sfarfallamento (+16gg), voli fecondazione (+30gg), prima deposizione (+38gg)
  - 👑 **Inserita** da altra arnia → date accettazione + primo controllo
  - 📥 **Acquistata** da fornitore esterno → date accettazione + primo controllo
- Colore regina secondo lo standard internazionale (bianco/giallo/rosso/verde/blu in base all'anno)

### 📖 Registro Visite
- Tipi di intervento multipli per visita: ispezione, trattamento, nutrizione, produzione, salute, altro
- **Ispezione dettagliata**: covata, scorte, celle reali, mappa telaini visuale con composizione
- **Filtri**: testo, tipo, arnia e **intervallo di date** (dal/al)
- Precompilazione automatica dall'ultima ispezione
- Esportazione CSV
- **Visita multi-arnia**:
  - **Desktop**: blocchi affiancati: dati comuni (data/tipo/trattamento) + note e ispezione separate per ogni arnia, con precompilazione dall'ultima visita di ciascuna
  - **Mobile** (visita rapida): wizard a step ripetuti — selezione multipla → tipo comune → uno step di dettaglio per ogni arnia → schermata di riepilogo a schede → salvataggio di N visite distinte

### 📦 Magazzino intelligente
- **8 categorie strutturate**: 💊 Farmaci/sanitari, 🍬 Alimentazione, 🪵 Telai e cera, 📦 Arnie e componenti, 🔧 Attrezzatura, 🫙 Confezionamento, 🍯 Prodotti finiti, 📋 Altro
- **Barra KPI**: numero articoli, sotto soglia, in scadenza, valore stimato totale
- **Ordinamento** per nome, giacenza, scadenza, categoria, valore
- **Filtro "sotto soglia"** + pulsante one-click per aggiungere tutti i sotto-soglia alla lista ordini
- **Carico/scarico rapido inline** (+/−) direttamente sulla card
- **Prezzo unitario** per articolo → valore di magazzino calcolato automaticamente
- **Previsione consumo**: stima i mesi di scorta residui in base ai consumi degli ultimi 6 mesi
- Scadenza e lotto per gli articoli deperibili (farmaci, alimentazione, ecc.)

### 🛒 Ordini (Da ordinare)
- Lista articoli da acquistare con stato: **da ordinare → ordinato → ricevuto**
- Priorità (urgente/alta/media/bassa), fornitore, data prevista
- **Controvalore merce** e **spese di spedizione** separate
- Possibilità di creare al volo un articolo nuovo nel magazzino
- Filtri per stato/priorità/fornitore e raggruppamenti
- **Copia lista** negli appunti, formattata per priorità
- **Alla ricezione**, in automatico:
  - Carico a magazzino della merce
  - Aggiornamento del prezzo unitario dell'articolo (merce ÷ quantità)
  - Registrazione della spesa in contabilità (categoria dedotta dal tipo articolo)
  - Registrazione separata della spesa di spedizione

### 💰 Contabilità integrata
- Movimenti entrata/uscita con categorie dedicate (incluse spese di spedizione)
- Riepilogo annuale entrate/uscite/saldo, filtri per anno e categoria
- **Movimenti auto-generati** da ordini e vendite marcati con badge "🔗 auto", comunque modificabili
- Movimenti modificabili ed eliminabili

### 💸 Vendita rapida
- Disponibile sia da **Magazzino** sia da **Contabilità** (desktop) e in tab dedicata (mobile)
- Scegli prodotto (o voce libera) + quantità + prezzo → in un colpo solo:
  - Scarico del prodotto dal magazzino
  - Registrazione dell'entrata in contabilità
- Calcolo totale in tempo reale e avviso giacenza insufficiente

### 📊 Analisi (Insights)
Sezione dedicata con selettore anno:
- **💰 Il vero costo del miele**: consumabili + ammortamento attrezzatura ÷ kg prodotti → costo per kg e per vasetto
- **🧮 Simulatore prezzo di vendita**: slider prezzo + pezzatura → ricavo, margine %, vasetti producibili, punto di pareggio
- **🗓️ Heatmap stagionale produzione**: griglia arnia × mese, colore in base ai kg
- **👑 Genealogia regine**: albero delle linee genetiche con produttività e suggerimento sulla linea migliore
- **📖 L'anno delle tue arnie**: racconto generato automaticamente per ogni arnia (avvio stagione, produzione, trattamenti, sciamatura)

### 📄 Report annuale (PDF / stampa)
Documento completo e stampabile con:
- Bilancio economico (entrate/uscite/saldo) e valore di magazzino
- Costo di produzione del miele
- Ripartizione delle spese per categoria
- Produzione per arnia
- **Registro trattamenti sanitari** (utile per gli obblighi sanitari)
- Racconti narrativi per arnia

### 🎯 Obiettivi
- Definizione obiettivi stagionali con stato e scadenza
- Monitoraggio avanzamento dalla home

### 🧪 Calcolatori e utility
- **Sciroppo zuccherino** (rapporti primaverili/autunnali)
- **Candito**
- **Propoli** (resa da rete)
- **Trattamenti antivarroa**: registro e calendario stagionale

### 🏷️ Generatore etichette
- Stili multipli per vasi di miele, propoli e polline (tonde, rettangolari, ecc.)
- Editor a 2 livelli con campi personalizzabili
- Anteprima e stampa

---

## 📱 Strumenti rapidi (mobile)

### Visita rapida (`visita_rapida.html`)
Wizard ottimizzato per il campo: selezione arnie (anche multipla) → tipo intervento → dettagli per arnia → riepilogo → salvataggio. Carica automaticamente le raccolte a magazzino.

### Inserimento rapido (`inserimento_rapido.html`)
Gestione rapida di **contabilità, magazzino, vendite e ordini** da telefono, con la stessa logica integrata della versione desktop (auto-spesa, vendita, spedizioni, badge auto).

---

## 💾 Sincronizzazione e backup

- Salvataggio automatico su **Google Drive** (cartella privata `appDataFolder`) a ogni modifica
- File separati per database, magazzino, contabilità, obiettivi, ordini, impostazioni, etichette
- **Backup automatico settimanale**: crea copie datate (ultime 5 mantenute)
- **Ripristino backup**: dalla barra in alto puoi vedere i backup disponibili e ripristinarne uno; prima del ripristino viene creato un backup di sicurezza dello stato corrente
- Backup/ripristino manuale anche in formato JSON locale

---

## 🛠️ Struttura tecnica

App **statica** (HTML + CSS + JavaScript vanilla), senza framework né build. Ospitata su GitHub Pages.

### File principali
| File | Descrizione |
|------|-------------|
| `apiario.html` | App principale (da pubblicare come `index.html`) |
| `visita_rapida.html` | Wizard visita rapida (mobile) |
| `inserimento_rapido.html` | Gestione rapida magazzino/contabilità/ordini (mobile) |
| `etichette.html` | Generatore etichette |
| `shared.js` | Costanti, helper condivisi, funzioni Google Drive, categorie |
| `style-main.css` / `style-mobile.css` | Stili |

### Moduli JavaScript (`js/`)
| Modulo | Responsabilità |
|--------|----------------|
| `state.js` | Variabili di stato globali e funzioni di salvataggio |
| `nav.js` | Navigazione tra sezioni e tab |
| `home.js` | Dashboard, KPI, alert, grafici |
| `arnie.js` | Censimento arnie, schede, genealogia, salute |
| `registro.js` | Registro visite, ispezioni, multi-arnia |
| `magazzino.js` | Magazzino, KPI, previsioni, vendita rapida |
| `necessita.js` | Ordini "da ordinare", ricezione, auto-spesa |
| `contabilita.js` | Movimenti contabili, categorie, modifica |
| `obiettivi.js` | Obiettivi stagionali |
| `sciroppo.js` / `candito.js` / `propoli.js` | Calcolatori |
| `report.js` | Report PDF (completo e trattamenti) |
| `insights.js` | Analisi economiche, heatmap, genealogia, report annuale |
| `ricerca.js` | Ricerca globale |
| `drive-app.js` | Integrazione Google Drive, backup, ripristino |
| `import-export.js` | Import/export dati |

### Google Drive
- **Client ID** OAuth dedicato, scope `drive.appdata` (solo cartella privata dell'app, nessun accesso ad altri file dell'utente)
- I file vengono letti/scritti in parallelo per velocità

---

## 🚀 Installazione / aggiornamento

1. Carica i file su un repository GitHub (es. `lgirardi94/apiario`)
2. Rinomina `apiario.html` in `index.html`
3. Attiva **GitHub Pages** sul branch principale
4. Per aggiornare: sostituisci i file modificati e fai un **hard refresh** (Ctrl/Cmd + Shift + R)

> I tag `<script>` usano un parametro di versione (`?v=YYYYMMDD`) come *cache buster*: va incrementato quando si aggiornano i file JS per forzare il ricaricamento.

---

## 📲 PWA

L'app è installabile come Progressive Web App su smartphone e desktop, per l'accesso rapido dalla schermata home e l'uso a schermo intero.

---

## 🔒 Privacy

Tutti i dati restano nell'account Google Drive dell'utente, in una cartella privata dedicata all'app. Nessun dato viene inviato a server di terze parti.
