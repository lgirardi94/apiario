/* ===========================================================
   INSIGHTS / ANALISI — costo miele, simulatore prezzo,
   heatmap produzione, genealogia regine, report narrativo
   =========================================================== */

function insEscape(s) {
  if(!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// Anni disponibili dai dati (visite + movimenti)
function getAnniDisponibili() {
  const anni = new Set();
  (logBook||[]).forEach(e => { if(e.data) anni.add(e.data.slice(0,4)); });
  (movimentiContabili||[]).forEach(m => { if(m.data) anni.add(m.data.slice(0,4)); });
  const annoCorrente = String(new Date().getFullYear());
  anni.add(annoCorrente);
  return [...anni].filter(a => /^\d{4}$/.test(a)).sort().reverse();
}

function getAnnoAnalisi() {
  const sel = document.getElementById('analisiAnno');
  return sel && sel.value ? sel.value : String(new Date().getFullYear());
}

// ===========================================================
// CALCOLI BASE
// ===========================================================

// Produzione totale miele (kg) per un anno
function insProduzioneAnno(anno) {
  let tot = 0;
  (logBook||[]).forEach(e => {
    if(!e.data || !e.data.startsWith(anno)) return;
    (e.raccolta||[]).forEach(r => { tot += parseFloat(r.qta) || 0; });
  });
  return tot;
}

// Costo consumabili dell'anno (uscite contabilità categorie consumabili/materiale)
function insCostoConsumabili(anno) {
  let tot = 0;
  (movimentiContabili||[]).forEach(m => {
    if(!m.data || !m.data.startsWith(anno)) return;
    if(m.tipo !== 'uscita') return;
    tot += parseFloat(m.importo) || 0;
  });
  return tot;
}

// Ammortamento attrezzatura: stima dal valore di magazzino "materiale" (categoria materiale)
// ammortizzato su 7 anni (durata tipica attrezzatura apistica)
function insAmmortamento(anno) {
  const ANNI_AMMORTAMENTO = 7;
  let valoreMateriale = 0;
  (articoli||[]).forEach(a => {
    if(a.categoria !== 'materiale') return;
    const giac = typeof getGiacenzaLocale === 'function' ? getGiacenzaLocale(a.id) : 0;
    const prezzo = parseFloat(a.prezzoUnitario) || 0;
    valoreMateriale += giac * prezzo;
  });
  return valoreMateriale / ANNI_AMMORTAMENTO;
}

// ===========================================================
// 1. COSTO REALE DEL MIELE
// ===========================================================
function renderCostoMiele(anno) {
  try {
    const kpi = document.getElementById('analisiCostoKpi');
    const nota = document.getElementById('analisiCostoNota');
    if(!kpi) return;

    const consumabili = insCostoConsumabili(anno);
    const ammortamento = insAmmortamento(anno);
    const produzione = insProduzioneAnno(anno);
    const costoTot = consumabili + ammortamento;
    const costoKg = produzione > 0 ? costoTot / produzione : 0;

    const card = (label, val, color) => `
      <div class="stat-box" style="text-align:center">
        <div class="stat-num" style="${color?'color:'+color:''}">${val}</div>
        <div class="stat-label">${label}</div>
      </div>`;

    kpi.innerHTML =
      card('Consumabili', '€ ' + consumabili.toFixed(0)) +
      card('Ammortamenti', '€ ' + ammortamento.toFixed(0)) +
      card('Produzione', produzione.toFixed(0) + ' kg') +
      card('Costo / kg', produzione > 0 ? '€ ' + costoKg.toFixed(2) : '—', 'var(--brown)');

    if(nota) {
      if(produzione <= 0) {
        nota.innerHTML = `<div style="background:rgba(0,0,0,0.03);border-radius:6px;padding:0.7rem 1rem;font-size:0.88rem;color:var(--text-light)">Nessuna produzione registrata per il ${anno}. Registra le raccolte nel registro visite per vedere il costo per kg.</div>`;
      } else {
        const costo500 = costoKg * 0.5;
        nota.innerHTML = `<div style="background:var(--amber-pale);border-radius:6px;padding:0.7rem 1rem;font-size:0.9rem;color:var(--brown)">Un vasetto da 500g ti costa <strong>€ ${costo500.toFixed(2)}</strong> prima di venderlo. Sotto questo prezzo ci rimetti.</div>`;
      }
    }
  } catch(err) {
    console.error('[Insights] Errore in renderCostoMiele:', err.message);
  }
}

// ===========================================================
// 2. SIMULATORE PREZZO
// ===========================================================
function updateSimulatore() {
  try {
    const anno = getAnnoAnalisi();
    const prezzo = parseFloat(document.getElementById('simPrezzo')?.value) || 0;
    const pezzatura = parseFloat(document.getElementById('simPezzatura')?.value) || 0.5;
    const out = document.getElementById('simPrezzoOut');
    if(out) out.textContent = '€ ' + prezzo.toFixed(2).replace('.', ',');

    const produzione = insProduzioneAnno(anno);
    const costoTot = insCostoConsumabili(anno) + insAmmortamento(anno);
    const costoKg = produzione > 0 ? costoTot / produzione : 0;
    const costoVasetto = costoKg * pezzatura;

    const nVasetti = pezzatura > 0 ? Math.floor(produzione / pezzatura) : 0;
    const ricavo = prezzo * nVasetti;
    const margine = ricavo - costoTot;
    const pct = ricavo > 0 ? Math.round(margine / ricavo * 100) : 0;
    const pareggio = prezzo > 0 ? Math.ceil(costoTot / prezzo) : 0;

    const kpi = document.getElementById('analisiSimKpi');
    if(kpi) {
      const card = (label, val) => `<div class="stat-box" style="text-align:center"><div class="stat-num">${val}</div><div class="stat-label">${label}</div></div>`;
      kpi.innerHTML =
        card('Vasetti producibili', nVasetti) +
        card('Ricavo totale', '€ ' + ricavo.toLocaleString('it-IT')) +
        card('Margine', '€ ' + Math.round(margine).toLocaleString('it-IT')) +
        card('Pareggio', pareggio + ' vasetti');
    }

    const nota = document.getElementById('analisiSimNota');
    if(nota) {
      if(produzione <= 0) {
        nota.innerHTML = `<span style="color:var(--text-light)">Nessuna produzione registrata per il ${anno}.</span>`;
      } else if(prezzo <= costoVasetto) {
        nota.innerHTML = `<span style="color:var(--red)">⚠️ Sotto il costo di produzione (€ ${costoVasetto.toFixed(2)}/vasetto) — ci rimetti.</span>`;
      } else if(pct < 40) {
        nota.innerHTML = `<span style="color:var(--amber)">Margine del ${pct}% — basso. Considera un prezzo più alto.</span>`;
      } else {
        nota.innerHTML = `<span style="color:var(--green)">Margine del ${pct}% — ottimo.</span>`;
      }
    }
  } catch(err) {
    console.error('[Insights] Errore in updateSimulatore:', err.message);
  }
}

// ===========================================================
// 6. HEATMAP PRODUZIONE (arnia × mese)
// ===========================================================
function renderHeatmap(anno) {
  try {
    const container = document.getElementById('analisiHeatmap');
    if(!container) return;

    const mesi = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
    // Raccogli produzione per arnia per mese
    const datiPerArnia = {}; // arniaId -> [12 valori]
    let maxVal = 0;

    (logBook||[]).forEach(e => {
      if(!e.data || !e.data.startsWith(anno)) return;
      const mese = parseInt(e.data.slice(5,7), 10) - 1;
      if(isNaN(mese) || mese < 0 || mese > 11) return;
      const kg = (e.raccolta||[]).reduce((s,r) => s + (parseFloat(r.qta)||0), 0);
      if(kg <= 0) return;
      if(!datiPerArnia[e.arniaId]) datiPerArnia[e.arniaId] = new Array(12).fill(0);
      datiPerArnia[e.arniaId][mese] += kg;
      if(datiPerArnia[e.arniaId][mese] > maxVal) maxVal = datiPerArnia[e.arniaId][mese];
    });

    const arnieConProd = Object.keys(datiPerArnia);
    if(arnieConProd.length === 0) {
      container.innerHTML = `<div style="text-align:center;color:var(--text-light);font-style:italic;padding:1.5rem">Nessuna produzione registrata per il ${anno}.</div>`;
      return;
    }

    // Mostra solo mesi con almeno una produzione (per compattezza), min Mar-Set
    const mesiAttivi = [];
    for(let m=0; m<12; m++) {
      const haProd = arnieConProd.some(aid => datiPerArnia[aid][m] > 0);
      if(haProd) mesiAttivi.push(m);
    }
    if(mesiAttivi.length === 0) return;

    const col = (v) => {
      if(v === 0) return 'rgba(0,0,0,0.03)';
      const r = v / maxVal;
      if(r < 0.2) return '#EAF3DE';
      if(r < 0.4) return '#C0DD97';
      if(r < 0.6) return '#97C459';
      if(r < 0.8) return '#639922';
      return '#3B6D11';
    };
    const txtCol = (v) => v === 0 ? 'transparent' : (v/maxVal > 0.5 ? '#fff' : '#27500A');

    let html = `<div style="display:grid;grid-template-columns:auto repeat(${mesiAttivi.length},minmax(38px,1fr));gap:4px;align-items:center;min-width:${100+mesiAttivi.length*42}px">`;
    html += '<div></div>';
    mesiAttivi.forEach(m => { html += `<div style="text-align:center;font-size:0.72rem;color:var(--text-light);font-weight:600">${mesi[m]}</div>`; });

    // Ordina arnie per numero
    arnieConProd.sort((a,b) => {
      const na = arnie.find(x=>x.id===a), nb = arnie.find(x=>x.id===b);
      return (parseInt(na?.num)||0) - (parseInt(nb?.num)||0);
    });

    arnieConProd.forEach(aid => {
      const arnia = arnie.find(x => x.id === aid);
      const label = arnia ? '#'+arnia.num : '?';
      html += `<div style="font-size:0.8rem;color:var(--text);font-weight:600;white-space:nowrap">${label}</div>`;
      mesiAttivi.forEach(m => {
        const v = datiPerArnia[aid][m];
        html += `<div title="${label} · ${mesi[m]}: ${v.toFixed(1)} kg" style="aspect-ratio:1;min-height:34px;background:${col(v)};border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:0.72rem;color:${txtCol(v)}">${v>0?(v%1===0?v:v.toFixed(1)):''}</div>`;
      });
    });
    html += '</div>';

    // Legenda
    html += `<div style="display:flex;align-items:center;gap:6px;margin-top:12px;font-size:0.75rem;color:var(--text-light)">
      <span>meno</span>
      <span style="width:18px;height:12px;background:#EAF3DE;border-radius:2px"></span>
      <span style="width:18px;height:12px;background:#C0DD97;border-radius:2px"></span>
      <span style="width:18px;height:12px;background:#97C459;border-radius:2px"></span>
      <span style="width:18px;height:12px;background:#639922;border-radius:2px"></span>
      <span style="width:18px;height:12px;background:#3B6D11;border-radius:2px"></span>
      <span>più miele (kg)</span>
    </div>`;

    container.innerHTML = html;
  } catch(err) {
    console.error('[Insights] Errore in renderHeatmap:', err.message);
  }
}

// ===========================================================
// 7. GENEALOGIA REGINE
// ===========================================================
function renderGenealogia(anno) {
  try {
    const container = document.getElementById('analisiGenealogia');
    if(!container) return;

    // Produzione totale per arnia (storica, non solo anno) per valutare le linee
    const prodArnia = {};
    (logBook||[]).forEach(e => {
      const kg = (e.raccolta||[]).reduce((s,r) => s + (parseFloat(r.qta)||0), 0);
      prodArnia[e.arniaId] = (prodArnia[e.arniaId]||0) + kg;
    });

    // Costruisci relazioni madre→figlia da reginaArniaSrc
    const arnieAttive = arnie.filter(a => !a.annoDismissione);
    const figlie = {}; // madreId -> [arnie figlie]
    const conMadre = new Set();
    arnieAttive.forEach(a => {
      if(a.reginaArniaSrc) {
        if(!figlie[a.reginaArniaSrc]) figlie[a.reginaArniaSrc] = [];
        figlie[a.reginaArniaSrc].push(a);
        conMadre.add(a.id);
      }
    });

    const radici = arnieAttive.filter(a => !conMadre.has(a.id) && figlie[a.id]);
    if(radici.length === 0 && Object.keys(figlie).length === 0) {
      container.innerHTML = `<div style="text-align:center;color:var(--text-light);font-style:italic;padding:1rem">Nessuna relazione genealogica registrata.<br><span style="font-size:0.85rem">Imposta "origine regina → da arnia" nelle schede arnia per costruire l'albero genetico.</span></div>`;
      return;
    }

    const prodColor = (id) => {
      const p = prodArnia[id] || 0;
      if(p >= 15) return { bg:'#EAF3DE', border:'#639922', txt:'#27500A' };
      if(p >= 8)  return { bg:'#FAEEDA', border:'#BA7517', txt:'#633806' };
      return { bg:'rgba(0,0,0,0.03)', border:'var(--cream-dark)', txt:'var(--text-light)' };
    };

    const renderNodo = (a, livello) => {
      const c = prodColor(a.id);
      const prod = prodArnia[a.id] || 0;
      const reg = a.reginaAnno ? (typeof getReginaPallino==='function'? getReginaPallino(a.reginaAnno,10):'') + ' ' + a.reginaAnno : '';
      let h = `<div style="margin-left:${livello*1.5}rem;display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem">
        <div style="background:${c.bg};border:1px solid ${c.border};border-radius:6px;padding:0.4rem 0.8rem;font-size:0.88rem;color:${c.txt}">
          <strong>#${a.num}</strong>${a.nome?' '+insEscape(a.nome):''} ${reg?'· '+reg:''} <span style="opacity:0.8">· ${prod.toFixed(0)}kg</span>
        </div>
      </div>`;
      (figlie[a.id]||[]).sort((x,y)=>(prodArnia[y.id]||0)-(prodArnia[x.id]||0)).forEach(f => {
        h += renderNodo(f, livello+1);
      });
      return h;
    };

    let html = '';
    radici.sort((a,b)=>(prodArnia[b.id]||0)-(prodArnia[a.id]||0)).forEach(r => { html += renderNodo(r, 0); });

    // Suggerimento sulla linea migliore
    let migliore = null, maxProd = 0;
    Object.keys(figlie).forEach(mid => {
      const tot = figlie[mid].reduce((s,f)=>s+(prodArnia[f.id]||0),0);
      if(tot > maxProd) { maxProd = tot; migliore = mid; }
    });
    if(migliore) {
      const am = arnie.find(a=>a.id===migliore);
      if(am) html += `<div style="margin-top:0.8rem;background:var(--amber-pale);border-radius:6px;padding:0.6rem 0.9rem;font-size:0.85rem;color:var(--brown)">💡 La linea di <strong>#${am.num}</strong> dà le figlie più produttive: usala per allevare nuove regine.</div>`;
    }

    container.innerHTML = html;
  } catch(err) {
    console.error('[Insights] Errore in renderGenealogia:', err.message);
  }
}

// ===========================================================
// 5. REPORT NARRATIVO
// ===========================================================
const MESI_IT = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];

function generaNarrativaArnia(arnia, anno) {
  try {
    const visite = (logBook||[])
      .filter(e => e.arniaId === arnia.id && e.data && e.data.startsWith(anno))
      .sort((a,b) => a.data.localeCompare(b.data));

    if(visite.length === 0) return null;

    const frasi = [];
    const nome = arnia.nome ? arnia.nome : ('#' + arnia.num);

    // Prima visita
    const prima = visite[0];
    const meseInizio = MESI_IT[parseInt(prima.data.slice(5,7),10)-1];
    if(prima.ispezione && prima.ispezione.telaini) {
      const tel = parseInt(prima.ispezione.telaini,10);
      if(tel <= 4) frasi.push(`È iniziata l'anno debole a ${meseInizio}, con appena ${tel} telaini.`);
      else if(tel >= 8) frasi.push(`A ${meseInizio} era già forte, con ${tel} telaini occupati.`);
      else frasi.push(`A ${meseInizio} si presentava in condizioni discrete (${tel} telaini).`);
    } else {
      frasi.push(`Prima visita dell'anno a ${meseInizio}.`);
    }

    // Produzione
    const prodTot = visite.reduce((s,e) => s + (e.raccolta||[]).reduce((ss,r)=>ss+(parseFloat(r.qta)||0),0), 0);
    if(prodTot > 0) {
      // Trova il tipo di miele prevalente
      const perTipo = {};
      visite.forEach(e => (e.raccolta||[]).forEach(r => {
        const art = (articoli||[]).find(a=>a.id===r.articoloId);
        const nm = art ? art.nome : 'miele';
        perTipo[nm] = (perTipo[nm]||0) + (parseFloat(r.qta)||0);
      }));
      const tipoMax = Object.keys(perTipo).sort((a,b)=>perTipo[b]-perTipo[a])[0];
      frasi.push(`Ha prodotto <strong>${prodTot.toFixed(1)} kg</strong>${tipoMax?' (soprattutto '+insEscape(tipoMax)+')':''}.`);
    }

    // Trattamenti
    const tratt = visite.filter(e => (getTipi(e)||[]).includes('trattamento'));
    if(tratt.length > 0) {
      const ultimo = tratt[tratt.length-1];
      const meseT = MESI_IT[parseInt(ultimo.data.slice(5,7),10)-1];
      const prod = ultimo.trattamento && ultimo.trattamento.prodotto ? ultimo.trattamento.prodotto : '';
      frasi.push(`Trattata contro la varroa a ${meseT}${prod?' con '+insEscape(prod):''}.`);
    }

    // Sciamatura / celle reali
    const conCelle = visite.filter(e => e.ispezione && e.ispezione.celleReali && parseInt(e.ispezione.celleReali,10) > 0);
    if(conCelle.length > 0) {
      frasi.push(`Mostrati segni di sciamatura in ${conCelle.length} ${conCelle.length>1?'visite':'visita'} — tenuta sotto controllo.`);
    }

    // Chiusura
    frasi.push(`In totale ${visite.length} ${visite.length>1?'visite':'visita'} durante l'anno.`);

    return { nome: '#'+arnia.num+(arnia.nome?' — '+arnia.nome:''), testo: frasi.join(' '), visite: visite.length, prod: prodTot };
  } catch(err) {
    console.error('[Insights] Errore generaNarrativaArnia:', err.message);
    return null;
  }
}

function renderNarrativo(anno) {
  try {
    const container = document.getElementById('analisiNarrativo');
    if(!container) return;

    const racconti = [];
    (arnie||[]).filter(a => !a.annoDismissione).forEach(a => {
      const n = generaNarrativaArnia(a, anno);
      if(n) racconti.push(n);
    });

    if(racconti.length === 0) {
      container.innerHTML = `<div style="background:rgba(0,0,0,0.03);border-radius:6px;padding:1rem;text-align:center;color:var(--text-light);font-style:italic">Nessuna visita registrata nel ${anno} per generare i racconti.</div>`;
      return;
    }

    racconti.sort((a,b) => b.prod - a.prod);

    container.innerHTML = racconti.map(r => `
      <div style="background:white;border:1px solid var(--cream-dark);border-radius:8px;padding:1.1rem 1.3rem;margin-bottom:0.8rem">
        <div style="font-weight:600;font-size:1rem;color:var(--brown);margin-bottom:0.5rem">🏠 ${insEscape(r.nome)}</div>
        <p style="font-family:'Crimson Pro',serif;font-size:0.98rem;line-height:1.7;color:var(--text);margin:0">${r.testo}</p>
        <div style="margin-top:0.6rem;font-size:0.78rem;color:var(--text-light)">${r.visite} visite · ${r.prod.toFixed(1)} kg prodotti</div>
      </div>
    `).join('');
  } catch(err) {
    console.error('[Insights] Errore in renderNarrativo:', err.message);
  }
}

// ===========================================================
// ORCHESTRATORE
// ===========================================================
function renderAnalisi() {
  try {
    // Popola dropdown anni se vuoto
    const sel = document.getElementById('analisiAnno');
    if(sel && sel.options.length === 0) {
      const anni = getAnniDisponibili();
      sel.innerHTML = anni.map(a => `<option value="${a}">${a}</option>`).join('');
    }
    const anno = getAnnoAnalisi();
    const lbl = document.getElementById('analisiAnnoLabel');
    if(lbl) lbl.textContent = anno;

    renderCostoMiele(anno);
    updateSimulatore();
    renderHeatmap(anno);
    renderGenealogia(anno);
    renderNarrativo(anno);
  } catch(err) {
    console.error('[Insights] Errore in renderAnalisi:', err.message);
  }
}

// ===========================================================
// EXPORT REPORT ANNUALE (stampabile / PDF via window.print)
// ===========================================================
function esportaReportAnnuale() {
  try {
    const anno = getAnnoAnalisi();

    // --- Raccogli tutti i dati ---
    const consumabili = insCostoConsumabili(anno);
    const ammortamento = insAmmortamento(anno);
    const produzione = insProduzioneAnno(anno);
    const costoTot = consumabili + ammortamento;
    const costoKg = produzione > 0 ? costoTot / produzione : 0;

    // Entrate/uscite contabilità anno
    let entrate = 0, uscite = 0;
    (movimentiContabili||[]).forEach(m => {
      if(!m.data || !m.data.startsWith(anno)) return;
      if(m.tipo === 'entrata') entrate += parseFloat(m.importo)||0;
      else uscite += parseFloat(m.importo)||0;
    });

    // Visite totali anno
    const visiteAnno = (logBook||[]).filter(e => e.data && e.data.startsWith(anno));

    // Arnie attive
    const arnieAttive = (arnie||[]).filter(a => !a.annoDismissione);

    // Trattamenti dell'anno (per sezione sanitaria)
    const trattamenti = visiteAnno.filter(e => (getTipi(e)||[]).includes('trattamento'));

    // Produzione per arnia
    const prodPerArnia = {};
    visiteAnno.forEach(e => {
      const kg = (e.raccolta||[]).reduce((s,r)=>s+(parseFloat(r.qta)||0),0);
      if(kg>0) prodPerArnia[e.arniaId] = (prodPerArnia[e.arniaId]||0)+kg;
    });

    // Racconti narrativi
    const racconti = [];
    arnieAttive.forEach(a => { const n = generaNarrativaArnia(a, anno); if(n) racconti.push(n); });
    racconti.sort((a,b)=>b.prod-a.prod);

    // --- Costruisci HTML report ---
    const oggi = new Date().toLocaleDateString('it-IT', { day:'numeric', month:'long', year:'numeric' });

    let html = `<!DOCTYPE html><html lang="it"><head><meta charset="utf-8"><title>Report Annuale Apiario ${anno}</title>
    <style>
      @page { margin: 1.5cm; }
      * { box-sizing: border-box; }
      body { font-family: Georgia, 'Times New Roman', serif; color: #2A1A05; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 1rem; }
      h1 { font-size: 1.8rem; color: #5C3A10; border-bottom: 3px solid #C8860A; padding-bottom: 0.5rem; margin-bottom: 0.3rem; }
      h2 { font-size: 1.3rem; color: #6B4A20; margin-top: 2rem; border-bottom: 1px solid #E0D0B0; padding-bottom: 0.3rem; }
      h3 { font-size: 1.05rem; color: #5C3A10; margin-bottom: 0.3rem; }
      .sub { color: #8A6D3B; font-style: italic; margin-top: 0; }
      .kpi-row { display: flex; flex-wrap: wrap; gap: 0.8rem; margin: 1rem 0; }
      .kpi { flex: 1; min-width: 120px; border: 1px solid #E0D0B0; border-radius: 6px; padding: 0.7rem 1rem; text-align: center; }
      .kpi-num { font-size: 1.4rem; font-weight: bold; color: #5C3A10; }
      .kpi-lbl { font-size: 0.78rem; color: #8A6D3B; text-transform: uppercase; letter-spacing: 0.04em; }
      table { width: 100%; border-collapse: collapse; margin: 0.8rem 0; font-size: 0.92rem; }
      th, td { border: 1px solid #E0D0B0; padding: 0.4rem 0.6rem; text-align: left; }
      th { background: #FAEEDA; color: #6B4A20; }
      .narr { background: #FBF6EC; border-left: 3px solid #C8860A; border-radius: 0 4px 4px 0; padding: 0.8rem 1rem; margin-bottom: 0.7rem; }
      .narr-nome { font-weight: bold; color: #5C3A10; margin-bottom: 0.3rem; }
      .nota { background: #FAEEDA; border-radius: 6px; padding: 0.7rem 1rem; font-size: 0.92rem; }
      .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #E0D0B0; font-size: 0.8rem; color: #8A6D3B; text-align: center; }
      @media print { body { padding: 0; } h2 { page-break-after: avoid; } .narr, table { page-break-inside: avoid; } }
    </style></head><body>`;

    html += `<h1>🐝 Report Annuale Apiario — ${anno}</h1>
    <p class="sub">Generato il ${oggi} · ${arnieAttive.length} arnie attive · ${visiteAnno.length} visite registrate</p>`;

    // SEZIONE 1: Economia
    html += `<h2>💰 Bilancio economico</h2>
    <div class="kpi-row">
      <div class="kpi"><div class="kpi-num">€ ${entrate.toFixed(0)}</div><div class="kpi-lbl">Entrate</div></div>
      <div class="kpi"><div class="kpi-num">€ ${uscite.toFixed(0)}</div><div class="kpi-lbl">Uscite</div></div>
      <div class="kpi"><div class="kpi-num">€ ${(entrate-uscite).toFixed(0)}</div><div class="kpi-lbl">Saldo</div></div>
    </div>`;

    // SEZIONE 2: Costo del miele
    html += `<h2>🍯 Costo di produzione del miele</h2>
    <div class="kpi-row">
      <div class="kpi"><div class="kpi-num">€ ${consumabili.toFixed(0)}</div><div class="kpi-lbl">Consumabili</div></div>
      <div class="kpi"><div class="kpi-num">€ ${ammortamento.toFixed(0)}</div><div class="kpi-lbl">Ammortamenti</div></div>
      <div class="kpi"><div class="kpi-num">${produzione.toFixed(0)} kg</div><div class="kpi-lbl">Produzione</div></div>
      <div class="kpi"><div class="kpi-num">${produzione>0?'€ '+costoKg.toFixed(2):'—'}</div><div class="kpi-lbl">Costo / kg</div></div>
    </div>`;
    if(produzione > 0) {
      html += `<div class="nota">Un vasetto da 500g ti costa <strong>€ ${(costoKg*0.5).toFixed(2)}</strong> di sola produzione. Per coprire i costi a € ${(costoKg*0.5).toFixed(2)}/vasetto dovresti venderne ${Math.ceil(costoTot/(costoKg*0.5||1))}.</div>`;
    }

    // SEZIONE 3: Produzione per arnia
    if(Object.keys(prodPerArnia).length > 0) {
      html += `<h2>📊 Produzione per arnia</h2><table><tr><th>Arnia</th><th>Produzione ${anno}</th></tr>`;
      Object.keys(prodPerArnia)
        .sort((a,b)=>prodPerArnia[b]-prodPerArnia[a])
        .forEach(aid => {
          const a = arnie.find(x=>x.id===aid);
          html += `<tr><td>#${a?a.num:'?'}${a&&a.nome?' — '+insEscape(a.nome):''}</td><td>${prodPerArnia[aid].toFixed(1)} kg</td></tr>`;
        });
      html += `</table>`;
    }

    // SEZIONE 4: Registro sanitario (trattamenti)
    html += `<h2>💊 Registro trattamenti sanitari</h2>`;
    if(trattamenti.length > 0) {
      html += `<table><tr><th>Data</th><th>Arnia</th><th>Prodotto</th><th>Dosaggio</th></tr>`;
      trattamenti.sort((a,b)=>a.data.localeCompare(b.data)).forEach(t => {
        const prod = t.trattamento && t.trattamento.prodotto ? insEscape(t.trattamento.prodotto) : '—';
        const dos = t.trattamento && t.trattamento.dosaggio ? insEscape(t.trattamento.dosaggio) : '—';
        html += `<tr><td>${formatDate(t.data)}</td><td>${insEscape(t.arniaNome||'—')}</td><td>${prod}</td><td>${dos}</td></tr>`;
      });
      html += `</table>`;
    } else {
      html += `<p class="sub">Nessun trattamento registrato nel ${anno}.</p>`;
    }

    // SEZIONE 5: Report narrativo
    if(racconti.length > 0) {
      html += `<h2>📖 L'anno delle tue arnie</h2>`;
      racconti.forEach(r => {
        html += `<div class="narr"><div class="narr-nome">🏠 ${insEscape(r.nome)}</div><div>${r.testo}</div></div>`;
      });
    }

    html += `<div class="footer">Il Mio Apiario · Report generato automaticamente · ${oggi}</div>`;
    html += `</body></html>`;

    // Apri in nuova finestra e lancia stampa
    const win = window.open('', '_blank');
    if(!win) {
      alert('Abilita i popup per esportare il report, oppure riprova.');
      return;
    }
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 400);

    if(typeof showImportToast === 'function') showImportToast('📄 Report annuale generato');
  } catch(err) {
    console.error('[Insights] Errore in esportaReportAnnuale:', err.message);
    alert('Errore nella generazione del report: ' + err.message);
  }
}
