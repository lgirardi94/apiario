/* ===========================================================
   PROPOLI — Calcolatore tintura alcolica/analcolica
   =========================================================== */


let propMode = 'alcolica'; // 'alcolica' | 'analcolica'


function showPropoliTab(tab, btn) {
  const tabs = ['calcolatore', 'procedimento', 'conservazione', 'usi'];
  tabs.forEach(t => {
    const el = document.getElementById('propTab' + t.charAt(0).toUpperCase() + t.slice(1));
    if(el) el.style.display = (t === tab) ? 'block' : 'none';
  });
  const parent = btn?.closest('.mag-tabs');
  if(parent) {
    parent.querySelectorAll('.mag-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  if(tab === 'calcolatore') propCalc();
}

function propSetMode(mode) {
  propMode = mode;
  document.getElementById('prop-btn-alcolica').classList.toggle('on-1to1', mode === 'alcolica');
  document.getElementById('prop-btn-analcolica').classList.toggle('on-2to1', mode === 'analcolica');

  // Mostra/nascondi blocchi output e gradazione
  document.getElementById('prop-output-alcolica').style.display = (mode === 'alcolica') ? 'block' : 'none';
  document.getElementById('prop-output-analcolica').style.display = (mode === 'analcolica') ? 'block' : 'none';
  document.getElementById('prop-grad-row').style.display = (mode === 'alcolica') ? 'flex' : 'none';

  propCalc();
}

function propCalc() {
  const setText = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = v; };
  const get = (id) => document.getElementById(id)?.value;

  const grams = parseInt(get('prop-sl-grams') || 100, 10);
  const concentrazione = parseFloat(get('prop-sl-conc') || 20);  // 10, 20, 30
  const gradPartenza = parseFloat(get('prop-sl-grad') || 95);    // 90, 95, 96

  setText('prop-out-grams', grams + ' g');

  if(propMode === 'alcolica') {
    // Calcolo volume tintura: grams (propoli) corrisponde alla % della tintura totale
    // Es: 100 g propoli + 400 ml alcool 70° = 500 ml tintura al 20%
    // → Volume_tintura_totale = grams / (concentrazione / 100)
    // → Volume_solvente = volume_tintura - grams (assumendo 1 g ≈ 1 ml come densità della propoli)
    // Più correttamente: tintura X% = X g di propoli su 100 ml di alcool diluito
    // Quindi: vol_alcool_70 = grams * (100 / concentrazione) - ipotesi di volume
    // In pratica si usa: massa_propoli (g) su volume_alcool (ml) come rapporto peso/volume

    // Formula pratica: per concentrazione X%, su 100 g propoli servono (100 - X) * 5 ml di alcool 70°
    // Più precisamente: peso/volume → 20 g propoli in 100 ml = 20% p/v
    // Quindi 100 g propoli al 20% = 500 ml di alcool 70°

    const volAlcool70 = Math.round(grams * (100 / concentrazione));

    // Diluizione: vol_finale × 70 = vol_alcool_puro × grad_partenza
    // → vol_alcool_puro = vol_finale × 70 / grad_partenza
    const volAlcoolPuro = Math.round(volAlcool70 * 70 / gradPartenza);
    const volAcqua = volAlcool70 - volAlcoolPuro;

    // Volume totale della tintura (propoli + solvente)
    const volTintura = volAlcool70 + Math.round(grams * 0.5); // propoli aggiunge volume parziale

    setText('prop-r-propoli', grams);
    setText('prop-r-totale', volAlcool70);
    setText('prop-r-conc', concentrazione + '%');
    setText('prop-r-alcool', volAlcoolPuro);
    setText('prop-r-acqua', volAcqua);

    // Barattolo consigliato (volume liquido × 1.3, arrotondato a misura standard)
    const barattoloIdeale = Math.ceil(volAlcool70 * 1.3);
    const misureStandard = [250, 500, 750, 1000, 1500, 2000];
    const barattolo = misureStandard.find(v => v >= barattoloIdeale) || (Math.ceil(barattoloIdeale/500)*500);
    setText('prop-r-barattolo', barattolo);

    setText('prop-r-tempo', '4 sett.');
    setText('prop-r-durata', '3-5 anni');

  } else {
    // ANALCOLICA - glicerica
    // Stessa logica peso/volume, ma con glicerina+acqua 60:40
    // Concentrazione consigliata leggermente diversa per glicerica (meno estrazione)
    // Usiamo le stesse % per coerenza ma è leggermente sottostimata l'estrazione effettiva

    const volTotale = Math.round(grams * (100 / concentrazione));
    const volGlicerina = Math.round(volTotale * 0.6);
    const volAcqua = volTotale - volGlicerina;

    setText('prop-r-propoli-an', grams);
    setText('prop-r-totale-an', volTotale);
    setText('prop-r-conc-an', concentrazione + '%');
    setText('prop-r-glicerina', volGlicerina);
    setText('prop-r-acqua-an', volAcqua);

    const barattoloIdeale = Math.ceil(volTotale * 1.3);
    const misureStandard = [250, 500, 750, 1000, 1500, 2000];
    const barattolo = misureStandard.find(v => v >= barattoloIdeale) || (Math.ceil(barattoloIdeale/500)*500);
    setText('prop-r-barattolo', barattolo);

    setText('prop-r-tempo', '6 sett.');
    setText('prop-r-durata', '12-18 mesi');
  }
}

// Init alla prima apertura: imposta modalità alcolica
document.addEventListener('DOMContentLoaded', () => {
  if(document.getElementById('prop-btn-alcolica')) {
    propSetMode('alcolica');
  }
});
