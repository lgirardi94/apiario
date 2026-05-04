// ======= SCIROPPO =======
let sciMode = '1to1';

function showSciroppoTab(tab, btn) {
  ['Calcolatore','Procedimento','Conservazione','Integratori'].forEach(t => {
    const el = document.getElementById(`sciTab${t}`);
    if(el) el.style.display = 'none';
  });
  document.querySelectorAll('#utilTabSciroppo .mag-tabs .mag-tab').forEach(b => b.classList.remove('active'));
  document.getElementById(`sciTab${tab.charAt(0).toUpperCase()+tab.slice(1)}`).style.display = 'block';
  btn.classList.add('active');
  if(tab === 'calcolatore') sciCalc();
}

function sciSetMode(m) {
  sciMode = m;
  document.getElementById('sci-btn-1to1').className = 'sci-type-btn' + (m==='1to1'?' on-1to1':'');
  document.getElementById('sci-btn-2to1').className = 'sci-type-btn' + (m==='2to1'?' on-2to1':'');
  const accent = document.getElementById('sciCalcAccent');
  if(accent) accent.className = 'sci-calc-card-accent' + (m==='2to1'?' mode-2to1':'');
  sciCalc();
}

function sciCalc() {
  const h = parseInt(document.getElementById('sci-sl-hives')?.value || 3, 10);
  const l = parseFloat(document.getElementById('sci-sl-liters')?.value || 1);
  const outH = document.getElementById('sci-out-hives');
  const outL = document.getElementById('sci-out-liters');
  if(outH) outH.textContent = h;
  if(outL) outL.textContent = l.toFixed(1) + ' L';

  const tot = h * l;
  let acq, zuc, brix, uso, usoCls;
  if(sciMode === '1to1') {
    acq = tot / 2; zuc = tot / 2; brix = 50; uso = 'Primavera'; usoCls = 'sci-uso-badge sci-uso-primavera';
  } else {
    acq = tot * 0.37; zuc = tot * 0.63; brix = 67; uso = 'Autunno'; usoCls = 'sci-uso-badge sci-uso-autunno';
  }

  const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
  const setClass = (id, cls) => { const el = document.getElementById(id); if(el) el.className = cls; };
  set('sci-r-acq', acq.toFixed(1));
  set('sci-r-zuc', zuc.toFixed(1));
  set('sci-r-tot', tot.toFixed(1));
  set('sci-r-brix', '~' + brix + '°');
  set('sci-r-uso', uso);
  setClass('sci-r-uso', usoCls);

  const grams = Math.round(tot * 2 * 10) / 10;
  set('sci-r-grams', grams.toFixed(1));

  const intere = Math.floor(grams / 5);
  const resto  = Math.round((grams - intere * 5) * 10) / 10;
  let txt = '';
  if(intere > 0) txt += intere + ' bustina' + (intere > 1 ? 'e' : '');
  if(resto > 0)  txt += (intere > 0 ? ' + ' : '') + resto + ' g parziale';
  if(grams < 0.5) txt = '< mezzo grammo';
  set('sci-r-bust', txt || '—');

  const restoEl = document.getElementById('sci-r-resto');
  if(restoEl) {
    if(resto > 0 && resto < 5 && intere > 0) {
      restoEl.textContent = `Dalla bustina parziale: usa ${resto} g, conserva i restanti ${Math.round((5-resto)*10)/10} g in un vasetto chiuso.`;
    } else if(resto > 0 && intere === 0) {
      restoEl.textContent = `Prendi una bustina e usa solo ${resto} g. Conserva il resto in vasetto chiuso.`;
    } else {
      restoEl.textContent = '';
    }
  }
}

