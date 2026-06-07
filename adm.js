const SCRIPT = `function doGet(e) {
  const action = e.parameter.action;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  if (action === 'getAll') {
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      let obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
    return out({ success: true, data: rows });
  }

  if (action === 'delete') {
    const num = e.parameter.numero;
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(num)) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return out({ success: true });
  }

  return out({ success: false, error: 'Unknown action' });
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  const existing = sheet.getDataRange().getValues();
  for (let i = 1; i < existing.length; i++) {
    if (String(existing[i][0]) === String(data.numero)) {
      return out({ success: false, error: 'Número já vendido!' });
    }
  }
  sheet.appendRow([data.numero, data.nome, data.telefone, data.data]);
  return out({ success: true });
}

function out(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}`;

document.getElementById('script-code').textContent = SCRIPT;

const SHEETS_URL_FIXED = "COLE_SUA_URL_AQUI";
let sheetsUrl = SHEETS_URL_FIXED;
let sold = {};
let allRows = [];
let selNum = null;

document.getElementById('cfg-url').value = sheetsUrl !== "COLE_SUA_URL_AQUI" ? sheetsUrl : '';
document.getElementById('f-date').value = new Date().toISOString().split('T')[0];

// ---- LOAD ----
async function loadAll() {
  if (!sheetsUrl) return showMsg('tbl-msg', 'load', 'Configure a URL do Google Sheets primeiro.');
  showMsg('tbl-msg', 'load', 'Carregando...');
  try {
    const r = await fetch(sheetsUrl + '?action=getAll&_=' + Date.now());
    const d = await r.json();
    sold = {};
    allRows = [];
    if (d.success && d.data) {
      d.data.forEach(row => { if (row.numero) { sold[String(row.numero)] = row; allRows.push(row); } });
      allRows.sort((a, b) => Number(a.numero) - Number(b.numero));
    }
    renderTable(allRows);
    buildGrid();
    updateStats();
    showMsg('tbl-msg', 'ok', '✓ ' + allRows.length + ' registros carregados.');
    setTimeout(() => hideMsg('tbl-msg'), 2000);
  } catch(e) {
    showMsg('tbl-msg', 'err', '✗ Erro de conexão.');
  }
}

// ---- GRID ----
function buildGrid() {
  const g = document.getElementById('admin-grid');
  g.innerHTML = '';
  for (let i = 1; i <= 200; i++) {
    const b = document.createElement('button');
    const isSold = !!sold[String(i)];
    b.className = 'ng-btn ' + (isSold ? 'sold' : 'available') + (selNum === i ? ' sel' : '');
    b.id = 'ng-' + i;
    b.textContent = i;
    if (!isSold) b.onclick = () => pickNum(i);
    g.appendChild(b);
  }
}

function pickNum(n) {
  if (selNum) { const p = document.getElementById('ng-' + selNum); if (p) p.classList.remove('sel'); }
  selNum = n;
  const b = document.getElementById('ng-' + n);
  if (b) b.classList.add('sel');
  document.getElementById('sel-label').textContent = 'Número ' + n;
}

// ---- STATS ----
function updateStats() {
  const s = Object.keys(sold).length;
  document.getElementById('s-sold').textContent = s;
  document.getElementById('s-avail').textContent = 200 - s;
  const pct = Math.round(s / 200 * 100);
  document.getElementById('s-pct').textContent = pct + '%';
  document.getElementById('s-bar').style.width = pct + '%';
  document.getElementById('s-val').textContent = 'R$' + (s * 10);
}

// ---- REGISTER ----
async function register() {
  const name = document.getElementById('f-name').value.trim();
  const phone = document.getElementById('f-phone').value.trim();
  const date = document.getElementById('f-date').value;
  if (!selNum) return showMsg('reg-msg', 'err', 'Selecione um número na grade.');
  if (!name) return showMsg('reg-msg', 'err', 'Informe o nome do comprador.');
  if (!sheetsUrl) return showMsg('reg-msg', 'err', 'Configure a URL do Google Sheets primeiro.');
  showMsg('reg-msg', 'load', 'Salvando...');
  try {
    const r = await fetch(sheetsUrl, {
      method: 'POST',
      body: JSON.stringify({ numero: selNum, nome: name, telefone: phone, data: date })
    });
    const d = await r.json();
    if (d.success) {
      showMsg('reg-msg', 'ok', '✓ Número ' + selNum + ' registrado para ' + name + '!');
      document.getElementById('f-name').value = '';
      document.getElementById('f-phone').value = '';
      selNum = null;
      document.getElementById('sel-label').textContent = 'nenhum';
      await loadAll();
    } else {
      showMsg('reg-msg', 'err', '✗ ' + (d.error || 'Erro ao salvar.'));
    }
  } catch(e) { showMsg('reg-msg', 'err', '✗ Erro de conexão.'); }
}

// ---- TABLE ----
function renderTable(rows) {
  const tb = document.getElementById('tbody');
  if (!rows.length) {
    tb.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#ccc;padding:2rem;">Nenhum registro</td></tr>';
    return;
  }
  tb.innerHTML = rows.map(r => {
    const d = r.data ? String(r.data).split('-').reverse().join('/') : '-';
    return `<tr>
      <td><span class="badge">${r.numero}</span></td>
      <td>${r.nome||'-'}</td>
      <td>${r.telefone||'-'}</td>
      <td>${d}</td>
      <td><button class="del-btn" onclick="del('${r.numero}')">✕</button></td>
    </tr>`;
  }).join('');
}

function filterTable() {
  const q = document.getElementById('search').value.toLowerCase();
  renderTable(allRows.filter(r =>
    (r.nome||'').toLowerCase().includes(q) || String(r.numero).includes(q)
  ));
}

async function del(num) {
  if (!confirm('Remover número ' + num + '?')) return;
  showMsg('tbl-msg', 'load', 'Removendo...');
  try {
    const r = await fetch(sheetsUrl + '?action=delete&numero=' + num);
    const d = await r.json();
    if (d.success) { await loadAll(); showMsg('tbl-msg', 'ok', '✓ Removido.'); }
  } catch(e) { showMsg('tbl-msg', 'err', '✗ Erro.'); }
}

// ---- CONFIG ----
function saveCfg() {
  const url = document.getElementById('cfg-url').value.trim();
  if (!url) return showMsg('cfg-msg', 'err', 'Cole a URL da Web App.');
  sheetsUrl = url;
  showMsg('cfg-msg', 'ok', '✓ URL aplicada! Lembre-se de colar também no rifa.html e salvar o arquivo.');
  setTimeout(() => { loadAll(); buildGrid(); }, 800);
}

// ---- HELPERS ----
function showMsg(id, type, txt) {
  const el = document.getElementById(id);
  el.className = 'msg ' + type;
  el.textContent = txt;
}
function hideMsg(id) { document.getElementById(id).style.display = 'none'; }

// INIT
buildGrid();
updateStats();
if (sheetsUrl && sheetsUrl !== "COLE_SUA_URL_AQUI") loadAll();