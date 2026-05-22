/* ===========================================================
   REPORT PDF — Generazione documenti stampabili
   =========================================================== */

// Helper: ottiene tutte le visite di un'arnia in un anno
function visitePerArniaAnno(arniaId, anno) {
  return logBook.filter(e => e.arniaId === arniaId && e.data && e.data.startsWith(String(anno)));
}

// Helper: produzione miele per arnia in un anno
function mielePerArniaAnno(arniaId, anno) {
  return visitePerArniaAnno(arniaId, anno)
    .reduce((s, e) => s + (e.raccolta || []).reduce((ss, r) => ss + (parseFloat(r.kg) || 0), 0), 0);
}

// Helper: trattamenti per arnia in un anno
function trattamentiPerArniaAnno(arniaId, anno) {
  return visitePerArniaAnno(arniaId, anno).filter(e => {
    const tipi = getTipi(e);
    return tipi.includes('trattamento') && e.trattamento;
  });
}

// Helper: tutti i trattamenti dell'anno
function tuttiTrattamentiAnno(anno) {
  return logBook.filter(e => {
    if(!e.data || !e.data.startsWith(String(anno))) return false;
    const tipi = getTipi(e);
    return tipi.includes('trattamento') && e.trattamento;
  });
}

// ============================================
// REPORT COMPLETO
// ============================================
function generaReportCompleto() {
  const anno = prompt('Per quale anno generare il report?', new Date().getFullYear());
  if(!anno) return;
  const annoNum = parseInt(anno, 10);
  if(isNaN(annoNum)) { alert('Anno non valido'); return; }

  const oggi = new Date();
  const dataGenStr = oggi.toLocaleDateString('it-IT');

  // Calcoli generali
  const arnieAttive = arnie.filter(a => !a.annoDismissione || a.annoDismissione > annoNum);
  const famiglie    = arnieAttive.filter(a => a.tipo === 'famiglia' || !a.tipo);
  const nuclei      = arnieAttive.filter(a => a.tipo === 'nucleo');
  const nucleiFec   = arnieAttive.filter(a => a.tipo === 'nucleo_fec');
  const sciami      = arnieAttive.filter(a => a.tipo === 'sciame');

  // Miele totale
  let mieleTotale = 0;
  const produzionePerArnia = arnieAttive.map(a => {
    const kg = mielePerArniaAnno(a.id, annoNum);
    mieleTotale += kg;
    return { a, kg };
  }).sort((x, y) => y.kg - x.kg);

  // Miele per varietà
  const mielePerVarieta = {};
  arnieAttive.forEach(a => {
    visitePerArniaAnno(a.id, annoNum).forEach(e => {
      (e.raccolta || []).forEach(r => {
        const tipo = r.tipo || 'Non specificato';
        const kg = parseFloat(r.kg) || 0;
        mielePerVarieta[tipo] = (mielePerVarieta[tipo] || 0) + kg;
      });
    });
  });
  const varietaSorted = Object.entries(mielePerVarieta).sort((a,b) => b[1] - a[1]);
  const maxVarieta = varietaSorted.length > 0 ? varietaSorted[0][1] : 1;

  // Contabilità
  const mc = movimentiContabili || [];
  const annoStr = String(annoNum);
  const entrate = mc.filter(m => m.data && m.data.startsWith(annoStr) && m.tipo === 'entrata').reduce((s,m)=>s+parseFloat(m.importo||0), 0);
  const uscite = mc.filter(m => m.data && m.data.startsWith(annoStr) && m.tipo === 'uscita').reduce((s,m)=>s+parseFloat(m.importo||0), 0);
  const saldo = entrate - uscite;

  // Trattamenti
  const trattamenti = tuttiTrattamentiAnno(annoNum);

  // Obiettivi
  const obiettAnno = (typeof obiettivi !== 'undefined' ? obiettivi : []).filter(o => o.anno === annoNum);
  const obCompletati = obiettAnno.filter(o => o.stato === 'completato').length;
  const obTotali = obiettAnno.length;

  // Costruisci HTML report
  const html = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<title>Report Apiario ${annoNum}</title>
<style>
  @page { size: A4; margin: 1.5cm; }
  body { font-family: Georgia, 'Crimson Pro', serif; color: #2A1A0F; line-height: 1.5; }
  h1.report-title { text-align: center; color: #5C3A10; font-size: 22pt; margin: 0 0 0.3rem; font-family: Georgia, serif; }
  .report-subtitle { text-align: center; color: #8B6F4E; font-style: italic; margin-bottom: 1rem; }
  .report-header { border-top: 2px solid #5C3A10; border-bottom: 2px solid #5C3A10; padding: 0.5rem 0; margin-bottom: 1rem; display: flex; justify-content: space-between; font-size: 9pt; }
  h2 { color: #5C3A10; font-size: 13pt; margin: 1rem 0 0.5rem; padding-bottom: 0.3rem; border-bottom: 1px dotted #ccc; font-family: Georgia, serif; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 0.8rem; }
  .kpi { background: #FAEED1; padding: 0.5rem 0.7rem; border-left: 3px solid #C8860A; border-radius: 4px; }
  .kpi-label { font-size: 8pt; color: #8B6F4E; text-transform: uppercase; }
  .kpi-val { font-size: 14pt; color: #5C3A10; font-weight: 700; }
  .kpi-val.pos { color: #5D8C44; }
  .kpi-val.neg { color: #C04B3B; }
  table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 0.8rem; }
  th { background: #FAEED1; color: #5C3A10; text-align: left; padding: 0.4rem 0.5rem; border-bottom: 2px solid #E8DDB8; font-weight: 700; }
  td { padding: 0.4rem 0.5rem; border-bottom: 1px solid #E8DDB8; }
  .right { text-align: right; }
  .total-row td { font-weight: 700; background: #FAEED1; color: #5C3A10; }
  .bar-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; font-size: 9pt; }
  .bar-label { min-width: 90px; color: #8B6F4E; font-weight: 600; }
  .bar-track { flex: 1; height: 11px; background: white; border: 1px solid #E8DDB8; border-radius: 2px; overflow: hidden; }
  .bar-fill { height: 100%; background: #C8860A; }
  .bar-fill.green { background: #5D8C44; }
  .bar-fill.red { background: #C04B3B; }
  .bar-val { min-width: 65px; text-align: right; color: #5C3A10; font-weight: 600; }
  .footer { margin-top: 1.5rem; padding-top: 0.5rem; border-top: 1px dotted #E8DDB8; font-size: 8pt; color: #8B6F4E; text-align: center; font-style: italic; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>

<div class="no-print" style="text-align:center;margin-bottom:1rem;padding:0.8rem;background:#FAEED1;border-radius:4px">
  <strong>📄 Anteprima report</strong><br>
  <button onclick="window.print()" style="margin-top:0.5rem;padding:8px 20px;background:#C8860A;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:600;font-size:1rem">🖨️ Stampa / Salva come PDF</button>
  <button onclick="window.close()" style="margin-top:0.5rem;margin-left:0.5rem;padding:8px 20px;background:transparent;color:#5C3A10;border:1px solid #5C3A10;border-radius:4px;cursor:pointer">Chiudi</button>
</div>

<h1 class="report-title">🐝 Report Annuale Apiario</h1>
<p class="report-subtitle">Anno ${annoNum}</p>
<div class="report-header">
  <span>🐝 Apicoltura</span>
  <span>Generato il ${dataGenStr}</span>
</div>

<h2>📊 Panoramica generale</h2>
<div class="kpis">
  <div class="kpi"><div class="kpi-label">Famiglie</div><div class="kpi-val">${famiglie.length}</div></div>
  <div class="kpi"><div class="kpi-label">Nuclei</div><div class="kpi-val">${nuclei.length}</div></div>
  <div class="kpi"><div class="kpi-label">Miele prodotto</div><div class="kpi-val">${mieleTotale.toFixed(1)} kg</div></div>
  <div class="kpi"><div class="kpi-label">Saldo annuo</div><div class="kpi-val ${saldo>=0?'pos':'neg'}">${saldo>=0?'+':''}€ ${fmt(saldo)}</div></div>
</div>
${nucleiFec.length + sciami.length > 0 ? `<p style="font-size:9pt;color:#8B6F4E;margin-top:-0.5rem">Inoltre: ${nucleiFec.length} nucle${nucleiFec.length===1?'o':'i'} di fecondazione, ${sciami.length} sciam${sciami.length===1?'e':'i'} catturat${sciami.length===1?'o':'i'}</p>` : ''}

${varietaSorted.length > 0 ? `
<h2>🍯 Produzione per varietà</h2>
${varietaSorted.map(([tipo, kg]) => `
  <div class="bar-row">
    <span class="bar-label">${tipo}</span>
    <div class="bar-track"><div class="bar-fill" style="width:${Math.round((kg/maxVarieta)*100)}%"></div></div>
    <span class="bar-val">${kg.toFixed(1)} kg</span>
  </div>
`).join('')}
` : ''}

<h2>🏆 Produzione per arnia</h2>
${produzionePerArnia.length === 0 ? '<p style="color:#8B6F4E;font-style:italic">Nessuna produzione registrata.</p>' : `
<table>
  <thead><tr><th>Arnia</th><th>Nome</th><th>Tipo</th><th class="right">Visite</th><th class="right">Miele (kg)</th></tr></thead>
  <tbody>
    ${produzionePerArnia.filter(p => p.kg > 0 || p.a.tipo === 'famiglia').slice(0, 30).map(p => `
      <tr>
        <td><strong>#${p.a.num}</strong></td>
        <td>${p.a.nome || '—'}</td>
        <td>${ARNIA_TIPI[p.a.tipo || 'famiglia'].label}</td>
        <td class="right">${visitePerArniaAnno(p.a.id, annoNum).length}</td>
        <td class="right">${p.kg > 0 ? p.kg.toFixed(1) : '—'}</td>
      </tr>
    `).join('')}
    <tr class="total-row"><td colspan="4"><strong>TOTALE</strong></td><td class="right"><strong>${mieleTotale.toFixed(1)} kg</strong></td></tr>
  </tbody>
</table>
`}

<h2>💰 Bilancio ${annoNum}</h2>
<div class="bar-row">
  <span class="bar-label">Entrate</span>
  <div class="bar-track"><div class="bar-fill green" style="width:${Math.max(entrate,uscite,1)>0?Math.round(entrate/Math.max(entrate,uscite,1)*100):0}%"></div></div>
  <span class="bar-val">€ ${fmt(entrate)}</span>
</div>
<div class="bar-row">
  <span class="bar-label">Uscite</span>
  <div class="bar-track"><div class="bar-fill red" style="width:${Math.max(entrate,uscite,1)>0?Math.round(uscite/Math.max(entrate,uscite,1)*100):0}%"></div></div>
  <span class="bar-val">€ ${fmt(uscite)}</span>
</div>
<div class="bar-row">
  <span class="bar-label"><strong>Saldo</strong></span>
  <div class="bar-track"></div>
  <span class="bar-val" style="color:${saldo>=0?'#5D8C44':'#C04B3B'}">${saldo>=0?'+':''}€ ${fmt(saldo)}</span>
</div>

${trattamenti.length > 0 ? `
<h2>💊 Trattamenti antivarroa eseguiti</h2>
<table>
  <thead><tr><th>Data</th><th>Prodotto</th><th>Arnie</th><th>Note</th></tr></thead>
  <tbody>
    ${trattamenti.map(t => {
      const a = arnie.find(x => x.id === t.arniaId);
      return `<tr>
        <td>${formatDate(t.data)}</td>
        <td>${t.trattamento.prodotto || '—'}</td>
        <td>${a ? '#'+a.num : '—'}</td>
        <td>${(t.note || '').substring(0, 60)}</td>
      </tr>`;
    }).join('')}
  </tbody>
</table>
` : ''}

${obiettAnno.length > 0 ? `
<h2>🎯 Obiettivi ${annoNum}</h2>
<table>
  <thead><tr><th>Stagione</th><th>Obiettivo</th><th>Stato</th></tr></thead>
  <tbody>
    ${obiettAnno.map(o => {
      const stagione = OB_STAGIONI ? OB_STAGIONI[o.stagione] : { label: o.stagione || '—', icon: '' };
      const stato = OB_STATO ? OB_STATO[o.stato] : { label: o.stato || '—', icon: '' };
      return `<tr>
        <td>${stagione.icon || ''} ${stagione.label || o.stagione || '—'}</td>
        <td>${o.titolo || '—'}</td>
        <td>${stato.icon || ''} ${stato.label || o.stato || '—'}</td>
      </tr>`;
    }).join('')}
    <tr class="total-row"><td colspan="2"><strong>OBIETTIVI COMPLETATI</strong></td><td><strong>${obCompletati}/${obTotali}</strong></td></tr>
  </tbody>
</table>
` : ''}

<div class="footer">
  Generato automaticamente da "Il Mio Apiario" · ${dataGenStr}
</div>

</body>
</html>`;

  // Apri il report in nuova finestra
  const win = window.open('', '_blank', 'width=900,height=700');
  if(!win) {
    alert('Per favore consenti i popup per questo sito per generare il report.');
    return;
  }
  win.document.write(html);
  win.document.close();
}

// ============================================
// REPORT TRATTAMENTI (registro ufficiale)
// ============================================
function generaReportTrattamenti() {
  const anno = prompt('Per quale anno generare il registro?', new Date().getFullYear());
  if(!anno) return;
  const annoNum = parseInt(anno, 10);
  if(isNaN(annoNum)) { alert('Anno non valido'); return; }

  const oggi = new Date();
  const dataGenStr = oggi.toLocaleDateString('it-IT');

  const arnieAttive = arnie.filter(a => !a.annoDismissione || a.annoDismissione > annoNum);
  const trattamenti = tuttiTrattamentiAnno(annoNum);

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<title>Registro Trattamenti ${annoNum}</title>
<style>
  @page { size: A4; margin: 1.5cm; }
  body { font-family: Georgia, serif; color: #2A1A0F; line-height: 1.5; }
  h1.report-title { text-align: center; color: #5C3A10; font-size: 18pt; margin: 0 0 0.3rem; font-family: Georgia, serif; }
  .report-subtitle { text-align: center; color: #8B6F4E; font-style: italic; margin-bottom: 1rem; }
  .report-header { border-top: 2px solid #5C3A10; border-bottom: 2px solid #5C3A10; padding: 0.5rem 0; margin-bottom: 1rem; font-size: 10pt; }
  h2 { color: #5C3A10; font-size: 12pt; margin: 1rem 0 0.5rem; font-family: Georgia, serif; }
  table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 0.8rem; }
  th { background: #FAEED1; color: #5C3A10; text-align: left; padding: 0.4rem 0.5rem; border: 1px solid #E8DDB8; font-weight: 700; }
  td { padding: 0.4rem 0.5rem; border: 1px solid #E8DDB8; }
  .info-table td { border: none; padding: 0.3rem 0.5rem; }
  .footer { margin-top: 1.5rem; padding-top: 0.5rem; border-top: 1px dotted #E8DDB8; font-size: 8pt; color: #8B6F4E; text-align: center; font-style: italic; }
  .firma-section { margin-top: 2rem; }
  .firma-row { border-top: 1px solid #2A1A0F; margin-top: 1rem; padding-top: 0.5rem; display: flex; justify-content: space-between; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>

<div class="no-print" style="text-align:center;margin-bottom:1rem;padding:0.8rem;background:#FAEED1;border-radius:4px">
  <strong>📄 Anteprima registro</strong><br>
  <button onclick="window.print()" style="margin-top:0.5rem;padding:8px 20px;background:#C8860A;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:600;font-size:1rem">🖨️ Stampa / Salva come PDF</button>
  <button onclick="window.close()" style="margin-top:0.5rem;margin-left:0.5rem;padding:8px 20px;background:transparent;color:#5C3A10;border:1px solid #5C3A10;border-radius:4px;cursor:pointer">Chiudi</button>
</div>

<h1 class="report-title">💊 Registro Ufficiale Trattamenti</h1>
<p class="report-subtitle">Documento per ispezione veterinaria</p>

<div class="report-header">
  <table class="info-table">
    <tr><td><strong>Anno:</strong></td><td>${annoNum}</td></tr>
    <tr><td><strong>Numero arnie attive:</strong></td><td>${arnieAttive.length}</td></tr>
    <tr><td><strong>Data generazione:</strong></td><td>${dataGenStr}</td></tr>
  </table>
</div>

<h2>Trattamenti antivarroa effettuati</h2>
${trattamenti.length === 0 ? '<p style="color:#8B6F4E;font-style:italic">Nessun trattamento registrato per questo anno.</p>' : `
<table>
  <thead>
    <tr>
      <th>Data</th>
      <th>Arnia</th>
      <th>Prodotto</th>
      <th>Principio attivo</th>
      <th>Dose/Lotto</th>
      <th>Note</th>
    </tr>
  </thead>
  <tbody>
    ${trattamenti.map(t => {
      const a = arnie.find(x => x.id === t.arniaId);
      const trat = t.trattamento || {};
      return `<tr>
        <td>${formatDate(t.data)}</td>
        <td>#${a ? a.num : '?'}${a && a.nome ? ' — '+a.nome : ''}</td>
        <td>${trat.prodotto || '—'}</td>
        <td>${trat.principioAttivo || '—'}</td>
        <td>${trat.dose || '—'}${trat.lotto ? '<br>Lotto: '+trat.lotto : ''}</td>
        <td>${(t.note || '').substring(0,100)}</td>
      </tr>`;
    }).join('')}
  </tbody>
</table>
`}

<div class="firma-section">
  <p style="font-size:9pt;color:#8B6F4E;line-height:1.7">
    Il sottoscritto dichiara di aver effettuato i trattamenti antivarroa sopra elencati nel rispetto delle linee guida ministeriali (rif. <em>Linee guida IZS Venezie 2024 — Nota 11687</em>) e nel rispetto del periodo di sospensione previsto per il miele destinato al consumo.
  </p>
  <div class="firma-row">
    <span style="font-size:10pt"><strong>Luogo, data</strong><br>__________________, ${dataGenStr}</span>
    <span style="font-size:10pt"><strong>Firma apicoltore</strong><br>___________________________</span>
  </div>
</div>

<div class="footer">
  Generato automaticamente da "Il Mio Apiario" · ${dataGenStr}
</div>

</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if(!win) {
    alert('Per favore consenti i popup per questo sito per generare il report.');
    return;
  }
  win.document.write(html);
  win.document.close();
}
