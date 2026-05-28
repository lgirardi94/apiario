/* ===========================================================
   RICERCA GLOBALE — cerca in arnie, visite, articoli, ordini
   =========================================================== */

function ricercaEscapeHtml(s) {
  if(!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Evidenzia il termine cercato nel testo
function ricercaHighlight(testo, query) {
  if(!testo) return '';
  const safe = ricercaEscapeHtml(testo);
  if(!query) return safe;
  try {
    const q = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex
    const re = new RegExp('(' + q + ')', 'gi');
    return safe.replace(re, '<mark style="background:rgba(245,200,66,0.5);padding:0 1px;border-radius:2px">$1</mark>');
  } catch(e) {
    return safe;
  }
}

function runGlobalSearch() {
  try {
    const input = document.getElementById('globalSearch');
    const box = document.getElementById('globalSearchResults');
    if(!input || !box) return;

    const q = input.value.trim().toLowerCase();
    if(q.length < 2) {
      box.style.display = 'none';
      box.innerHTML = '';
      return;
    }

    const results = { arnie: [], visite: [], articoli: [], ordini: [] };

    // === ARNIE ===
    (arnie || []).forEach(a => {
      const hay = `${a.num} ${a.nome||''} ${a.razza||''} ${a.reginaAnno||''} ${a.notaLibera||''} ${(a.customTags||[]).join(' ')}`.toLowerCase();
      if(hay.includes(q)) results.arnie.push(a);
    });

    // === VISITE (logBook) ===
    (logBook || []).forEach(e => {
      const hay = `${e.arniaNome||''} ${e.note||''} ${(getTipi(e)||[]).join(' ')} ${e.trattamento?.prodotto||''}`.toLowerCase();
      if(hay.includes(q)) results.visite.push(e);
    });

    // === ARTICOLI MAGAZZINO ===
    (articoli || []).forEach(a => {
      const hay = `${a.nome||''} ${a.categoria||''} ${a.note||''} ${a.lotto||''}`.toLowerCase();
      if(hay.includes(q)) results.articoli.push(a);
    });

    // === ORDINI (necessità) ===
    if(typeof necessita !== 'undefined') {
      (necessita || []).filter(n => n.stato !== 'ricevuto').forEach(n => {
        const art = n.articoloId ? (articoli||[]).find(a => a.id === n.articoloId) : null;
        const desc = art ? art.nome : (n.descrizione || '');
        const hay = `${desc} ${n.fornitore||''} ${n.note||''}`.toLowerCase();
        if(hay.includes(q)) results.ordini.push({ ...n, _desc: desc });
      });
    }

    const totale = results.arnie.length + results.visite.length + results.articoli.length + results.ordini.length;

    if(totale === 0) {
      box.style.display = 'block';
      box.innerHTML = `<div style="padding:1.2rem;text-align:center;color:var(--text-light);font-style:italic">Nessun risultato per "${ricercaEscapeHtml(input.value.trim())}"</div>`;
      return;
    }

    let html = '';
    const origQuery = input.value.trim();

    // Sezione ARNIE
    if(results.arnie.length > 0) {
      html += ricercaSezioneHeader('🏠 Arnie', results.arnie.length);
      results.arnie.slice(0, 6).forEach(a => {
        const statusLabel = {attiva:'Attiva',debole:'Debole',problema:'Problema',invernata:'Invernata'}[a.status] || a.status || '';
        html += `
          <div class="ricerca-item" onclick="ricercaVaiArnia('${a.id}')" style="padding:0.6rem 1rem;cursor:pointer;border-bottom:1px solid var(--cream)">
            <div style="font-weight:600;color:var(--brown)">${ricercaHighlight('#'+a.num+(a.nome?' — '+a.nome:''), origQuery)}</div>
            <div style="font-size:0.8rem;color:var(--text-light)">${a.razza?ricercaHighlight(a.razza, origQuery)+' · ':''}${statusLabel}${a.reginaAnno?' · Regina '+a.reginaAnno:''}</div>
          </div>`;
      });
    }

    // Sezione VISITE
    if(results.visite.length > 0) {
      html += ricercaSezioneHeader('📖 Visite', results.visite.length);
      results.visite.slice(0, 6).forEach(e => {
        const notePreview = (e.note||'').slice(0, 70);
        html += `
          <div class="ricerca-item" onclick="ricercaVaiVisita()" style="padding:0.6rem 1rem;cursor:pointer;border-bottom:1px solid var(--cream)">
            <div style="font-weight:600;color:var(--brown);font-size:0.9rem">${ricercaHighlight(e.arniaNome||'—', origQuery)} <span style="font-weight:400;color:var(--text-light);font-size:0.8rem">· ${formatDate(e.data)}</span></div>
            <div style="font-size:0.8rem;color:var(--text-light)">${ricercaHighlight(notePreview, origQuery)}${(e.note||'').length>70?'…':''}</div>
          </div>`;
      });
    }

    // Sezione ARTICOLI
    if(results.articoli.length > 0) {
      html += ricercaSezioneHeader('📦 Magazzino', results.articoli.length);
      results.articoli.slice(0, 6).forEach(a => {
        const giac = typeof getGiacenzaLocale === 'function' ? getGiacenzaLocale(a.id) : '?';
        html += `
          <div class="ricerca-item" onclick="ricercaVaiMagazzino()" style="padding:0.6rem 1rem;cursor:pointer;border-bottom:1px solid var(--cream)">
            <div style="font-weight:600;color:var(--brown);font-size:0.9rem">${ricercaHighlight(a.nome, origQuery)}</div>
            <div style="font-size:0.8rem;color:var(--text-light)">Giacenza: ${giac} ${a.unita||''}${a.note?' · '+ricercaHighlight(a.note.slice(0,40), origQuery):''}</div>
          </div>`;
      });
    }

    // Sezione ORDINI
    if(results.ordini.length > 0) {
      html += ricercaSezioneHeader('🛒 Da ordinare', results.ordini.length);
      results.ordini.slice(0, 6).forEach(n => {
        html += `
          <div class="ricerca-item" onclick="ricercaVaiOrdini()" style="padding:0.6rem 1rem;cursor:pointer;border-bottom:1px solid var(--cream)">
            <div style="font-weight:600;color:var(--brown);font-size:0.9rem">${ricercaHighlight(n._desc||'Articolo', origQuery)} <span style="font-weight:400;color:var(--text-light);font-size:0.8rem">· ${n.quantita} ${n.unita||''}</span></div>
            <div style="font-size:0.8rem;color:var(--text-light)">${n.stato==='ordinato'?'🚚 Ordinato':'📝 Da ordinare'}${n.fornitore?' · '+ricercaHighlight(n.fornitore, origQuery):''}</div>
          </div>`;
      });
    }

    box.style.display = 'block';
    box.innerHTML = html;
  } catch(err) {
    console.error('[Ricerca] Errore in runGlobalSearch:', err.message);
  }
}

function ricercaSezioneHeader(titolo, count) {
  return `<div style="padding:0.4rem 1rem;background:var(--cream);font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--brown);position:sticky;top:0">${titolo} <span style="color:var(--text-light);font-weight:400">(${count})</span></div>`;
}

function ricercaChiudi() {
  const box = document.getElementById('globalSearchResults');
  const input = document.getElementById('globalSearch');
  if(box) box.style.display = 'none';
  if(input) input.value = '';
}

// === NAVIGAZIONE DAI RISULTATI ===
function ricercaVaiArnia(id) {
  ricercaChiudi();
  navigateTo('arnie');
  setTimeout(() => { if(typeof openSchedaDettagliata === 'function') openSchedaDettagliata(id); }, 100);
}
function ricercaVaiVisita() {
  ricercaChiudi();
  navigateTo('registro');
}
function ricercaVaiMagazzino() {
  ricercaChiudi();
  navigateTo('magazzino');
}
function ricercaVaiOrdini() {
  ricercaChiudi();
  navigateTo('magazzino');
  setTimeout(() => { const b = document.querySelector('.mag-tab[onclick*=necessita]'); if(b) showMagTab('necessita', b); }, 80);
}

// Chiudi i risultati cliccando fuori
document.addEventListener('click', (e) => {
  const box = document.getElementById('globalSearchResults');
  const input = document.getElementById('globalSearch');
  if(!box || !input) return;
  if(!box.contains(e.target) && e.target !== input) {
    box.style.display = 'none';
  }
});
