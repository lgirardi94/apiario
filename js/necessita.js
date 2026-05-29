// ===== FILE VERSION: 2026-05-28.4 · necessita.js =====
/* ===========================================================
   NECESSITÀ — Lista articoli da ordinare
   =========================================================== */

const NEC_PRIORITA = {
  urgente: { label: 'Urgente', color: '#C04B3B', icon: '🔴', order: 0 },
  alta:    { label: 'Alta',    color: '#E89488', icon: '🟠', order: 1 },
  media:   { label: 'Media',   color: '#C8860A', icon: '🟡', order: 2 },
  bassa:   { label: 'Bassa',   color: '#9CA3AF', icon: '⚪', order: 3 },
};

const NEC_STATO = {
  da_ordinare: { label: 'Da ordinare', icon: '📝', color: '#C8860A' },
  ordinato:    { label: 'Ordinato',    icon: '🚚', color: '#5D8C44' },
};

// ============================================
// HELPER: ottieni voci attive (non ricevute)
// ============================================
function getNecessitaAttive() {
  return necessita.filter(n => n.stato !== 'ricevuto');
}

// ============================================
// RENDER LISTA
// ============================================
function renderNecessita() {
  try {
    const container = document.getElementById('necessitaList');
    if(!container) {
      console.warn('[Necessita] necessitaList non trovato nel DOM');
      return;
    }

    // Popola filtro fornitori
    const fornitori = [...new Set(necessita.map(n => n.fornitore).filter(Boolean))].sort();
    const haSenzaFornitore = getNecessitaAttive().some(n => !n.fornitore);
    const filtroFornitoreEl = document.getElementById('necFiltroFornitore');
    if(filtroFornitoreEl) {
      const currentVal = filtroFornitoreEl.value;
      filtroFornitoreEl.innerHTML = '<option value="">Tutti i fornitori</option>' +
        fornitori.map(f => `<option value="${escapeHtmlAttr(f)}">${escapeHtmlAttr(f)}</option>`).join('') +
        (haSenzaFornitore ? '<option value="__nessuno__">(senza fornitore)</option>' : '');
      filtroFornitoreEl.value = currentVal;
    }

    // Filtri
    const filtroStato = document.getElementById('necFiltroStato')?.value || '';
    const filtroPriorita = document.getElementById('necFiltroPriorita')?.value || '';
    const filtroFornitore = document.getElementById('necFiltroFornitore')?.value || '';
    const raggruppa = document.getElementById('necRaggruppa')?.value || 'priorita';

    let filtered = getNecessitaAttive();
    if(filtroStato) filtered = filtered.filter(n => n.stato === filtroStato);
    if(filtroPriorita) filtered = filtered.filter(n => n.priorita === filtroPriorita);
    if(filtroFornitore === '__nessuno__') filtered = filtered.filter(n => !n.fornitore);
    else if(filtroFornitore) filtered = filtered.filter(n => n.fornitore === filtroFornitore);

    // Counter
    const counterEl = document.getElementById('necessitaCounter');
    if(counterEl) {
      counterEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'voce' : 'voci'} · ${getNecessitaAttive().length} totali`;
    }

    if(filtered.length === 0) {
      container.innerHTML = '<div class="empty-state"><span class="big">🛒</span>Nessuna necessità in lista.<br>Aggiungi articoli da ordinare per tenerne traccia.</div>';
      return;
    }

    // Raggruppamento
    let groups = [];
    if(raggruppa === 'none') {
      groups = [{ label: '', items: filtered }];
    } else if(raggruppa === 'priorita') {
      const grouped = {};
      filtered.forEach(n => {
        const k = n.priorita || 'media';
        if(!grouped[k]) grouped[k] = [];
        grouped[k].push(n);
      });
      groups = Object.entries(grouped)
        .sort((a, b) => (NEC_PRIORITA[a[0]]?.order ?? 4) - (NEC_PRIORITA[b[0]]?.order ?? 4))
        .map(([k, items]) => ({
          label: `${NEC_PRIORITA[k]?.icon || ''} Priorità ${NEC_PRIORITA[k]?.label || k}`,
          color: NEC_PRIORITA[k]?.color,
          items
        }));
    } else if(raggruppa === 'fornitore') {
      const grouped = {};
      filtered.forEach(n => {
        const k = n.fornitore || '(senza fornitore)';
        if(!grouped[k]) grouped[k] = [];
        grouped[k].push(n);
      });
      groups = Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]))
        .map(([k, items]) => ({ label: `🏪 ${k}`, items, fornitoreKey: k }));
    } else if(raggruppa === 'data') {
      const oggi = new Date();
      const grouped = { scaduti: [], settimana: [], mese: [], futuri: [], nessuna: [] };
      filtered.forEach(n => {
        if(!n.dataPrevista) { grouped.nessuna.push(n); return; }
        const dp = new Date(n.dataPrevista);
        const giorni = (dp - oggi) / (1000*60*60*24);
        if(giorni < 0) grouped.scaduti.push(n);
        else if(giorni <= 7) grouped.settimana.push(n);
        else if(giorni <= 30) grouped.mese.push(n);
        else grouped.futuri.push(n);
      });
      const labels = {
        scaduti: '⚠️ Data scaduta',
        settimana: '🔥 Entro 7 giorni',
        mese: '📅 Entro 30 giorni',
        futuri: '🗓️ Più avanti',
        nessuna: '📭 Senza data'
      };
      groups = ['scaduti','settimana','mese','futuri','nessuna']
        .filter(k => grouped[k].length > 0)
        .map(k => ({ label: labels[k], items: grouped[k] }));
    }

    const hintFornitore = (raggruppa === 'fornitore')
      ? `<div style="background:var(--amber-pale);border-radius:6px;padding:0.5rem 0.8rem;margin-bottom:0.8rem;font-size:0.82rem;color:var(--brown)">💡 Premi <strong>📦 Ricevi ordine</strong> accanto a un fornitore per ricevere tutti i suoi articoli insieme, con spedizione unica.</div>`
      : '';

    container.innerHTML = hintFornitore + groups.map(g => {
      const ricBtn = g.fornitoreKey
        ? `<button class="btn btn-secondary" style="padding:0.3rem 0.7rem;font-size:0.8rem;white-space:nowrap" onclick="apriRicezioneFornitore('${encodeURIComponent(g.fornitoreKey)}')">📦 Ricevi ordine</button>`
        : '';
      const header = g.label
        ? `<div style="display:flex;justify-content:space-between;align-items:center;gap:0.6rem;margin:1.2rem 0 0.6rem;border-bottom:1px solid var(--cream-dark);padding-bottom:0.4rem">
             <h4 style="font-family:'Playfair Display',serif;color:${g.color || 'var(--brown)'};margin:0;font-size:1rem">${g.label} <span style="font-size:0.78rem;color:var(--text-light);font-weight:400">(${g.items.length})</span></h4>
             ${ricBtn}
           </div>`
        : '';
      return header + g.items.map(n => renderNecessitaCard(n)).join('');
    }).join('');
  } catch(err) {
    console.error('[Necessita] Errore in renderNecessita:', err.message);
  }
}

function renderNecessitaCard(n) {
  const prInfo = NEC_PRIORITA[n.priorita] || NEC_PRIORITA.media;
  const stInfo = NEC_STATO[n.stato] || NEC_STATO.da_ordinare;

  // Determina articolo collegato
  const art = n.articoloId ? articoli.find(a => a.id === n.articoloId) : null;
  const descrizione = art ? art.nome : (n.descrizione || 'Articolo');
  const unita = n.unita || (art && art.unita) || '';

  // Calcolo giacenza attuale se collegato
  const giacenzaInfo = art && typeof getGiacenzaLocale === 'function'
    ? `<span style="font-size:0.78rem;color:var(--text-light);font-style:italic">Giacenza attuale: ${getGiacenzaLocale(art.id)} ${art.unita || ''}</span>`
    : '';

  // Giorni mancanti
  let dataInfo = '';
  if(n.dataPrevista) {
    const dp = new Date(n.dataPrevista);
    const oggi = new Date();
    const giorni = Math.floor((dp - oggi) / (1000*60*60*24));
    let colore = 'var(--text-light)';
    let label = '';
    if(giorni < 0) { colore = 'var(--red)'; label = `(scaduta da ${Math.abs(giorni)} gg)`; }
    else if(giorni === 0) { colore = 'var(--red)'; label = '(oggi)'; }
    else if(giorni <= 7) { colore = 'var(--amber)'; label = `(tra ${giorni} gg)`; }
    else label = `(tra ${giorni} gg)`;
    dataInfo = `<span style="font-size:0.78rem;color:${colore}">📅 ${formatDate(n.dataPrevista)} ${label}</span>`;
  }

  const isOrdinato = n.stato === 'ordinato';

  return `
    <div class="necessita-card" style="background:white;border:1px solid var(--cream-dark);border-left:4px solid ${prInfo.color};border-radius:6px;padding:0.8rem 1rem;margin-bottom:0.6rem;${isOrdinato ? 'opacity:0.85' : ''}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.8rem;flex-wrap:wrap">
        <div style="flex:1;min-width:200px">
          <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.3rem">
            <span style="font-size:1.05rem;font-weight:600;color:var(--brown)">${escapeHtmlAttr(descrizione)}</span>
            <span style="background:${prInfo.color}22;color:${prInfo.color};padding:1px 7px;border-radius:9px;font-size:0.72rem;font-weight:700;text-transform:uppercase">${prInfo.icon} ${prInfo.label}</span>
            <span style="background:${stInfo.color}22;color:${stInfo.color};padding:1px 7px;border-radius:9px;font-size:0.72rem;font-weight:700">${stInfo.icon} ${stInfo.label}</span>
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:0.4rem 1rem;font-size:0.88rem;color:var(--text);margin-bottom:0.3rem">
            <span><strong>${n.quantita || '?'}</strong> ${escapeHtmlAttr(unita)}</span>
            ${n.fornitore ? `<span style="color:var(--text-light)">🏪 ${escapeHtmlAttr(n.fornitore)}</span>` : ''}
            ${n.prezzoStimato ? `<span style="color:var(--text-light)">💰 € ${parseFloat(n.prezzoStimato).toFixed(2)}${(parseFloat(n.prezzoStimato)>0 && parseFloat(n.quantita)>0) ? ` <span style="opacity:0.7">(€ ${(parseFloat(n.prezzoStimato)/parseFloat(n.quantita)).toFixed(2)}/${escapeHtmlAttr(unita)})</span>` : ''}</span>` : ''}
            ${dataInfo}
          </div>

          ${giacenzaInfo ? `<div style="margin-bottom:0.3rem">${giacenzaInfo}</div>` : ''}
          ${n.note ? `<div style="font-size:0.85rem;color:var(--text-light);font-style:italic">${escapeHtmlAttr(n.note)}</div>` : ''}
          ${isOrdinato && n.dataOrdine ? `<div style="font-size:0.78rem;color:var(--green);margin-top:0.3rem">🚚 Ordinato il ${formatDate(n.dataOrdine)}</div>` : ''}
        </div>

        <div style="display:flex;gap:0.3rem;flex-wrap:wrap">
          ${n.stato === 'da_ordinare' ? `<button class="btn btn-secondary" style="padding:0.3rem 0.7rem;font-size:0.78rem" onclick="marcaNecessitaOrdinata('${n.id}')" title="Segna come ordinato">🚚 Ordinato</button>` : ''}
          ${n.stato === 'ordinato' ? `<button class="btn btn-secondary" style="padding:0.3rem 0.7rem;font-size:0.78rem;border-color:var(--text-light);color:var(--text-light)" onclick="annullaOrdineNecessita('${n.id}')" title="Riporta a da ordinare">↶</button>` : ''}
          <button class="btn btn-primary" style="padding:0.3rem 0.7rem;font-size:0.78rem;background:var(--green)" onclick="marcaNecessitaRicevuta('${n.id}')" title="Marca come ricevuta">✅ Ricevuta</button>
          <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.78rem" onclick="openNecessitaModal('${n.id}')">✏️</button>
          <button class="btn btn-danger" style="padding:0.3rem 0.6rem;font-size:0.78rem" onclick="deleteNecessita('${n.id}')">🗑</button>
        </div>
      </div>
    </div>
  `;
}

// Helper escape HTML attributes
function escapeHtmlAttr(s) {
  if(!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ============================================
// MODALE: APRI / CHIUDI / SALVA
// ============================================
function openNecessitaModal(id) {
  try {
    const modal = document.getElementById('necessitaModal');
    if(!modal) {
      console.error('[Necessita] necessitaModal non trovato nel DOM');
      return;
    }

    // Popola dropdown articoli
    const selArticolo = document.getElementById('necArticoloId');
    if(selArticolo) {
      const articoliSorted = [...articoli].sort((a,b) => a.nome.localeCompare(b.nome));
      selArticolo.innerHTML = '<option value="">— Articolo nuovo (scrivi sotto) —</option>' +
        articoliSorted.map(a => `<option value="${a.id}">${escapeHtmlAttr(a.nome)} ${a.unita ? '('+a.unita+')' : ''}</option>`).join('');
    }

    // Popola lista fornitori
    const fornitoriUsati = [...new Set(necessita.map(n => n.fornitore).filter(Boolean))].sort();
    const dlFornitori = document.getElementById('necFornitoreList');
    if(dlFornitori) {
      dlFornitori.innerHTML = fornitoriUsati.map(f => `<option value="${escapeHtmlAttr(f)}">`).join('');
    }

    if(id) {
      const n = necessita.find(x => x.id === id);
      if(!n) {
        console.warn('[Necessita] Necessità non trovata:', id);
        return;
      }
      document.getElementById('necessitaModalTitle').textContent = '✏️ Modifica necessità';
      document.getElementById('editNecessitaId').value = id;
      if(selArticolo) selArticolo.value = n.articoloId || '';
      document.getElementById('necDescrizioneCustom').value = n.descrizione || '';
      document.getElementById('necQuantita').value = n.quantita || '';
      document.getElementById('necUnita').value = n.unita || '';
      document.getElementById('necFornitore').value = n.fornitore || '';
      document.getElementById('necPriorita').value = n.priorita || 'media';
      document.getElementById('necDataPrevista').value = n.dataPrevista || '';
      document.getElementById('necPrezzoStimato').value = n.prezzoStimato || '';
      const spedEl = document.getElementById('necSpedizione');
      if(spedEl) spedEl.value = n.spedizione || '';
      document.getElementById('necNote').value = n.note || '';
    } else {
      document.getElementById('necessitaModalTitle').textContent = '🛒 Nuova necessità';
      document.getElementById('editNecessitaId').value = '';
      if(selArticolo) selArticolo.value = '';
      document.getElementById('necDescrizioneCustom').value = '';
      document.getElementById('necQuantita').value = '';
      document.getElementById('necUnita').value = '';
      document.getElementById('necFornitore').value = '';
      document.getElementById('necPriorita').value = 'media';
      document.getElementById('necDataPrevista').value = '';
      document.getElementById('necPrezzoStimato').value = '';
      const spedEl2 = document.getElementById('necSpedizione');
      if(spedEl2) spedEl2.value = '';
      document.getElementById('necNote').value = '';
    }

    onNecArticoloChange();
    modal.classList.add('open');
  } catch(err) {
    console.error('[Necessita] Errore in openNecessitaModal:', err.message);
  }
}

function closeNecessitaModal() {
  const modal = document.getElementById('necessitaModal');
  if(modal) modal.classList.remove('open');
}

// Quando seleziono un articolo dalla dropdown, popolo unità automaticamente
function onNecArticoloChange() {
  const artId = document.getElementById('necArticoloId')?.value;
  if(!artId) return;
  const art = articoli.find(a => a.id === artId);
  if(art) {
    const unitaEl = document.getElementById('necUnita');
    if(unitaEl && !unitaEl.value) unitaEl.value = art.unita || '';
    const descrEl = document.getElementById('necDescrizioneCustom');
    if(descrEl) descrEl.value = ''; // svuota descrizione custom se collego articolo
  }
}

function saveNecessitaEntry() {
  try {
    const editId = document.getElementById('editNecessitaId').value;
    const articoloId = document.getElementById('necArticoloId').value || null;
    const descrizioneCustom = document.getElementById('necDescrizioneCustom').value.trim();
    const quantita = parseFloat(document.getElementById('necQuantita').value);
    const unita = document.getElementById('necUnita').value.trim();
    const fornitore = document.getElementById('necFornitore').value.trim();
    const priorita = document.getElementById('necPriorita').value;
    const dataPrevista = document.getElementById('necDataPrevista').value;
    const prezzoStimato = parseFloat(document.getElementById('necPrezzoStimato').value) || null;
    const spedizione = parseFloat(document.getElementById('necSpedizione')?.value) || null;
    const note = document.getElementById('necNote').value.trim();

    // Validazione
    if(!articoloId && !descrizioneCustom) {
      alert('Seleziona un articolo o scrivi una descrizione');
      return;
    }
    if(!quantita || quantita <= 0) {
      alert('Inserisci una quantità valida');
      return;
    }

    let finalArticoloId = articoloId;
    let finalDescrizione = descrizioneCustom;

    // Se ho descrizione custom ma nessun articolo collegato, creo l'articolo nel magazzino
    if(!articoloId && descrizioneCustom) {
      const newArt = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        nome: descrizioneCustom,
        categoria: 'altro',
        unita: unita || 'pz',
        scadenza: '',
        lotto: '',
        soglia: '',
        prezzoUnitario: '',
        note: ''
      };
      articoli.push(newArt);
      saveMagazzino();
      finalArticoloId = newArt.id;
      finalDescrizione = ''; // ora abbiamo l'articolo, non serve descrizione
      console.log('[Necessita] Creato nuovo articolo nel magazzino:', newArt.nome);
    }

    const existing = editId ? necessita.find(x => x.id === editId) : null;
    const entry = {
      id: editId || (Date.now().toString() + Math.random().toString(36).slice(2)),
      articoloId: finalArticoloId,
      descrizione: finalDescrizione,
      quantita,
      unita,
      fornitore,
      priorita,
      dataPrevista,
      prezzoStimato,
      spedizione,
      note,
      stato: existing?.stato || 'da_ordinare',
      dataCreazione: existing?.dataCreazione || new Date().toISOString().slice(0,10),
      dataOrdine: existing?.dataOrdine || null,
    };

    if(editId) {
      necessita = necessita.map(n => n.id === editId ? entry : n);
    } else {
      necessita.push(entry);
    }
    saveNecessita();
    closeNecessitaModal();
    renderNecessita();
    if(typeof renderHome === 'function') renderHome();
    if(typeof renderMagArticoli === 'function') renderMagArticoli();
  } catch(err) {
    console.error('[Necessita] Errore in saveNecessitaEntry:', err.message);
    alert('Errore nel salvataggio. Apri F12 per dettagli.');
  }
}

// ============================================
// CAMBIAMENTI STATO
// ============================================
function marcaNecessitaOrdinata(id) {
  const n = necessita.find(x => x.id === id);
  if(!n) { console.warn('[Necessita] Necessità non trovata:', id); return; }
  n.stato = 'ordinato';
  n.dataOrdine = new Date().toISOString().slice(0,10);
  saveNecessita();
  renderNecessita();
}

function annullaOrdineNecessita(id) {
  const n = necessita.find(x => x.id === id);
  if(!n) return;
  n.stato = 'da_ordinare';
  n.dataOrdine = null;
  saveNecessita();
  renderNecessita();
}

function marcaNecessitaRicevuta(id) {
  try {
    const n = necessita.find(x => x.id === id);
    if(!n) { console.warn('[Necessita] Necessità non trovata:', id); return; }

    const art = n.articoloId ? articoli.find(a => a.id === n.articoloId) : null;
    const prezzoTot = parseFloat(n.prezzoStimato) || 0;
    const spedizione = parseFloat(n.spedizione) || 0;
    const qta = parseFloat(n.quantita) || 0;
    const prezzoUnit = (prezzoTot > 0 && qta > 0) ? (prezzoTot / qta) : 0;
    const dataOggi = new Date().toISOString().slice(0,10);

    // Messaggio di conferma
    let msg = `Confermi di aver ricevuto:\n\n${art ? art.nome : n.descrizione}\nQuantità: ${n.quantita} ${n.unita || ''}`;
    if(prezzoTot > 0) {
      msg += `\nMerce: € ${prezzoTot.toFixed(2)}`;
      if(prezzoUnit > 0) msg += ` (€ ${prezzoUnit.toFixed(2)}/${n.unita || 'unità'})`;
    }
    if(spedizione > 0) msg += `\nSpedizione: € ${spedizione.toFixed(2)}`;
    if(art) {
      msg += `\n\n✅ Caricato a magazzino`;
      if(prezzoUnit > 0) msg += `\n💰 Prezzo unitario → € ${prezzoUnit.toFixed(2)}`;
    }
    if(prezzoTot > 0 || spedizione > 0) {
      msg += `\n📒 Registrato in contabilità come spesa`;
    }
    if(!art && prezzoTot === 0 && spedizione === 0) {
      msg += `\n\nLa voce verrà rimossa dalla lista.`;
    }

    if(!confirm(msg)) return;

    // Se collegata a un articolo: carica a magazzino + aggiorna prezzo unitario
    if(art) {
      const movId = Date.now().toString() + Math.random().toString(36).slice(2);
      movimentazioni.push({
        id: movId,
        articoloId: art.id,
        tipo: 'entrata',
        qta: qta,
        data: dataOggi,
        note: `Carico da ordine ricevuto${n.fornitore ? ' · '+n.fornitore : ''}${prezzoTot > 0 ? ' · € '+prezzoTot.toFixed(2) : ''}`,
        valore: prezzoTot > 0 ? prezzoTot : undefined,
      });
      if(prezzoUnit > 0) {
        articoli = articoli.map(a => a.id === art.id ? { ...a, prezzoUnitario: prezzoUnit.toFixed(4) } : a);
        console.log('[Necessita] Prezzo unitario aggiornato per', art.nome, '→ €', prezzoUnit.toFixed(4));
      }
      saveMagazzino();
    }

    // ===== AUTO-SPESA IN CONTABILITÀ =====
    const descrArticolo = art ? art.nome : (n.descrizione || 'Articolo');
    // Categoria spesa dedotta dalla categoria magazzino dell'articolo
    let catSpesa = 'altro_costo';
    if(art && typeof getCatSpesaPerMagazzino === 'function') {
      const c = getCatSpesaPerMagazzino(normalizzaCatMagazzino(art.categoria));
      if(c) catSpesa = c;
    }

    if(prezzoTot > 0) {
      movimentiContabili.unshift({
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        data: dataOggi,
        tipo: 'uscita',
        importo: prezzoTot,
        categorie: [catSpesa],
        descrizione: `${descrArticolo}${n.fornitore ? ' · '+n.fornitore : ''} (${qta} ${n.unita||''})`,
        origine: 'ordine',          // tag movimento auto-generato
        origineId: id,
      });
    }
    if(spedizione > 0) {
      movimentiContabili.unshift({
        id: Date.now().toString() + Math.random().toString(36).slice(2) + 's',
        data: dataOggi,
        tipo: 'uscita',
        importo: spedizione,
        categorie: ['spedizioni'],
        descrizione: `Spedizione ${descrArticolo}${n.fornitore ? ' · '+n.fornitore : ''}`,
        origine: 'ordine',
        origineId: id,
      });
    }
    if(prezzoTot > 0 || spedizione > 0) {
      if(typeof saveContabilita === 'function') saveContabilita();
      else if(typeof saveCont === 'function') saveCont();
    }

    // Rimuovi dalla lista (niente storico)
    necessita = necessita.filter(x => x.id !== id);
    saveNecessita();
    renderNecessita();
    if(typeof renderHome === 'function') renderHome();
    if(typeof renderMagArticoli === 'function') renderMagArticoli();
    if(typeof renderContRiepilogo === 'function') renderContRiepilogo();
    if(typeof showImportToast === 'function') {
      const parts = [];
      if(art) parts.push('caricato a magazzino');
      if(prezzoTot > 0 || spedizione > 0) parts.push('spesa registrata');
      showImportToast(`✅ ${descrArticolo}${parts.length?' · '+parts.join(' · '):''}`);
    }
  } catch(err) {
    console.error('[Necessita] Errore in marcaNecessitaRicevuta:', err.message);
    alert('Errore durante la ricezione. Apri F12 per dettagli.');
  }
}

// ===========================================================
// RICEZIONE ORDINE PER FORNITORE (multi-articolo + spedizione condivisa)
// ===========================================================
let _ricVociFornitore = [];      // snapshot delle voci in ricezione
let _ricFornitoreCorrente = null;

function apriRicezioneFornitore(fornitoreEnc) {
  try {
    const fornitore = decodeURIComponent(fornitoreEnc);
    _ricFornitoreCorrente = fornitore;

    // Raccogli le voci attive di questo fornitore
    const senzaForn = (fornitore === '(senza fornitore)');
    _ricVociFornitore = getNecessitaAttive().filter(n =>
      senzaForn ? !n.fornitore : (n.fornitore === fornitore)
    );

    if(_ricVociFornitore.length === 0) {
      alert('Nessuna voce da ricevere per questo fornitore.');
      return;
    }

    const titolo = document.getElementById('ricFornTitle');
    if(titolo) titolo.textContent = `📦 Ricevi ordine — ${fornitore}`;

    const cont = document.getElementById('ricFornRighe');
    if(cont) {
      cont.innerHTML = _ricVociFornitore.map((n, idx) => {
        const art = n.articoloId ? articoli.find(a => a.id === n.articoloId) : null;
        const nome = art ? art.nome : (n.descrizione || 'Articolo');
        const unita = n.unita || (art && art.unita) || '';
        const prezzo = parseFloat(n.prezzoStimato) || '';
        return `
          <div class="ric-riga" data-idx="${idx}" style="border:1px solid var(--cream-dark);border-radius:6px;padding:0.7rem 0.85rem">
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
              <input type="checkbox" id="ricChk_${idx}" checked onchange="updateRicFornTotale()" style="width:auto;margin:0">
              <label for="ricChk_${idx}" style="font-weight:600;color:var(--brown);font-size:0.92rem;cursor:pointer;flex:1">${escapeHtmlAttr(nome)}</label>
              <span style="font-size:0.78rem;color:var(--text-light)">ordinati: ${n.quantita} ${escapeHtmlAttr(unita)}</span>
            </div>
            <div style="display:flex;gap:0.6rem;flex-wrap:wrap">
              <div style="display:flex;align-items:center;gap:0.3rem">
                <label style="font-size:0.8rem;color:var(--text-light)">Ricevuti</label>
                <input type="number" id="ricQta_${idx}" value="${n.quantita}" min="0" step="0.01" style="width:80px" oninput="updateRicFornTotale()">
                <span style="font-size:0.8rem;color:var(--text-light)">${escapeHtmlAttr(unita)}</span>
              </div>
              <div style="display:flex;align-items:center;gap:0.3rem">
                <label style="font-size:0.8rem;color:var(--text-light)">Merce €</label>
                <input type="number" id="ricPrezzo_${idx}" value="${prezzo}" min="0" step="0.01" placeholder="0.00" style="width:90px" oninput="updateRicFornTotale()">
              </div>
            </div>
          </div>`;
      }).join('');
    }

    // Spedizione: somma eventuali spedizioni già presenti sulle voci (le accorpo)
    const spedTot = _ricVociFornitore.reduce((s, n) => s + (parseFloat(n.spedizione) || 0), 0);
    const spedEl = document.getElementById('ricFornSpedizione');
    if(spedEl) spedEl.value = spedTot > 0 ? spedTot.toFixed(2) : '';

    updateRicFornTotale();
    document.getElementById('ricezioneFornitoreModal').classList.add('open');
  } catch(err) {
    console.error('[Necessita] Errore in apriRicezioneFornitore:', err.message);
  }
}

function closeRicezioneFornitore() {
  const m = document.getElementById('ricezioneFornitoreModal');
  if(m) m.classList.remove('open');
  _ricVociFornitore = [];
  _ricFornitoreCorrente = null;
}

function updateRicFornTotale() {
  try {
    let merce = 0;
    _ricVociFornitore.forEach((n, idx) => {
      const chk = document.getElementById('ricChk_' + idx);
      if(!chk || !chk.checked) return;
      merce += parseFloat(document.getElementById('ricPrezzo_' + idx)?.value) || 0;
    });
    const spedizione = parseFloat(document.getElementById('ricFornSpedizione')?.value) || 0;
    const el = document.getElementById('ricFornTotale');
    if(el) el.textContent = '€ ' + (merce + spedizione).toFixed(2).replace('.', ',');
  } catch(err) {
    console.error('[Necessita] Errore in updateRicFornTotale:', err.message);
  }
}

function confermaRicezioneFornitore() {
  try {
    const spedizione = parseFloat(document.getElementById('ricFornSpedizione')?.value) || 0;
    const dataOggi = new Date().toISOString().slice(0,10);
    const fornitore = _ricFornitoreCorrente || '';

    let ricevutiCount = 0;
    const idDaRimuovere = [];

    _ricVociFornitore.forEach((n, idx) => {
      const chk = document.getElementById('ricChk_' + idx);
      if(!chk || !chk.checked) return; // escluso: resta invariato

      const qtaRic = parseFloat(document.getElementById('ricQta_' + idx)?.value) || 0;
      const prezzoMerce = parseFloat(document.getElementById('ricPrezzo_' + idx)?.value) || 0;
      if(qtaRic <= 0) return; // niente ricevuto su questa voce

      const qtaOrdinata = parseFloat(n.quantita) || 0;
      const art = n.articoloId ? articoli.find(a => a.id === n.articoloId) : null;
      const prezzoUnit = (prezzoMerce > 0 && qtaRic > 0) ? (prezzoMerce / qtaRic) : 0;
      const descr = art ? art.nome : (n.descrizione || 'Articolo');

      // 1. Carico magazzino + prezzo unitario
      if(art) {
        movimentazioni.push({
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          articoloId: art.id,
          tipo: 'entrata',
          qta: qtaRic,
          data: dataOggi,
          note: `Carico da ordine ricevuto${fornitore && fornitore !== '(senza fornitore)' ? ' · '+fornitore : ''}${prezzoMerce > 0 ? ' · € '+prezzoMerce.toFixed(2) : ''}`,
          valore: prezzoMerce > 0 ? prezzoMerce : undefined,
        });
        if(prezzoUnit > 0) {
          articoli = articoli.map(a => a.id === art.id ? { ...a, prezzoUnitario: prezzoUnit.toFixed(4) } : a);
        }
      }

      // 2. Spesa merce in contabilità (auto)
      if(prezzoMerce > 0) {
        let catSpesa = 'altro_costo';
        if(art && typeof getCatSpesaPerMagazzino === 'function') {
          const c = getCatSpesaPerMagazzino(normalizzaCatMagazzino(art.categoria));
          if(c) catSpesa = c;
        }
        movimentiContabili.unshift({
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          data: dataOggi,
          tipo: 'uscita',
          importo: prezzoMerce,
          categorie: [catSpesa],
          descrizione: `${descr}${fornitore && fornitore !== '(senza fornitore)' ? ' · '+fornitore : ''} (${qtaRic} ${n.unita||''})`,
          origine: 'ordine',
          origineId: n.id,
        });
      }

      ricevutiCount++;

      // 3. Gestione parziale: il mancante torna "da ordinare"
      const mancante = qtaOrdinata - qtaRic;
      if(mancante > 0) {
        n.quantita = mancante;
        n.stato = 'da_ordinare';
        n.prezzoStimato = prezzoUnit > 0 ? Number((prezzoUnit * mancante).toFixed(2)) : n.prezzoStimato;
        n.spedizione = null; // spedizione già pagata in questo ordine
        n.dataOrdine = null;
      } else {
        idDaRimuovere.push(n.id);
      }
    });

    if(ricevutiCount === 0) {
      alert('Nessun articolo selezionato per la ricezione. Spunta almeno una voce con quantità maggiore di zero.');
      return;
    }

    // 4. Spedizione: UNA sola spesa per tutto l'ordine
    if(spedizione > 0) {
      movimentiContabili.unshift({
        id: Date.now().toString() + Math.random().toString(36).slice(2) + 's',
        data: dataOggi,
        tipo: 'uscita',
        importo: spedizione,
        categorie: ['spedizioni'],
        descrizione: `Spedizione ordine${fornitore && fornitore !== '(senza fornitore)' ? ' · '+fornitore : ''}`,
        origine: 'ordine',
      });
    }

    // 5. Rimuovi le voci completamente ricevute
    necessita = necessita.filter(n => !idDaRimuovere.includes(n.id));

    // 6. Salvataggi + re-render
    saveMagazzino();
    if(typeof saveContabilita === 'function') saveContabilita();
    saveNecessita();
    closeRicezioneFornitore();
    renderNecessita();
    if(typeof renderHome === 'function') renderHome();
    if(typeof renderMagArticoli === 'function') renderMagArticoli();
    if(typeof renderContRiepilogo === 'function') renderContRiepilogo();
    if(typeof renderContMovimenti === 'function') renderContMovimenti();
    if(typeof showImportToast === 'function') {
      showImportToast(`✅ Ordine ricevuto: ${ricevutiCount} articol${ricevutiCount>1?'i':'o'}${spedizione>0?' + spedizione':''}`);
    }
  } catch(err) {
    console.error('[Necessita] Errore in confermaRicezioneFornitore:', err.message);
    alert('Errore durante la ricezione dell\'ordine: ' + err.message);
  }
}

function deleteNecessita(id) {
  if(!confirm('Eliminare questa voce dalla lista da ordinare?')) return;
  necessita = necessita.filter(n => n.id !== id);
  saveNecessita();
  renderNecessita();
  if(typeof renderHome === 'function') renderHome();
}

// ============================================
// COPIA LISTA NEGLI APPUNTI
// ============================================
function copiaListaNecessita() {
  try {
    const attive = getNecessitaAttive();
    if(attive.length === 0) {
      alert('Nessuna voce in lista da copiare.');
      return;
    }

    // Raggruppa per priorità
    const perPriorita = {};
    attive.forEach(n => {
      const k = n.priorita || 'media';
      if(!perPriorita[k]) perPriorita[k] = [];
      perPriorita[k].push(n);
    });

    let testo = `LISTA DA ORDINARE — ${new Date().toLocaleDateString('it-IT')}\n`;
    testo += '═'.repeat(50) + '\n\n';

    const ordine = ['urgente','alta','media','bassa'];
    ordine.forEach(p => {
      if(!perPriorita[p]) return;
      const items = perPriorita[p];
      const pInfo = NEC_PRIORITA[p];
      testo += `${pInfo.icon} ${pInfo.label.toUpperCase()}:\n`;
      items.forEach(n => {
        const art = n.articoloId ? articoli.find(a => a.id === n.articoloId) : null;
        const desc = art ? art.nome : (n.descrizione || 'Articolo');
        const stato = n.stato === 'ordinato' ? ' [ORDINATO]' : '';
        let linea = `  • ${n.quantita} ${n.unita || ''} — ${desc}${stato}`;
        if(n.fornitore) linea += ` [${n.fornitore}]`;
        if(n.dataPrevista) linea += ` entro ${formatDate(n.dataPrevista)}`;
        if(n.note) linea += `\n    Note: ${n.note}`;
        testo += linea + '\n';
      });
      testo += '\n';
    });

    // Totale stimato
    const totale = attive.reduce((s,n) => s + (parseFloat(n.prezzoStimato) || 0), 0);
    if(totale > 0) {
      testo += '─'.repeat(50) + '\n';
      testo += `TOTALE STIMATO: € ${totale.toFixed(2)}\n`;
    }

    // Copia negli appunti
    if(navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(testo).then(() => {
        if(typeof showImportToast === 'function') showImportToast('📋 Lista copiata negli appunti');
        else alert('📋 Lista copiata negli appunti!');
      }).catch(err => {
        console.error('[Necessita] Errore copia clipboard:', err);
        fallbackCopia(testo);
      });
    } else {
      fallbackCopia(testo);
    }
  } catch(err) {
    console.error('[Necessita] Errore in copiaListaNecessita:', err.message);
  }
}

function fallbackCopia(testo) {
  // Fallback per browser vecchi: textarea + selectAll
  const ta = document.createElement('textarea');
  ta.value = testo;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    if(typeof showImportToast === 'function') showImportToast('📋 Lista copiata negli appunti');
  } catch(e) {
    alert('Impossibile copiare automaticamente. Ecco il testo:\n\n' + testo);
  }
  document.body.removeChild(ta);
}

// ============================================
// HOOK MAGAZZINO: mostra info "ordini in corso" per articolo
// ============================================
function getNecessitaPerArticolo(articoloId) {
  return getNecessitaAttive().filter(n => n.articoloId === articoloId);
}
