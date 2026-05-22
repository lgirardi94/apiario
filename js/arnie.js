// ======= ARNIE =======
let editingMelari = []; // temp melari list while modal is open
let editingTelaini = []; // temp telaini (genealogia) list while modal is open

// ===== COSTANTI: tipi arnia =====
const ARNIA_TIPI = {
  famiglia:    { label: 'Famiglia',             icon: '🏠', short: 'Famiglia',   color: 'brown',  cls: 'tipo-famiglia' },
  nucleo:      { label: 'Nucleo',               icon: '🍯', short: 'Nucleo',     color: 'amber',  cls: 'tipo-nucleo' },
  nucleo_fec:  { label: 'Nucleo fecondazione',  icon: '👑', short: 'Fecond.',    color: 'purple', cls: 'tipo-nucleo-fec' },
  sciame:      { label: 'Sciame catturato',     icon: '🐝', short: 'Sciame',     color: 'green',  cls: 'tipo-sciame' },
};

// ===== COSTANTI: tipi telaino =====
const TELAINO_TIPI = {
  covata:    { label: 'Covata', icon: '🟡' },
  scorte:    { label: 'Scorte (miele/polline)', icon: '🍯' },
  misto:     { label: 'Misto (covata + scorte)', icon: '🟠' },
  vuoto:     { label: 'Vuoto / Foglio cera', icon: '⬜' },
};

// Restituisce il prossimo numero progressivo disponibile (univoco tra TUTTI i tipi)
function nextArniaNumber() {
  const used = new Set(arnie.map(a => parseInt(a.num, 10)).filter(n => !isNaN(n)));
  let n = 1;
  while(used.has(n)) n++;
  return n;
}

// Migrazione: aggiunge tipo='famiglia' alle arnie esistenti che non lo hanno
function migrateArniaTipi() {
  let changed = false;
  arnie.forEach(a => {
    if(!a.tipo) { a.tipo = 'famiglia'; changed = true; }
  });
  if(changed) saveDB();
}

// ===== GENEALOGIA: gestione telaini e regina =====

// Aggiorna visibilità della sezione genealogia in base al tipo arnia
function updateGenealogiaVisibility() {
  const tipo = document.getElementById('arniTipo')?.value || 'famiglia';
  const box = document.getElementById('arniGenealogiaBox');
  const sciameBox = document.getElementById('arniSciameBox');
  const telainiBox = document.getElementById('arniTelainiBox');
  const dataLabel = document.getElementById('arniDataCostLabel');
  const subtitle = document.getElementById('arniGenealogiaSubtitle');

  if(!box) return;

  // Famiglia: nascondi tutto il box genealogia
  if(tipo === 'famiglia') {
    box.style.display = 'none';
    return;
  }

  box.style.display = 'block';

  // Sciame: mostra box sciame, nascondi telaini, etichetta diversa per data
  if(tipo === 'sciame') {
    sciameBox.style.display = 'block';
    telainiBox.style.display = 'none';
    dataLabel.textContent = '📅 Data cattura';
    subtitle.textContent = '— Origine dello sciame';
  } else {
    sciameBox.style.display = 'none';
    telainiBox.style.display = 'block';
    dataLabel.textContent = '📅 Data costituzione';
    subtitle.textContent = (tipo === 'nucleo_fec') ? '— Tracciamento mini-arnia' : '— Tracciamento provenienza';
  }

  // Aggiorna le dropdown arnia di provenienza nei telaini
  refreshTelainiArniaDropdowns();
  // Aggiorna anche la dropdown regina-inserita
  populateReginaArniaSrc();
}

// Popola le tendine "Da arnia #X" per regina inserita
function populateReginaArniaSrc() {
  const sel = document.getElementById('arniReginaArniaSrc');
  if(!sel) return;
  const editId = document.getElementById('editArniId').value;
  const sorted = [...arnie].sort((a, b) => (parseInt(a.num,10)||0) - (parseInt(b.num,10)||0));
  const opts = sorted
    .filter(a => a.id !== editId) // non se stessa
    .map(a => `<option value="${a.id}">#${a.num}${a.nome ? ' — '+a.nome : ''}</option>`)
    .join('');
  const cur = sel.value;
  sel.innerHTML = '<option value="">— Seleziona —</option>' + opts;
  if(cur) sel.value = cur;
}

// Aggiunge un nuovo telaino vuoto e renderizza
function addTelaino() {
  editingTelaini.push({
    tipo: 'covata',
    arniaSrcId: '',
    note: ''
  });
  renderTelainiList();
}

// Rimuove un telaino dato l'indice
function removeTelaino(idx) {
  editingTelaini.splice(idx, 1);
  renderTelainiList();
}

// Aggiorna un campo del telaino
function updateTelaino(idx, field, val) {
  if(editingTelaini[idx]) editingTelaini[idx][field] = val;
}

// Renderizza la lista dei telaini nel modale
function renderTelainiList() {
  const cont = document.getElementById('telainiList');
  if(!cont) return;

  if(editingTelaini.length === 0) {
    cont.innerHTML = '<div style="color:var(--text-light);font-style:italic;font-size:0.85rem;padding:0.5rem 0">Nessun telaino. Aggiungi i telaini di partenza con la loro provenienza.</div>';
    return;
  }

  const editId = document.getElementById('editArniId').value;
  const sorted = [...arnie].sort((a, b) => (parseInt(a.num,10)||0) - (parseInt(b.num,10)||0));
  const arnieOpts = sorted
    .filter(a => a.id !== editId)
    .map(a => `<option value="${a.id}">#${a.num}${a.nome ? ' — '+a.nome : ''}</option>`)
    .join('');

  cont.innerHTML = editingTelaini.map((t, idx) => `
    <div style="background:white;padding:0.6rem 0.8rem;border-radius:4px;border:1px solid var(--cream-dark);display:grid;grid-template-columns:24px 1fr 1fr 1.3fr 28px;gap:0.5rem;align-items:center">
      <div style="font-family:'Playfair Display',serif;font-weight:700;color:var(--amber);text-align:center">${idx+1}</div>
      <select onchange="updateTelaino(${idx}, 'tipo', this.value)" style="padding:0.3rem 0.5rem;border:1px solid var(--cream-dark);border-radius:3px;font-family:inherit;font-size:0.85rem">
        ${Object.entries(TELAINO_TIPI).map(([k,v]) => `<option value="${k}" ${t.tipo===k?'selected':''}>${v.icon} ${v.label}</option>`).join('')}
      </select>
      <select onchange="updateTelaino(${idx}, 'arniaSrcId', this.value)" style="padding:0.3rem 0.5rem;border:1px solid var(--cream-dark);border-radius:3px;font-family:inherit;font-size:0.85rem">
        <option value="">— Origine? —</option>
        ${arnieOpts}
      </select>
      <input type="text" placeholder="Note (es. 5 dl covata opercolata)" value="${t.note || ''}" oninput="updateTelaino(${idx}, 'note', this.value)" style="padding:0.3rem 0.5rem;border:1px solid var(--cream-dark);border-radius:3px;font-family:inherit;font-size:0.85rem">
      <button type="button" onclick="removeTelaino(${idx})" style="background:transparent;border:none;color:var(--red);cursor:pointer;font-size:1.2rem;font-weight:700;padding:0">✕</button>
    </div>
  `).join('');
}

// Aggiorna le tendine dei telaini esistenti (quando cambi arnie)
function refreshTelainiArniaDropdowns() {
  renderTelainiList();
}

// Seleziona origine regina e mostra i campi appropriati
function selectReginaOrigine(val) {
  document.getElementById('arniReginaOrigine').value = val;
  document.querySelectorAll('.regina-opt-radio').forEach(el => {
    el.classList.toggle('selected', el.getAttribute('data-val') === val);
  });
  document.getElementById('reginaInseritaBox').style.display = (val === 'inserita') ? 'block' : 'none';
  document.getElementById('reginaAcquistataBox').style.display = (val === 'acquistata') ? 'block' : 'none';
  populateReginaArniaSrc();
  updateReginaDateInfo();
}

// Calcola e mostra date previste fecondazione
function updateReginaDateInfo() {
  const origine = document.getElementById('arniReginaOrigine')?.value;
  const dataCost = document.getElementById('arniDataCostituzione')?.value;
  const infoBox = document.getElementById('reginaDateInfoBox');
  if(!infoBox) return;
  if(!dataCost) { infoBox.style.display = 'none'; return; }

  const data = new Date(dataCost);
  if(isNaN(data.getTime())) { infoBox.style.display = 'none'; return; }

  let html = '';
  if(origine === 'allevata') {
    // 16 giorni nascita + 7 maturazione + 14-20 fecondazione = ~30-43 gg
    const sfarfallamento = new Date(data); sfarfallamento.setDate(sfarfallamento.getDate() + 16);
    const fecondazione = new Date(data); fecondazione.setDate(fecondazione.getDate() + 30);
    const primaOvodepos = new Date(data); primaOvodepos.setDate(primaOvodepos.getDate() + 38);
    html = `
      <strong>⏳ Date previste (regina allevata sul posto):</strong><br>
      • Sfarfallamento regina: ~${fmtDate(sfarfallamento)}<br>
      • Voli di fecondazione: ~${fmtDate(fecondazione)}<br>
      • Prima deposizione: ~${fmtDate(primaOvodepos)} <em>(primo controllo consigliato)</em>
    `;
  } else if(origine === 'inserita') {
    const accettazione = new Date(data); accettazione.setDate(accettazione.getDate() + 5);
    const primoControl = new Date(data); primoControl.setDate(primoControl.getDate() + 10);
    html = `
      <strong>⏳ Date previste (regina inserita):</strong><br>
      • Verifica accettazione: ~${fmtDate(accettazione)}<br>
      • Primo controllo deposizione: ~${fmtDate(primoControl)}
    `;
  } else if(origine === 'acquistata') {
    const accettazione = new Date(data); accettazione.setDate(accettazione.getDate() + 5);
    const primoControl = new Date(data); primoControl.setDate(primoControl.getDate() + 10);
    html = `
      <strong>⏳ Date previste (regina acquistata):</strong><br>
      • Verifica accettazione: ~${fmtDate(accettazione)}<br>
      • Primo controllo deposizione: ~${fmtDate(primoControl)}
    `;
  }

  infoBox.style.display = 'block';
  infoBox.innerHTML = html;
}

// Helper formattazione data
function fmtDate(d) {
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ===== SCIAME: check evoluzione alla prima visita =====
function askSciameEvolution(arniaId) {
  const a = arnie.find(x => x.id === arniaId);
  if(!a || a.tipo !== 'sciame') return;

  // Crea un mini-modal inline (overlay)
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.id = 'sciameEvolutionModal';
  overlay.style.zIndex = '10000';
  overlay.innerHTML = `
    <div class="modal" style="max-width:500px">
      <h3 style="color:var(--green);margin-bottom:0.5rem">🐝 Come è evoluto lo sciame?</h3>
      <p style="color:var(--text-light);font-size:0.92rem;margin-bottom:1rem">
        Hai appena registrato una visita per lo sciame <strong>#${a.num}${a.nome ? ' — '+a.nome : ''}</strong>.
        Dopo la cattura del ${a.dataCostituzione ? formatDate(a.dataCostituzione) : '—'}, come si è sviluppato?
      </p>

      <div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1rem">
        <button class="btn btn-primary" onclick="evolveSciame('${arniaId}', 'famiglia')" style="text-align:left;padding:0.8rem 1rem">
          🏠 <strong>È diventato una Famiglia</strong>
          <div style="font-size:0.78rem;color:rgba(255,255,255,0.85);font-weight:400;margin-top:0.2rem">Sciame ben sviluppato (≥6 favi popolati), regina che depone bene</div>
        </button>
        <button class="btn btn-secondary" onclick="evolveSciame('${arniaId}', 'nucleo')" style="text-align:left;padding:0.8rem 1rem">
          🍯 <strong>È diventato un Nucleo</strong>
          <div style="font-size:0.78rem;color:var(--text-light);font-weight:400;margin-top:0.2rem">Sciame in sviluppo (3-5 favi), da rinforzare nella stagione</div>
        </button>
        <button class="btn btn-secondary" onclick="evolveSciame('${arniaId}', 'sciame')" style="text-align:left;padding:0.8rem 1rem">
          🐝 <strong>Ancora da valutare</strong>
          <div style="font-size:0.78rem;color:var(--text-light);font-weight:400;margin-top:0.2rem">Lascialo come "sciame" per ora, chiederò di nuovo alla prossima visita</div>
        </button>
        <button class="btn btn-danger" onclick="evolveSciame('${arniaId}', 'perso')" style="text-align:left;padding:0.8rem 1rem">
          ❌ <strong>Lo sciame è andato perso</strong>
          <div style="font-size:0.78rem;color:rgba(255,255,255,0.85);font-weight:400;margin-top:0.2rem">Ha lasciato l'arnia o è morto — segna come dismesso</div>
        </button>
      </div>

      <div style="text-align:center;font-size:0.85rem;color:var(--text-light)">
        <a href="javascript:void(0)" onclick="closeSciameEvolution()" style="color:var(--text-light)">Decido più tardi</a>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function closeSciameEvolution() {
  const m = document.getElementById('sciameEvolutionModal');
  if(m) m.remove();
}

function evolveSciame(arniaId, newTipo) {
  const a = arnie.find(x => x.id === arniaId);
  if(!a) return;

  if(newTipo === 'perso') {
    a.status = 'problema';
    a.annoDismissione = new Date().getFullYear();
    a.sciameNeedsEvolutionCheck = false;
    a.note = (a.note ? a.note + '\n' : '') + `Sciame andato perso (${new Date().toLocaleDateString('it-IT')})`;
  } else if(newTipo === 'sciame') {
    // Lascia tipo sciame ma flag già "chiesto", reschedulato per prossima visita
    a.sciameNeedsEvolutionCheck = true;
  } else {
    // Promuove a famiglia o nucleo
    a.tipo = newTipo;
    a.sciameNeedsEvolutionCheck = false;
    a.note = (a.note ? a.note + '\n' : '') + `Promosso da sciame a ${newTipo === 'famiglia' ? 'famiglia' : 'nucleo'} (${new Date().toLocaleDateString('it-IT')})`;
  }
  saveDB();
  closeSciameEvolution();
  renderArnie();

  // Feedback all'utente
  const msg = {
    famiglia: '✅ Sciame promosso a Famiglia',
    nucleo:   '✅ Sciame promosso a Nucleo',
    sciame:   '⏳ Decisione rimandata alla prossima visita',
    perso:    '❌ Sciame segnato come perso'
  }[newTipo];
  if(typeof alert !== 'undefined') alert(msg);
}

function renderArnie() {
  // Migrazione automatica al primo render
  migrateArniaTipi();

  const grid = document.getElementById('arnieGrid');
  if(arnie.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><span class="big">🏠</span>Nessuna arnia registrata.<br>Aggiungi la tua prima arnia!</div>`;
    return;
  }

  // Ordina per numero crescente
  const sorted = [...arnie].sort((a, b) => (parseInt(a.num,10)||0) - (parseInt(b.num,10)||0));

  grid.innerHTML = sorted.map(a => {
    const statusLabel = {attiva:'Attiva',debole:'Debole',problema:'Problema',invernata:'Invernata'}[a.status];
    const melariAttivi = (a.melari||[]).filter(m=>m.status==='posizionato').length;
    const tipoInfo = ARNIA_TIPI[a.tipo] || ARNIA_TIPI.famiglia;
    return `
    <div class="arnia-card ${tipoInfo.cls}">
      <div class="arnia-card-head">
        <div class="arnia-num">${tipoInfo.icon} #${a.num}</div>
        <span class="arnia-tipo-badge badge-${a.tipo || 'famiglia'}">${tipoInfo.short}</span>
      </div>
      <div class="arnia-name">${a.nome || '—'}</div>
      <span class="arnia-status status-${a.status}">${statusLabel}</span>
      <div class="arnia-info">
        ${a.razza ? `🐝 <em>${a.razza}</em><br>` : ''}
        ${a.reginaAnno ? `👑 Regina: ${a.reginaAnno}<br>` : ''}
        ${melariAttivi ? `🍯 Melari attivi: <strong>${melariAttivi}</strong><br>` : ''}
        ${a.temperamento ? `😊 ${a.temperamento}` : ''}
      </div>
      <div class="arnia-actions" style="margin-top:0.8rem">
        <button class="btn btn-secondary" style="padding:0.4rem 0.8rem;font-size:0.82rem" onclick="openDetail('${a.id}')">🔍 Dettaglio</button>
        <button class="btn btn-secondary" style="padding:0.4rem 0.8rem;font-size:0.82rem" onclick="openArniModal('${a.id}')">✏️</button>
        <button class="btn btn-danger" style="padding:0.4rem 0.8rem;font-size:0.82rem" onclick="deleteArnia('${a.id}')">🗑</button>
      </div>
    </div>`;
  }).join('');
}

function renderModalMelari() {
  const list = document.getElementById('melariList');
  if(editingMelari.length === 0) {
    list.innerHTML = '<div style="color:var(--text-light);font-style:italic;font-size:0.9rem">Nessun melario registrato.</div>';
    return;
  }
  const statusLabel = {posizionato:'In produzione', rimosso:'Rimosso', produzione:'Smielato'};
  list.innerHTML = editingMelari.map((m,i) => `
    <div class="melario-item" id="melItem-${i}" style="flex-direction:column;align-items:stretch;gap:0.5rem">
      <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap">
        <span style="font-size:1.1rem">🍯</span>
        <span class="mel-info"><strong>${m.num} telaini</strong>${m.note?' — '+m.note:''}</span>
        <span class="mel-date">${m.data ? formatDate(m.data) : '—'}</span>
        <span class="mel-status mel-${m.status}">${statusLabel[m.status]||m.status}</span>
        <div style="margin-left:auto;display:flex;gap:0.3rem">
          <button class="btn-icon" onclick="openMelEdit(${i})" title="Modifica">✏️</button>
          <button class="btn-icon del" onclick="removeMelario(${i})" title="Rimuovi">✕</button>
        </div>
      </div>
      <div id="melEditForm-${i}" style="display:none;background:white;border:1px solid var(--cream-dark);border-radius:4px;padding:0.8rem;margin-top:0.2rem">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.6rem;margin-bottom:0.6rem">
          <div>
            <label style="display:block;font-size:0.78rem;font-weight:600;color:var(--text-light);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.2rem">N° telaini</label>
            <input type="number" id="melEditNum-${i}" value="${m.num}" min="1" max="12" style="width:100%;padding:0.4rem 0.6rem;border:1px solid var(--cream-dark);border-radius:3px;font-family:'Crimson Pro',serif;font-size:0.95rem;background:var(--cream)">
          </div>
          <div>
            <label style="display:block;font-size:0.78rem;font-weight:600;color:var(--text-light);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.2rem">Data</label>
            <input type="date" id="melEditData-${i}" value="${m.data||''}" style="width:100%;padding:0.4rem 0.6rem;border:1px solid var(--cream-dark);border-radius:3px;font-family:'Crimson Pro',serif;font-size:0.95rem;background:var(--cream)">
          </div>
          <div>
            <label style="display:block;font-size:0.78rem;font-weight:600;color:var(--text-light);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.2rem">Stato</label>
            <select id="melEditStatus-${i}" style="width:100%;padding:0.4rem 0.6rem;border:1px solid var(--cream-dark);border-radius:3px;font-family:'Crimson Pro',serif;font-size:0.95rem;background:var(--cream)">
              <option value="posizionato" ${m.status==='posizionato'?'selected':''}>In produzione</option>
              <option value="rimosso" ${m.status==='rimosso'?'selected':''}>Rimosso</option>
              <option value="produzione" ${m.status==='produzione'?'selected':''}>Smielato</option>
            </select>
          </div>
        </div>
        <div style="margin-bottom:0.6rem">
          <label style="display:block;font-size:0.78rem;font-weight:600;color:var(--text-light);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.2rem">Note</label>
          <input type="text" id="melEditNote-${i}" value="${m.note||''}" placeholder="Es. acacia, 8 telaini opercolati..." style="width:100%;padding:0.4rem 0.6rem;border:1px solid var(--cream-dark);border-radius:3px;font-family:'Crimson Pro',serif;font-size:0.95rem;background:var(--cream)">
        </div>
        <div style="display:flex;gap:0.5rem;justify-content:flex-end">
          <button class="btn btn-secondary" style="padding:0.35rem 0.8rem;font-size:0.85rem" onclick="closeMelEdit(${i})">Annulla</button>
          <button class="btn" style="padding:0.35rem 0.8rem;font-size:0.85rem" onclick="saveMelEdit(${i})">💾 Salva</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openMelEdit(i) {
  // Close any other open edit forms
  editingMelari.forEach((_,j) => {
    const f = document.getElementById(`melEditForm-${j}`);
    if(f) f.style.display = 'none';
  });
  const form = document.getElementById(`melEditForm-${i}`);
  if(form) form.style.display = 'block';
}

function closeMelEdit(i) {
  const form = document.getElementById(`melEditForm-${i}`);
  if(form) form.style.display = 'none';
}

function saveMelEdit(i) {
  const num = document.getElementById(`melEditNum-${i}`).value;
  if(!num) { alert('Inserisci il numero di telaini'); return; }
  editingMelari[i] = {
    ...editingMelari[i],
    num,
    data: document.getElementById(`melEditData-${i}`).value,
    status: document.getElementById(`melEditStatus-${i}`).value,
    note: document.getElementById(`melEditNote-${i}`).value.trim()
  };
  renderModalMelari();
}

function addMelario() {
  const num = document.getElementById('melNum').value;
  if(!num) { alert('Inserisci il numero di telaini'); return; }
  editingMelari.push({
    num, data: document.getElementById('melData').value,
    status: document.getElementById('melStatus').value,
    note: document.getElementById('melNote').value.trim(),
    id: Date.now().toString()
  });
  document.getElementById('melNum').value = '';
  document.getElementById('melNote').value = '';
  renderModalMelari();
}

function removeMelario(i) {
  editingMelari.splice(i,1);
  renderModalMelari();
}

function openArniModal(id) {
  const modal = document.getElementById('arniModal');
  if(id) {
    const a = arnie.find(x => x.id === id);
    document.getElementById('arniModalTitle').textContent = '✏️ Modifica Arnia';
    document.getElementById('editArniId').value = id;
    document.getElementById('arniNum').value = a.num;
    if(document.getElementById('arniTipo')) document.getElementById('arniTipo').value = a.tipo || 'famiglia';
    document.getElementById('arniNome').value = a.nome || '';
    document.getElementById('arniStatus').value = a.status;
    document.getElementById('arniReginaAnno').value = a.reginaAnno || '';
    document.getElementById('arniNote').value = a.note || '';
    document.getElementById('arniRazza').value = a.razza || '';
    document.getElementById('arniRazzaOrigine').value = a.razzaOrigine || '';
    document.getElementById('arniTemperamento').value = a.temperamento || '';
    document.getElementById('arniSciamatura').value = a.sciamatura || '';
    document.getElementById('arniProduttivita').value = a.produttivita || '';
    document.getElementById('arniRazzaNote').value = a.razzaNote || '';
    document.getElementById('arniAnnoIntroduzione').value = a.annoIntroduzione || '';
    document.getElementById('arniAnnoDismissione').value = a.annoDismissione || '';
    editingMelari = JSON.parse(JSON.stringify(a.melari || []));
    // Genealogia
    editingTelaini = JSON.parse(JSON.stringify(a.telainiOrigine || []));
    document.getElementById('arniDataCostituzione').value = a.dataCostituzione || '';
    document.getElementById('arniSciameDim').value = a.sciameDim || '';
    document.getElementById('arniSciameLuogo').value = a.sciameLuogo || '';
    selectReginaOrigine(a.reginaOrigine || 'allevata');
    if(a.reginaArniaSrc) document.getElementById('arniReginaArniaSrc').value = a.reginaArniaSrc;
    if(a.reginaFornitore) document.getElementById('arniReginaFornitore').value = a.reginaFornitore;
  } else {
    document.getElementById('arniModalTitle').textContent = '🏠 Nuova Arnia';
    document.getElementById('editArniId').value = '';
    document.getElementById('arniNum').value = nextArniaNumber();
    if(document.getElementById('arniTipo')) document.getElementById('arniTipo').value = 'famiglia';
    document.getElementById('arniNome').value = '';
    document.getElementById('arniStatus').value = 'attiva';
    document.getElementById('arniReginaAnno').value = '';
    document.getElementById('arniNote').value = '';
    document.getElementById('arniRazza').value = '';
    document.getElementById('arniRazzaOrigine').value = '';
    document.getElementById('arniTemperamento').value = '';
    document.getElementById('arniSciamatura').value = '';
    document.getElementById('arniProduttivita').value = '';
    document.getElementById('arniRazzaNote').value = '';
    document.getElementById('arniAnnoIntroduzione').value = '';
    document.getElementById('arniAnnoDismissione').value = '';
    editingMelari = [];
    editingTelaini = [];
    // Genealogia: defaults
    document.getElementById('arniDataCostituzione').value = new Date().toISOString().slice(0,10);
    document.getElementById('arniSciameDim').value = '';
    document.getElementById('arniSciameLuogo').value = '';
    document.getElementById('arniReginaFornitore').value = '';
    selectReginaOrigine('allevata');
  }
  document.getElementById('melData').value = new Date().toISOString().slice(0,10);
  renderModalMelari();
  // Aggiorna sezione genealogia visibilità e contenuto
  updateGenealogiaVisibility();
  renderTelainiList();
  updateReginaDateInfo();
  modal.classList.add('open');
}
function closeArniModal() { document.getElementById('arniModal').classList.remove('open'); }

function saveArnia() {
  const editId = document.getElementById('editArniId').value;

  // Numero: se editing manteniamo quello esistente; se nuovo arnia, auto-assegnato
  let num;
  if(editId) {
    const existing = arnie.find(a => a.id === editId);
    num = existing ? existing.num : nextArniaNumber();
  } else {
    num = nextArniaNumber();
  }

  const data = {
    id: editId || Date.now().toString(),
    num: String(num),
    tipo: document.getElementById('arniTipo')?.value || 'famiglia',
    nome: document.getElementById('arniNome').value.trim(),
    status: document.getElementById('arniStatus').value,
    reginaAnno: document.getElementById('arniReginaAnno').value,
    note: document.getElementById('arniNote').value.trim(),
    razza: document.getElementById('arniRazza').value,
    razzaOrigine: document.getElementById('arniRazzaOrigine').value.trim(),
    temperamento: document.getElementById('arniTemperamento').value,
    sciamatura: document.getElementById('arniSciamatura').value,
    produttivita: document.getElementById('arniProduttivita').value,
    razzaNote: document.getElementById('arniRazzaNote').value.trim(),
    annoIntroduzione: parseInt(document.getElementById('arniAnnoIntroduzione').value, 10) || null,
    annoDismissione:  parseInt(document.getElementById('arniAnnoDismissione').value, 10)  || null,
    melari: editingMelari,
    // ===== GENEALOGIA =====
    telainiOrigine: editingTelaini,
    dataCostituzione: document.getElementById('arniDataCostituzione')?.value || '',
    reginaOrigine: document.getElementById('arniReginaOrigine')?.value || 'allevata',
    reginaArniaSrc: document.getElementById('arniReginaArniaSrc')?.value || '',
    reginaFornitore: document.getElementById('arniReginaFornitore')?.value.trim() || '',
    sciameDim: document.getElementById('arniSciameDim')?.value || '',
    sciameLuogo: document.getElementById('arniSciameLuogo')?.value.trim() || '',
    // Flag per check evoluzione sciame alla prima visita successiva
    sciameNeedsEvolutionCheck: (document.getElementById('arniTipo')?.value === 'sciame')
      ? (editId ? arnie.find(a => a.id === editId)?.sciameNeedsEvolutionCheck ?? true : true)
      : false,
  };
  if(editId) {
    arnie = arnie.map(a => a.id === editId ? { ...a, ...data } : a);
  } else {
    arnie.push(data);
  }
  saveDB();
  closeArniModal();
  renderArnie();
}

function deleteArnia(id) {
  if(!confirm('Eliminare questa arnia?')) return;
  arnie = arnie.filter(a => a.id !== id);
  saveDB();
  renderArnie();
}

// ======= DETAIL PANEL =======
function openDetail(id) {
  const a = arnie.find(x => x.id === id);
  if(!a) return;
  document.getElementById('detailTitle').textContent = `#${a.num}${a.nome?' — '+a.nome:''}`;
  const statusLabel = {attiva:'✅ Attiva e forte',debole:'⚠️ Debole',problema:'❌ Problema',invernata:'❄️ Invernata'}[a.status];
  const melariAttivi = (a.melari||[]).filter(m=>m.status==='posizionato');
  const melariTotali = (a.melari||[]).length;
  const logArnia = logBook.filter(e=>e.arniaId===id).slice(0,5);
  const statusLabel2 = {posizionato:'In produzione', rimosso:'Rimosso', produzione:'Smielato'};

  // Trova ultima ispezione con dati
  const ultimaIspezione = logBook.filter(e => {
    const tipi = getTipi(e);
    return e.arniaId === id && tipi.includes('ispezione') && e.ispezione;
  })[0];

  document.getElementById('detailBody').innerHTML = `
    <div class="detail-section">
      <h4>🏠 Informazioni generali</h4>
      <div class="detail-row"><span class="detail-label">Stato</span><span class="detail-value">${statusLabel}</span></div>
      ${a.reginaAnno?`<div class="detail-row"><span class="detail-label">Anno regina</span><span class="detail-value">${a.reginaAnno}</span></div>`:''}
      ${a.note?`<div class="detail-row"><span class="detail-label">Note</span><span class="detail-value" style="max-width:60%;text-align:right">${a.note}</span></div>`:''}
    </div>

    ${ultimaIspezione ? `<div class="detail-section">
      <h4>🔍 Ultima ispezione <span style="font-weight:400;font-size:0.82rem;font-style:italic;color:var(--text-light)">${formatDate(ultimaIspezione.data)}</span></h4>
      ${ultimaIspezione.ispezione.telaini ? `<div class="detail-row"><span class="detail-label">📏 Sviluppo famiglia</span><span class="detail-value"><strong>${ultimaIspezione.ispezione.telaini} telaini</strong></span></div>` : ''}
      ${ultimaIspezione.ispezione.covata ? `<div class="detail-row"><span class="detail-label">🟤 Covata</span><span class="detail-value">${ultimaIspezione.ispezione.covata}/5</span></div>` : ''}
      ${ultimaIspezione.ispezione.scorte ? `<div class="detail-row"><span class="detail-label">🟡 Scorte</span><span class="detail-value">${ultimaIspezione.ispezione.scorte}/5</span></div>` : ''}
      ${ultimaIspezione.ispezione.celleReali !== undefined && ultimaIspezione.ispezione.celleReali !== '' ? `<div class="detail-row"><span class="detail-label">👑 Celle reali</span><span class="detail-value">${CELLE_REALI_LABEL[ultimaIspezione.ispezione.celleReali]||ultimaIspezione.ispezione.celleReali}</span></div>` : ''}
      ${ultimaIspezione.ispezione.mappa && ultimaIspezione.ispezione.mappa.length ? renderTelainiVisual(ultimaIspezione.ispezione.mappa) : ''}
    </div>` : ''}

    ${a.razza ? `<div class="detail-section">
      <h4>🐝 Razza & caratteristiche</h4>
      <div class="detail-row"><span class="detail-label">Razza</span><span class="detail-value"><span class="razza-badge">${a.razza}</span></span></div>
      ${a.razzaOrigine?`<div class="detail-row"><span class="detail-label">Provenienza</span><span class="detail-value">${a.razzaOrigine}</span></div>`:''}
      ${a.temperamento?`<div class="detail-row"><span class="detail-label">Temperamento</span><span class="detail-value">${a.temperamento}</span></div>`:''}
      ${a.sciamatura?`<div class="detail-row"><span class="detail-label">Tendenza sciamatura</span><span class="detail-value">${a.sciamatura}</span></div>`:''}
      ${a.produttivita?`<div class="detail-row"><span class="detail-label">Produttività</span><span class="detail-value">${a.produttivita}</span></div>`:''}
      ${a.razzaNote?`<div class="detail-row"><span class="detail-label">Note razza</span><span class="detail-value" style="max-width:60%;text-align:right">${a.razzaNote}</span></div>`:''}
    </div>` : ''}

    <div class="detail-section">
      <h4>🍯 Melari (${melariTotali} totali, ${melariAttivi.length} attivi)</h4>
      ${melariTotali === 0 ? '<div style="color:var(--text-light);font-style:italic;font-size:0.9rem">Nessun melario registrato.</div>' :
        (a.melari||[]).map(m=>`
        <div class="melario-item" style="margin-bottom:0.4rem">
          <span>🍯</span>
          <span class="mel-info"><strong>${m.num} telaini</strong>${m.note?' — '+m.note:''}</span>
          <span class="mel-date">${m.data?formatDate(m.data):'—'}</span>
          <span class="mel-status mel-${m.status}">${statusLabel2[m.status]||m.status}</span>
        </div>`).join('')
      }
    </div>

    <div class="detail-section">
      <h4>📖 Ultime registrazioni</h4>
      ${logArnia.length === 0 ? '<div style="color:var(--text-light);font-style:italic;font-size:0.9rem">Nessuna registrazione per questa arnia.</div>' :
        logArnia.map(e=>`<div style="padding:0.5rem 0;border-bottom:1px dotted var(--cream-dark);font-size:0.92rem">
          <span style="color:var(--text-light);font-style:italic">${formatDate(e.data)}</span> — ${e.note.substring(0,80)}${e.note.length>80?'...':''}
        </div>`).join('')
      }
    </div>

    <div style="display:flex;gap:0.6rem;flex-wrap:wrap">
      <button class="btn" onclick="closeDetail();openArniModal('${id}')">✏️ Modifica</button>
    </div>
  `;
  document.getElementById('detailPanel').classList.add('open');
  document.getElementById('detailOverlay').style.display = 'block';
}
function closeDetail() {
  document.getElementById('detailPanel').classList.remove('open');
  document.getElementById('detailOverlay').style.display = 'none';
}

