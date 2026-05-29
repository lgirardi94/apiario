// ===== FILE VERSION: 2026-05-28.1 · versioni.js =====
/* ===========================================================
   REGISTRO VERSIONI FILE
   Ogni volta che si modifica un file, aggiornare qui la sua versione
   (formato: AAAA-MM-GG.progressivo). Serve per controllare che i file
   pubblicati su GitHub siano allineati a quelli sviluppati.
   =========================================================== */

const FILE_VERSIONS = {
  // HTML
  'apiario.html (index.html)': '2026-05-28.7',
  'visita_rapida.html':        '2026-05-28.1',
  'inserimento_rapido.html':   '2026-05-28.2',
  'etichette.html':            '2026-05-28.1',
  // Core
  'shared.js':                 '2026-05-28.1',
  'js/state.js':               '2026-05-28.1',
  'js/nav.js':                 '2026-05-28.2',
  // Sezioni
  'js/home.js':                '2026-05-28.2',
  'js/arnie.js':               '2026-05-28.5',
  'js/registro.js':            '2026-05-28.2',
  'js/magazzino.js':           '2026-05-28.3',
  'js/contabilita.js':         '2026-05-28.2',
  'js/necessita.js':           '2026-05-28.5',
  'js/obiettivi.js':           '2026-05-28.1',
  // Utility / calcolatori
  'js/calcolatori.js':         '2026-05-28.1',
  'js/report.js':              '2026-05-28.1',
  'js/insights.js':            '2026-05-28.4',
  'js/ricerca.js':             '2026-05-28.1',
  'js/filtri.js':              '2026-05-28.1',
  // Infrastruttura
  'js/drive-app.js':           '2026-05-28.1',
  'js/import-export.js':       '2026-05-28.1',
  'js/versioni.js':            '2026-05-28.1',
};

// Versione "build" complessiva dell'app (la più recente tra tutte)
const APP_BUILD = '2026-05-28.7';

function mostraVersioniFile() {
  try {
    const existing = document.getElementById('versioniOverlay');
    if(existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'versioniOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(26,18,8,0.55);z-index:2000;display:flex;align-items:center;justify-content:center;padding:1rem';

    const righe = Object.entries(FILE_VERSIONS).map(([file, ver]) => `
      <tr>
        <td style="padding:0.35rem 0.6rem;border-bottom:1px solid #F0E6CC;font-family:monospace;font-size:0.82rem">${file}</td>
        <td style="padding:0.35rem 0.6rem;border-bottom:1px solid #F0E6CC;font-family:monospace;font-size:0.82rem;text-align:right;color:#5C3A10;font-weight:600">${ver}</td>
      </tr>`).join('');

    overlay.innerHTML = `
      <div style="background:white;border-radius:8px;padding:1.5rem;width:100%;max-width:520px;max-height:82vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)">
        <h3 style="font-family:'Playfair Display',serif;font-size:1.2rem;color:#5C3A10;margin:0 0 0.3rem">🏷️ Versioni dei file</h3>
        <p style="font-size:0.83rem;color:#8A6D3B;margin:0 0 1rem">Build app: <strong>${APP_BUILD}</strong> · Confronta con le versioni indicate in cima a ogni file su GitHub per verificare che sia tutto allineato.</p>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <th style="text-align:left;padding:0.4rem 0.6rem;border-bottom:2px solid #C8860A;font-size:0.78rem;color:#6B4A20;text-transform:uppercase">File</th>
            <th style="text-align:right;padding:0.4rem 0.6rem;border-bottom:2px solid #C8860A;font-size:0.78rem;color:#6B4A20;text-transform:uppercase">Versione attesa</th>
          </tr>
          ${righe}
        </table>
        <div style="margin-top:1rem;display:flex;gap:0.5rem">
          <button onclick="copiaVersioni()" style="flex:1;padding:0.6rem;background:white;border:1.5px solid #C8860A;border-radius:6px;font-weight:600;color:#5C3A10;cursor:pointer;font-family:inherit">📋 Copia elenco</button>
          <button onclick="document.getElementById('versioniOverlay').remove()" style="flex:1;padding:0.6rem;background:#C8860A;border:none;border-radius:6px;font-weight:700;color:#1A1208;cursor:pointer;font-family:inherit">Chiudi</button>
        </div>
      </div>`;

    overlay.addEventListener('click', e => { if(e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  } catch(err) {
    console.error('[Versioni] Errore in mostraVersioniFile:', err.message);
  }
}

function copiaVersioni() {
  try {
    const testo = `IL MIO APIARIO — Versioni file (build ${APP_BUILD})\n` +
      '═'.repeat(48) + '\n' +
      Object.entries(FILE_VERSIONS).map(([f, v]) => `${v}  ${f}`).join('\n');
    if(navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(testo).then(
        () => { if(typeof showImportToast === 'function') showImportToast('📋 Elenco versioni copiato'); },
        () => alert(testo)
      );
    } else {
      alert(testo);
    }
  } catch(err) {
    console.error('[Versioni] Errore in copiaVersioni:', err.message);
  }
}
