// ======= ISPEZIONE =======
// (TELAINO_OPZIONI, CELLE_REALI_LABEL e renderTelainiVisual sono ora in shared.js)

function precompilaDaUltimaIspezione() {
  const arniaId = document.getElementById('logArnia').value;
  if(!arniaId) return;

  const ultimaIsp = findUltimaIspezione(arniaId);
  if(!ultimaIsp) return;

  const isp = ultimaIsp.ispezione;
  if(isp.covata)     document.getElementById('ispCovata').value     = isp.covata;
  if(isp.scorte)     document.getElementById('ispScorte').value     = isp.scorte;
  if(isp.celleReali !== undefined && isp.celleReali !== '')
                     document.getElementById('ispCelleReali').value = isp.celleReali;
  if(isp.telaini) {
    document.getElementById('ispTelaini').value = isp.telaini;
    renderTelainiMapForm();
    if(isp.mappa && isp.mappa.length) {
      isp.mappa.forEach((tipo, i) => {
        const sel = document.getElementById(`telainoVal_${i}`);
        if(sel) sel.value = tipo;
      });
    }
  }
  showImportToast(`📋 Precompilato da ultima ispezione del ${formatDate(ultimaIsp.data)}`);
}

function toggleIspezioneFields() {
  const tipi = Array.from(document.querySelectorAll('#logTipo input:checked')).map(x => x.value);
  const showIsp = tipi.includes('ispezione');
  const showRac = tipi.includes('produzione');
  const showTrat = tipi.includes('trattamento');
  const elIsp = document.getElementById('ispezioneFields');
  const elRac = document.getElementById('raccoltaFields');
  const elTrat = document.getElementById('trattamentoFields');
  if(elIsp) {
    elIsp.style.display = showIsp ? 'block' : 'none';
    if(showIsp) {
      precompilaDaUltimaIspezione();
    }
    if(!showIsp) {
      document.getElementById('ispCovata').value = '';
      document.getElementById('ispScorte').value = '';
      document.getElementById('ispCelleReali').value = '';
      document.getElementById('ispTelaini').value = '';
      document.getElementById('telainiMapForm').innerHTML = '';
    }
  }
  if(elRac) {
    elRac.style.display = showRac ? 'block' : 'none';
    if(showRac && document.getElementById('raccoltaRighe').children.length === 0) {
      addRaccoltaRiga();
    }
    if(!showRac) {
      document.getElementById('raccoltaRighe').innerHTML = '';
    }
  }
  if(elTrat) {
    elTrat.style.display = showTrat ? 'block' : 'none';
    if(!showTrat) {
      document.getElementById('trattProdotto').value = '';
      document.getElementById('trattDosaggio').value = '';
    }
  }
}

let raccoltaRigheCount = 0;

function addRaccoltaRiga() {
  const prodotti = articoli.filter(a => a.categoria === 'prodotto');
  if(prodotti.length === 0) {
    alert('Nessun articolo di categoria "Prodotto finito" nel magazzino. Aggiungine uno prima.');
    return;
  }
  const idx = raccoltaRigheCount++;
  const div = document.createElement('div');
  div.id = `raccoltaRiga_${idx}`;
  div.style.cssText = 'display:grid;grid-template-columns:1fr auto auto;gap:0.5rem;align-items:end;margin-bottom:0.5rem';
  div.innerHTML = `
    <div>
      <select id="raccoltaArt_${idx}" onchange="raccoltaArtChange(${idx})" style="width:100%;padding:0.5rem 0.7rem;border:1px solid var(--cream-dark);border-radius:3px;font-family:'Crimson Pro',serif;font-size:0.95rem;background:white">
        <option value="">— Seleziona prodotto —</option>
        ${prodotti.map(a=>`<option value="${a.id}" data-unita="${a.unita}">${a.nome}</option>`).join('')}
      </select>
    </div>
    <div style="display:flex;align-items:center;gap:0.3rem">
      <input type="number" id="raccoltaQta_${idx}" min="0" step="0.1" placeholder="Qtà" style="width:80px;padding:0.5rem 0.5rem;border:1px solid var(--cream-dark);border-radius:3px;font-family:'Crimson Pro',serif;font-size:0.95rem;background:white">
      <span id="raccoltaUnita_${idx}" style="font-size:0.82rem;color:var(--text-light);min-width:24px">—</span>
    </div>
    <button type="button" onclick="removeRaccoltaRiga(${idx})" class="btn-icon del" style="margin-bottom:0">✕</button>
  `;
  document.getElementById('raccoltaRighe').appendChild(div);
}

function raccoltaArtChange(idx) {
  const sel = document.getElementById(`raccoltaArt_${idx}`);
  const opt = sel.options[sel.selectedIndex];
  document.getElementById(`raccoltaUnita_${idx}`).textContent = opt?.dataset?.unita || '—';
}

function removeRaccoltaRiga(idx) {
  const el = document.getElementById(`raccoltaRiga_${idx}`);
  if(el) el.remove();
}

function getRaccoltaData() {
  const righe = document.getElementById('raccoltaRighe').querySelectorAll('[id^="raccoltaRiga_"]');
  const result = [];
  righe.forEach(riga => {
    const idx = riga.id.split('_')[1];
    const artId = document.getElementById(`raccoltaArt_${idx}`)?.value;
    const qta = parseFloat(document.getElementById(`raccoltaQta_${idx}`)?.value);
    if(artId && qta > 0) result.push({ articoloId: artId, qta });
  });
  return result;
}

function renderTelainiMapForm() {
  const n = parseInt(document.getElementById('ispTelaini').value, 10) || 0;
  const container = document.getElementById('telainiMapForm');
  if(!n) { container.innerHTML = ''; return; }
  container.innerHTML = `<div class="telaini-map-form">` +
    Array.from({length: n}, (_, i) => `
      <div class="telaino-form-item">
        <label>T${i+1}</label>
        <select id="telainoVal_${i}">
          ${TELAINO_OPZIONI.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}
        </select>
      </div>`).join('') +
    `</div>`;
}

function getTelainiData() {
  const n = parseInt(document.getElementById('ispTelaini').value, 10) || 0;
  if(!n) return null;
  return Array.from({length: n}, (_, i) => {
    const sel = document.getElementById(`telainoVal_${i}`);
    return sel ? sel.value : '';
  });
}

function renderTelainiVisual(mappa) {
  // Alias per shared.js renderTelainiVisualHTML
  return renderTelainiVisualHTML(mappa);
}

// ======= REGISTRO =======
function updateArniSelects() {
  const selects = ['logArnia','filterArnia'];
  selects.forEach(sid => {
    const sel = document.getElementById(sid);
    if(!sel) return;
    const defaultOpt = sid === 'logArnia'
      ? '<option value="">— Seleziona arnia —</option>'
      : '<option value="">Tutte le arnie</option>';
    sel.innerHTML = defaultOpt + arnie.map(a => `<option value="${a.id}">#${a.num}${a.nome?' – '+a.nome:''}</option>`).join('');
  });
}

function addLogEntry() {
  const data = document.getElementById('logData').value;
  const note = document.getElementById('logNote').value.trim();
  if(!data || !note) { alert('Compila almeno la data e le note'); return; }
  const tipi = Array.from(document.querySelectorAll('#logTipo input:checked')).map(x => x.value);
  if(tipi.length === 0) { alert('Seleziona almeno un tipo di intervento'); return; }

  // Arnia obbligatoria
  const arniaId = document.getElementById('logArnia').value;
  if(!arniaId) { alert('Seleziona un\'arnia — è obbligatoria'); return; }
  const arniaObj = arnie.find(a => a.id === arniaId);

  // Dati ispezione
  let ispezioneData = null;
  if(tipi.includes('ispezione')) {
    ispezioneData = {
      covata:     document.getElementById('ispCovata').value,
      scorte:     document.getElementById('ispScorte').value,
      celleReali: document.getElementById('ispCelleReali').value,
      telaini:    parseInt(document.getElementById('ispTelaini').value, 10) || null,
      mappa:      getTelainiData()
    };
  }

  // Dati raccolta
  let raccoltaData = null;
  if(tipi.includes('produzione')) {
    const righe = getRaccoltaData();
    if(righe.length === 0) { alert('Aggiungi almeno un prodotto nella sezione Raccolta'); return; }
    raccoltaData = righe;
  }

  // Dati trattamento
  let trattamentoData = null;
  if(tipi.includes('trattamento')) {
    const prodotto = document.getElementById('trattProdotto').value;
    const dosaggio = document.getElementById('trattDosaggio').value;
    if(prodotto || dosaggio) {
      trattamentoData = { prodotto, dosaggio };
    }
  }

  const entry = {
    id: Date.now().toString(), data,
    arniaId, arniaNome: arniaObj ? `#${arniaObj.num}${arniaObj.nome?' – '+arniaObj.nome:''}` : '—',
    tipo: tipi, note,
    varroa: document.getElementById('logVarroa').value,
    ispezione: ispezioneData,
    raccolta: raccoltaData,
    trattamento: trattamentoData
  };
  logBook.unshift(entry);
  saveDB();

  // Movimenti automatici magazzino per raccolta
  if(raccoltaData && raccoltaData.length > 0) {
    const annoVisita = data.slice(0, 4);
    raccoltaData.forEach(r => {
      movimentazioni.push({
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        data, articoloId: r.articoloId,
        tipo: 'entrata', qta: r.qta,
        note: `Da visita ${arniaObj ? '#'+arniaObj.num : ''} del ${formatDate(data)}`
      });
      // Aggiorna produzione per arnia e anno
      if(arniaObj) {
        const art = articoli.find(a => a.id === r.articoloId);
        if(!arniaObj.produzionePerAnno) arniaObj.produzionePerAnno = {};
        if(!arniaObj.produzionePerAnno[annoVisita]) arniaObj.produzionePerAnno[annoVisita] = {};
        const nomeArt = art ? art.nome : r.articoloId;
        arniaObj.produzionePerAnno[annoVisita][nomeArt] =
          (arniaObj.produzionePerAnno[annoVisita][nomeArt] || 0) + r.qta;
        arnie = arnie.map(a => a.id === arniaId ? arniaObj : a);
      }
    });
    saveMagazzino();
    saveDB();
  }

  // Reset form
  document.getElementById('logNote').value = '';
  document.getElementById('logVarroa').value = '';
  document.getElementById('logArnia').value = '';
  document.querySelectorAll('#logTipo input').forEach(x => x.checked = false);
  document.getElementById('ispCovata').value = '';
  document.getElementById('ispScorte').value = '';
  document.getElementById('ispCelleReali').value = '';
  document.getElementById('ispTelaini').value = '';
  document.getElementById('telainiMapForm').innerHTML = '';
  document.getElementById('ispezioneFields').style.display = 'none';
  document.getElementById('raccoltaFields').style.display = 'none';
  document.getElementById('raccoltaRighe').innerHTML = '';
  document.getElementById('trattamentoFields').style.display = 'none';
  document.getElementById('trattProdotto').value = '';
  document.getElementById('trattDosaggio').value = '';
  raccoltaRigheCount = 0;

  renderLog();
  renderStats();
  showImportToast('✅ Visita salvata' + (raccoltaData ? ` · ${raccoltaData.length} prodotti caricati a magazzino` : ''));

  // Proponi di schedulare la prossima visita
  const arniaLabel = arniaObj ? `#${arniaObj.num}${arniaObj.nome?' — '+arniaObj.nome:''}` : '';
  setTimeout(() => showCalendarPopup(arniaLabel), 400);
}

function deleteLog(id) {
  if(!confirm('Eliminare questa registrazione?')) return;
  logBook = logBook.filter(e => e.id !== id);
  saveDB();
  renderLog();
  renderStats();
}

function renderLog() {
  const search = (document.getElementById('filterSearch')?.value||'').toLowerCase();
  const tipo = document.getElementById('filterTipo')?.value||'';
  const arniaF = document.getElementById('filterArnia')?.value||'';
  let filtered = logBook.filter(e => {
    if(tipo && !getTipi(e).includes(tipo)) return false;
    if(arniaF && e.arniaId !== arniaF) return false;
    if(search && !e.note.toLowerCase().includes(search) && !e.arniaNome.toLowerCase().includes(search)) return false;
    return true;
  });
  const tipoLabel = {ispezione:'Ispezione',trattamento:'Trattamento',nutrizione:'Nutrizione',produzione:'Produzione',salute:'Salute',altro:'Altro'};
  const tipoEmoji = {ispezione:'🔍',trattamento:'💊',nutrizione:'🍬',produzione:'🍯',salute:'⚕️',altro:'📌'};
  // Map per lookup veloce articoli — evita N find() in loop
  const artMap = new Map(articoli.map(a => [a.id, a]));
  const container = document.getElementById('logEntries');
  if(filtered.length === 0) {
    container.innerHTML = `<div class="empty-state"><span class="big">📖</span>Nessuna registrazione trovata.</div>`;
    return;
  }
  container.innerHTML = filtered.map(e => {
    const tipi = getTipi(e);
    const firstTipo = tipi[0] || 'altro';
    return `
    <div class="log-entry tipo-${firstTipo}">
      <div class="log-entry-header">
        <div class="log-entry-meta">
          <span class="log-date">📅 ${formatDate(e.data)}</span>
          <span class="tag tag-arnia">🏠 ${e.arniaNome}</span>
          ${tipi.map(t => `<span class="tag tag-tipo ${t}">${tipoEmoji[t]||''} ${tipoLabel[t]||t}</span>`).join('')}
        </div>
        <div class="log-actions">
          <button class="btn-icon del" onclick="deleteLog('${e.id}')" title="Elimina">🗑</button>
        </div>
      </div>
      <div class="log-entry-note">${e.note}</div>
      ${e.varroa ? `<div class="log-entry-extra">
        <span>🕷 Varroa: <strong>${e.varroa} cadute/giorno</strong></span>
      </div>` : ''}
      ${e.trattamento && (e.trattamento.prodotto || e.trattamento.dosaggio) ? `<div class="log-entry-extra">
        <span>💊 Trattamento: <strong>${({varromed:'🌿 VarroMed',apibioxal:'❄️ Api-Bioxal',altro:'📌 Altro'}[e.trattamento.prodotto]||e.trattamento.prodotto||'—')}</strong>${e.trattamento.dosaggio?` · ${e.trattamento.dosaggio}`:''}</span>
      </div>` : ''}
      ${e.raccolta && e.raccolta.length ? `<div class="log-entry-extra" style="flex-wrap:wrap">
        ${e.raccolta.map(r => {
          const art = artMap.get(r.articoloId);
          return `<span>🍯 <strong>${r.qta} ${art?.unita||''}</strong> ${art?.nome||'(prodotto eliminato)'}</span>`;
        }).join('')}
      </div>` : ''}
      ${e.ispezione && (e.ispezione.covata || e.ispezione.scorte || e.ispezione.celleReali !== '' || e.ispezione.telaini) ? `
        <div class="log-entry-extra" style="margin-top:0.4rem;flex-wrap:wrap">
          ${e.ispezione.covata ? `<span>🟤 Covata: <strong>${e.ispezione.covata}/5</strong></span>` : ''}
          ${e.ispezione.scorte ? `<span>🟡 Scorte: <strong>${e.ispezione.scorte}/5</strong></span>` : ''}
          ${e.ispezione.celleReali !== undefined && e.ispezione.celleReali !== '' ? `<span>👑 Celle reali: <strong>${CELLE_REALI_LABEL[e.ispezione.celleReali]||e.ispezione.celleReali}</strong></span>` : ''}
          ${e.ispezione.telaini ? `<span>📏 Famiglia: <strong>${e.ispezione.telaini} telaini</strong></span>` : ''}
        </div>
        ${e.ispezione.mappa && e.ispezione.mappa.length ? renderTelainiVisual(e.ispezione.mappa) : ''}
      ` : ''}
    </div>`;
  }).join('');
}

function renderStats() {
  // Calcola miele dalla fonte unica di verità: getMieleStats() in state.js
  const totalMiele = getMieleStats().totale;
  const totalTrattamenti = logBook.filter(e => getTipi(e).includes('trattamento')).length;
  const giorniVisita = countGiorniVisita();
  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card"><div class="stat-number">${arnie.length}</div><div class="stat-label">Arnie registrate</div></div>
    <div class="stat-card"><div class="stat-number">${logBook.length}</div><div class="stat-label">Registrazioni totali</div></div>
    <div class="stat-card"><div class="stat-number">${giorniVisita}</div><div class="stat-label">Giorni visita</div></div>
    <div class="stat-card"><div class="stat-number">${totalTrattamenti}</div><div class="stat-label">Trattamenti</div></div>
    <div class="stat-card"><div class="stat-number">${totalMiele.toFixed(1)}</div><div class="stat-label">Kg miele raccolti</div></div>
  `;
  // Quick stats
  const last5 = logBook.slice(0,5);
  const qs = document.getElementById('quickStats');
  if(last5.length === 0) { qs.innerHTML = '<em>Nessuna registrazione ancora.</em>'; return; }
  qs.innerHTML = '<strong>Ultime attività:</strong><br>' + last5.map(e =>
    `• ${formatDate(e.data)} — ${e.arniaNome}: ${e.note.substring(0,50)}${e.note.length>50?'...':''}`
  ).join('<br>');
}

function exportCSV() {
  if(logBook.length === 0) { alert('Nessun dato da esportare'); return; }
  const headers = ['Data','Arnia','Tipo','Note','Varroa (cadute/g)','Raccolta'];
  const artMap = new Map(articoli.map(a => [a.id, a]));
  const rows = logBook.map(e => {
    const tipi = getTipi(e).join(', ');
    const raccoltaStr = (e.raccolta || []).map(r => {
      const art = artMap.get(r.articoloId);
      return `${r.qta} ${art?.unita||''} ${art?.nome||''}`;
    }).join(' + ');
    return [e.data, e.arniaNome, tipi, `"${e.note.replace(/"/g,'""')}"`, e.varroa||'', `"${raccoltaStr}"`];
  });
  const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `registro_apiario_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

