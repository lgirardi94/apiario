// ============================================================
//  shared.js — Funzioni comuni a index.html e inserimento_rapido.html
//  Google Drive API + costanti + utility
// ============================================================

// ===== COSTANTI =====
const CLIENT_ID    = '256459531928-rg44b3eo4a3hatfmuf4jevck631uir6o.apps.googleusercontent.com';
const SCOPES       = 'https://www.googleapis.com/auth/drive.appdata';
const FILENAME_DB  = 'apiario_db.json';
const FILENAME_MAG = 'apiario_magazzino.json';
const FILENAME_CONT = 'apiario_contabilita.json';
const FILENAME_OB  = 'apiario_obiettivi.json';

// ===== CATEGORIE CONTABILI =====
const CAT_ENTRATA = [
  { id: 'vendita_miele',  label: '🍯 Vendita miele' },
  { id: 'vendita_nuclei', label: '🐝 Vendita nuclei/regine' },
  { id: 'vendita_cera',   label: '🌿 Vendita cera/propoli' },
  { id: 'contributi',     label: '📦 Contributi/premi' },
  { id: 'altro_ricavo',   label: '💰 Altro ricavo' },
];
const CAT_USCITA = [
  { id: 'farmaci',        label: '💊 Farmaci/trattamenti' },
  { id: 'alimentazione',  label: '🍬 Alimentazione' },
  { id: 'attrezzatura',   label: '🔧 Attrezzatura' },
  { id: 'arnie',          label: '🏠 Arnie e accessori' },
  { id: 'trasporti',      label: '🚗 Carburante/trasporti' },
  { id: 'burocrazia',     label: '📋 Costi burocratici' },
  { id: 'altro_costo',    label: '💡 Altro costo' },
];

// ===== ISPEZIONE — costanti condivise =====
const TELAINO_OPZIONI = [
  { value: '',                  label: '—',                    short: '?',   color: '#eee',     textColor: '#aaa' },
  { value: 'covata',            label: '🟤 Covata',             short: 'C',   color: '#8B5E2A',  textColor: 'white' },
  { value: 'covata_opercolata', label: '🔵 Cov. opercolata',    short: 'CO',  color: '#C8860A',  textColor: 'white' },
  { value: 'scorte',            label: '🟡 Scorte',             short: 'S',   color: '#F5C842',  textColor: '#2A1A05' },
  { value: 'cov_scorte',        label: '🟠 Cov. + scorte',      short: 'C+S', color: '#6BA05A',  textColor: 'white' },
  { value: 'cov_op_scorte',     label: '🟣 Cov. Op. + scorte',  short: 'CO+S',color: '#7B4FA6',  textColor: 'white' },
  { value: 'foglio_cereo',      label: '🟨 Foglio cereo',       short: 'FC',  color: '#e3f2fd',  textColor: '#2C5F8A', borderColor: '#2C5F8A' },
];
const CELLE_REALI_LABEL = ['0','1-2','3-5','6-10','11-20','Oltre 20'];
const COVATA_LABEL      = ['—','Scarsa','Rada','Discreta','Buona','Ottima'];
const SCORTE_LABEL      = ['—','Scarse','Limitate','Sufficienti','Buone','Abbondanti'];

function getTelainoInfo(tipo) {
  return TELAINO_OPZIONI.find(t => t.value === tipo) || TELAINO_OPZIONI[0];
}

/**
 * Rende la mappa telaini come HTML inline
 */
function renderTelainiVisualHTML(mappa) {
  if(!mappa || !mappa.length) return '';
  const blocchi = mappa.map((tipo, i) => {
    const info = getTelainoInfo(tipo);
    const border = info.borderColor ? `border:1.5px solid ${info.borderColor};` : 'border:1px solid rgba(0,0,0,0.12);';
    return `<div style="width:30px;height:48px;border-radius:3px;${border}background:${info.color};color:${info.textColor};display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:0.6rem;font-weight:700;position:relative" title="T${i+1}: ${info.label}">
      ${info.short}<span style="position:absolute;bottom:2px;font-size:0.55rem;opacity:0.7">${i+1}</span>
    </div>`;
  }).join('');
  // Legenda compatta dei tipi presenti
  const tipiPresenti = [...new Set(mappa.filter(t => t))];
  const legenda = tipiPresenti.length === 0 ? '' :
    `<div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.5rem;font-size:0.78rem;color:#6B4A20">
      ${tipiPresenti.map(t => {
        const info = getTelainoInfo(t);
        return `<span style="display:flex;align-items:center;gap:0.3rem"><span style="width:12px;height:12px;border-radius:2px;background:${info.color};${info.borderColor?'border:1px solid '+info.borderColor:''};display:inline-block"></span>${info.label}</span>`;
      }).join('')}
    </div>`;
  return `<div style="display:flex;gap:3px;margin-top:0.5rem;flex-wrap:wrap">${blocchi}</div>${legenda}`;
}

/**
 * Genera un link "Aggiungi a Google Calendar" per un evento
 */
function buildGCalLink({ title, date, durationHours = 1, description = '', location = '' }) {
  // Formato: YYYYMMDDTHHMMSSZ
  const d = new Date(date + 'T09:00:00');
  const pad = n => String(n).padStart(2,'0');
  const fmt = dt => `${dt.getUTCFullYear()}${pad(dt.getUTCMonth()+1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00Z`;
  const end = new Date(d.getTime() + durationHours * 3600000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${fmt(d)}/${fmt(end)}`,
    details: description,
    location
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Mostra il popup "Schedula prossima visita"
 * arniaNome: stringa es. "#2 — Regina"
 * onClose: callback opzionale chiamata alla chiusura
 */
function showCalendarPopup(arniaNome, onClose) {
  // Rimuovi eventuale popup precedente
  const existing = document.getElementById('calendarPopupOverlay');
  if(existing) existing.remove();

  // Data suggerita = oggi + 14 giorni
  const suggested = new Date();
  suggested.setDate(suggested.getDate() + 14);
  const suggestedStr = suggested.toISOString().slice(0,10);

  const overlay = document.createElement('div');
  overlay.id = 'calendarPopupOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(26,18,8,0.55);z-index:2000;display:flex;align-items:center;justify-content:center;padding:1rem;animation:fadeIn 0.2s ease';

  overlay.innerHTML = `
    <div style="background:white;border-radius:8px;padding:1.8rem;width:100%;max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:fadeIn 0.25s ease">
      <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:1.2rem">
        <span style="font-size:1.5rem">📅</span>
        <h3 style="font-family:'Playfair Display',serif;font-size:1.2rem;color:#5C3A10;margin:0">Schedula prossima visita</h3>
      </div>
      <div style="font-size:0.88rem;color:#6B4A20;margin-bottom:1.2rem;padding:0.6rem 0.9rem;background:#FDF3DC;border-radius:6px;border-left:3px solid #C8860A">
        🐝 Arnia ${arniaNome}
      </div>
      <div style="margin-bottom:1rem">
        <label style="display:block;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6B4A20;margin-bottom:0.4rem">Data prossima visita</label>
        <input type="date" id="calPopupData" value="${suggestedStr}"
          style="width:100%;padding:0.75rem 1rem;border:1.5px solid #F0E6CC;border-radius:6px;font-size:1rem;color:#2A1A05;background:white;font-family:inherit;box-sizing:border-box">
      </div>
      <div style="margin-bottom:1.4rem">
        <label style="display:block;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6B4A20;margin-bottom:0.4rem">Note per la prossima visita (opzionale)</label>
        <textarea id="calPopupNote" placeholder="Es. Controllare celle reali, verificare scorte, trattamento varroa..."
          style="width:100%;padding:0.75rem 1rem;border:1.5px solid #F0E6CC;border-radius:6px;font-size:0.95rem;color:#2A1A05;background:white;resize:none;height:80px;font-family:inherit;box-sizing:border-box"></textarea>
      </div>
      <div style="display:flex;gap:0.7rem">
        <button id="calPopupSkip"
          style="flex:1;padding:0.75rem;background:white;border:1.5px solid #F0E6CC;border-radius:6px;font-size:0.95rem;font-weight:600;color:#6B4A20;cursor:pointer">
          Salta
        </button>
        <button id="calPopupAdd"
          style="flex:2;padding:0.75rem;background:#C8860A;border:none;border-radius:6px;font-size:0.95rem;font-weight:700;color:#1A1208;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.5rem">
          📅 Aggiungi al Calendario
        </button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  const close = () => {
    overlay.remove();
    if(onClose) onClose();
  };

  document.getElementById('calPopupSkip').onclick = close;
  overlay.addEventListener('click', e => { if(e.target === overlay) close(); });

  document.getElementById('calPopupAdd').onclick = () => {
    const data  = document.getElementById('calPopupData').value;
    const note  = document.getElementById('calPopupNote').value.trim();
    if(!data) { alert('Seleziona una data'); return; }

    const desc = [
      `Visita apiario - Arnia ${arniaNome}`,
      note ? `\nNote: ${note}` : '',
      '\nRegistrato con Il Mio Apiario 🐝'
    ].filter(Boolean).join('');

    const link = buildGCalLink({
      title:       `🐝 Visita apiario — Arnia ${arniaNome}`,
      date:        data,
      durationHours: 1,
      description: desc
    });
    window.open(link, '_blank');
    close();
  };
}

// ===== UTILITY =====
function fmt(n) {
  return parseFloat(n || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  const mesi = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
  return `${parseInt(day)} ${mesi[parseInt(m) - 1]} ${y}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Calcola la giacenza attuale di un articolo
 * sommando entrate, sottraendo uscite, impostando rettifiche
 */
function getGiacenza(articoloId, movimentazioni) {
  return (movimentazioni || [])
    .filter(m => m.articoloId === articoloId)
    .reduce((sum, m) => {
      if (m.tipo === 'entrata')   return sum + parseFloat(m.qta || 0);
      if (m.tipo === 'uscita')    return sum - parseFloat(m.qta || 0);
      if (m.tipo === 'rettifica') return parseFloat(m.qta || 0);
      return sum;
    }, 0);
}

// ===== GOOGLE DRIVE =====
let _driveToken = null;
let _tokenClient = null;

/**
 * Inizializza Google Identity Services.
 * @param {Function} onSuccess - chiamata dopo login + caricamento dati riuscito
 * @param {Function} onTokenSaved - chiamata se trovato token salvato (per mostrare spinner)
 * @param {Function} onTokenFailed - chiamata se token salvato non è più valido
 */
function initDrive(onSuccess, onTokenSaved, onTokenFailed) {
  if (typeof google === 'undefined') return;

  _tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: async (resp) => {
      if (resp.error) {
        console.error('Drive auth error:', resp.error);
        return;
      }
      _driveToken = resp.access_token;
      localStorage.setItem('driveAccessToken', _driveToken);
      if (onSuccess) await onSuccess();
    }
  });

  const saved = localStorage.getItem('driveAccessToken');
  if (saved) {
    _driveToken = saved;
    if (onTokenSaved) onTokenSaved();
    onSuccess && onSuccess().catch(() => {
      _driveToken = null;
      localStorage.removeItem('driveAccessToken');
      if (onTokenFailed) onTokenFailed();
    });
  }
}

function driveLogin() {
  if (!_tokenClient) { console.warn('tokenClient non pronto'); return; }
  _tokenClient.requestAccessToken();
}

function driveLogout() {
  if (_driveToken) google.accounts.oauth2.revoke(_driveToken);
  _driveToken = null;
  localStorage.removeItem('driveAccessToken');
}

function getDriveToken() { return _driveToken; }

async function _driveApiCall(url, options = {}) {
  const resp = await fetch(url, {
    ...options,
    headers: {
      'Authorization': 'Bearer ' + _driveToken,
      ...(options.headers || {})
    }
  });
  if (resp.status === 401) {
    _driveToken = null;
    localStorage.removeItem('driveAccessToken');
    throw new Error('DRIVE_UNAUTHORIZED');
  }
  return resp;
}

async function driveFindFile(name) {
  const r = await _driveApiCall(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${name}'&fields=files(id,name,modifiedTime)`
  );
  const d = await r.json();
  return d.files && d.files.length > 0 ? d.files[0] : null;
}

async function driveReadFile(name) {
  const f = await driveFindFile(name);
  if (!f) return null;
  const r = await _driveApiCall(`https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`);
  return await r.json();
}

async function driveWriteFile(name, payload) {
  const f = await driveFindFile(name);
  const url = f
    ? `https://www.googleapis.com/upload/drive/v3/files/${f.id}?uploadType=multipart`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;
  const method = f ? 'PATCH' : 'POST';
  const meta = { name, ...(!f ? { parents: ['appDataFolder'] } : {}) };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }));
  form.append('file', new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  await _driveApiCall(url, { method, body: form });
}

/**
 * Carica tutti e tre i file Drive in parallelo.
 * Restituisce { db, mag, cont } — null se il file non esiste ancora.
 */
async function driveLoadAll() {
  const [db, mag, cont, ob] = await Promise.all([
    driveReadFile(FILENAME_DB),
    driveReadFile(FILENAME_MAG),
    driveReadFile(FILENAME_CONT),
    driveReadFile(FILENAME_OB)
  ]);
  return { db, mag, cont, ob };
}

/**
 * Salva tutti e tre i file Drive in parallelo.
 * @param {Object} db   - { arnie, logBook }
 * @param {Object} mag  - { articoli, movimentazioni }
 * @param {Object} cont - { movimentiContabili }
 */
async function driveSaveAll(db, mag, cont, ob) {
  const ts = new Date().toISOString();
  await Promise.all([
    driveWriteFile(FILENAME_DB,   { version: 1, savedAt: ts, ...db }),
    driveWriteFile(FILENAME_MAG,  { version: 1, savedAt: ts, ...mag }),
    driveWriteFile(FILENAME_CONT, { version: 1, savedAt: ts, ...cont }),
    driveWriteFile(FILENAME_OB,   { version: 1, savedAt: ts, ...ob })
  ]);
}
