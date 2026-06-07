const SHEETS_URL = "LINKDOBANCODEDADOS";
let sold = {};

async function load() {
  if (SHEETS_URL && SHEETS_URL !== "COLE_SUA_URL_AQUI") {
    try {
      const r = await fetch(SHEETS_URL + '?action=getAll&_=' + Date.now());
      const d = await r.json();
      if (d.success && d.data) {
        d.data.forEach(row => { if (row.numero) sold[String(row.numero)] = row; });
      }
    } catch(e) {}
  }
  build();
  document.getElementById('load-msg').style.display = 'none';
}

function build() {
  const g = document.getElementById('numbers-grid');
  g.innerHTML = '';
  for (let i = 1; i <= 200; i++) {
    const b = document.createElement('button');
    b.className = 'num-btn ' + (sold[String(i)] ? 'sold' : 'available');
    b.textContent = i;
    b.onclick = () => openModal(i);
    g.appendChild(b);
  }
}

function openModal(n) {
  const info = sold[String(n)];
  const circle = document.getElementById('m-circle');
  circle.textContent = n;
  circle.className = 'modal-circle ' + (info ? 'sold' : 'available');
  document.getElementById('m-title').textContent = info ? 'Número vendido' : 'Número ' + n + ' disponível!';
  document.getElementById('m-sub').textContent = info ? 'Este número já foi reservado.' : 'Pague via PIX para garantir este número.';
  const mi = document.getElementById('m-info');
  const mp = document.getElementById('m-pix');
  if (info) {
    mi.style.display = 'block'; mp.style.display = 'none';
    const d = info.data ? String(info.data).split('-').reverse().join('/') : '-';
    mi.innerHTML = `
      <div class="modal-info-row"><span class="k">Comprador</span><span class="v">${info.nome||'-'}</span></div>
      <div class="modal-info-row"><span class="k">Telefone</span><span class="v">${info.telefone||'-'}</span></div>
      <div class="modal-info-row"><span class="k">Data</span><span class="v">${d}</span></div>`;
  } else {
    mi.style.display = 'none'; mp.style.display = 'block';
  }
  document.getElementById('modal').classList.add('open');
}

load();