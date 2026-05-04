// ======= ARNIE =======
let editingMelari = []; // temp melari list while modal is open

function renderArnie() {
  const grid = document.getElementById('arnieGrid');
  if(arnie.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><span class="big">🏠</span>Nessuna arnia registrata.<br>Aggiungi la tua prima arnia!</div>`;
    return;
  }
  grid.innerHTML = arnie.map(a => {
    const statusLabel = {attiva:'Attiva',debole:'Debole',problema:'Problema',invernata:'Invernata'}[a.status];
    const melariAttivi = (a.melari||[]).filter(m=>m.status==='posizionato').length;
    return `
    <div class="arnia-card">
      <div class="arnia-num">#${a.num}</div>
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
  } else {
    document.getElementById('arniModalTitle').textContent = '🏠 Nuova Arnia';
    document.getElementById('editArniId').value = '';
    document.getElementById('arniNum').value = '';
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
  }
  document.getElementById('melData').value = new Date().toISOString().slice(0,10);
  renderModalMelari();
  modal.classList.add('open');
}
function closeArniModal() { document.getElementById('arniModal').classList.remove('open'); }

function saveArnia() {
  const num = document.getElementById('arniNum').value.trim();
  if(!num) { alert('Inserisci un numero/codice per l\'arnia'); return; }
  const editId = document.getElementById('editArniId').value;
  const data = {
    id: editId || Date.now().toString(),
    num, nome: document.getElementById('arniNome').value.trim(),
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
    melari: editingMelari
  };
  if(editId) { arnie = arnie.map(a => a.id === editId ? data : a); }
  else { arnie.push(data); }
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

