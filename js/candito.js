/* ===========================================================
   CANDITO — Calcolatore ricetta e gestione tab
   =========================================================== */

let candMode = 'classico'; // 'classico' | 'polline'

function showCanditoTab(tab, btn) {
  const tabs = ['calcolatore', 'procedimento', 'conservazione', 'quando'];
  tabs.forEach(t => {
    const el = document.getElementById('candTab' + t.charAt(0).toUpperCase() + t.slice(1));
    if(el) el.style.display = (t === tab) ? 'block' : 'none';
  });
  // Active state
  const parent = btn?.closest('.mag-tabs');
  if(parent) {
    parent.querySelectorAll('.mag-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  if(tab === 'calcolatore') candCalc();
}

function candSetMode(mode) {
  candMode = mode;
  document.getElementById('cand-btn-classico').classList.toggle('on-1to1', mode === 'classico');
  document.getElementById('cand-btn-polline').classList.toggle('on-2to1', mode === 'polline');

  // Mostra/nascondi box polline nel calcolatore
  const pollineBox = document.getElementById('candPollineBox');
  if(pollineBox) pollineBox.style.display = (mode === 'polline') ? 'block' : 'none';

  // Mostra/nascondi step polline nel procedimento
  const stepPolline = document.getElementById('candStepPolline');
  if(stepPolline) stepPolline.style.display = (mode === 'polline') ? 'flex' : 'none';

  // Aggiorna numerazione step se polline è visibile
  const num4 = document.getElementById('candNum4');
  const num5 = document.getElementById('candNum5');
  if(num4 && num5) {
    if(mode === 'polline') { num4.textContent = '4'; num5.textContent = '5'; }
    else { num4.textContent = '3'; num5.textContent = '4'; }
  }

  // Aggiorna badge "uso consigliato"
  const uso = document.getElementById('cand-r-uso');
  if(uso) {
    if(mode === 'polline') {
      uso.textContent = 'Fine inverno';
      uso.className = 'sci-uso-badge sci-uso-primavera';
    } else {
      uso.textContent = 'Inverno';
      uso.className = 'sci-uso-badge sci-uso-inverno';
    }
  }

  candCalc();
}

function candCalc() {
  const setText = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = v; };
  const get = (id) => document.getElementById(id)?.value;

  const hives = parseInt(get('cand-sl-hives') || 3);
  const grams = parseInt(get('cand-sl-grams') || 1000);
  const totale = hives * grams;

  setText('cand-out-hives', hives);
  setText('cand-out-grams', (grams / 1000).toFixed(1) + ' kg');

  // Ricetta:
  // CLASSICO:  82% zucchero a velo + 18% miele
  // POLLINE:   75% zucchero a velo + 15% miele + 10% polline
  // Acqua: max 1-2% del totale, opzionale (per regolare consistenza)
  let zucPct, mielePct, pollinePct;
  if(candMode === 'polline') {
    zucPct = 0.75;
    mielePct = 0.15;
    pollinePct = 0.10;
  } else {
    zucPct = 0.82;
    mielePct = 0.18;
    pollinePct = 0;
  }

  const zucchero = Math.round(totale * zucPct);
  const miele = Math.round(totale * mielePct);
  const polline = Math.round(totale * pollinePct);
  const acqua = Math.round(totale * 0.01); // ~1% opzionale

  setText('cand-r-zucchero', fmtNum(zucchero));
  setText('cand-r-miele', fmtNum(miele));
  setText('cand-r-acqua', fmtNum(acqua) + ' (max)');
  setText('cand-r-polline', fmtNum(polline));
  setText('cand-r-totale', fmtNum(totale));
}

// Helper per formattare numero con separatore migliaia
function fmtNum(n) {
  return Math.round(n).toLocaleString('it-IT');
}

// Init: imposta modalità default classico
document.addEventListener('DOMContentLoaded', () => {
  // Solo se siamo sulla pagina giusta
  if(document.getElementById('cand-btn-classico')) {
    candSetMode('classico');
  }
});
