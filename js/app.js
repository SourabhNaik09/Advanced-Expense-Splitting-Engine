// ============================================================
//  Expense Simplifier — app.js
//  Graph-based debt optimization (net-balance reduction O(n log n))
// ============================================================

// ── STATE ────────────────────────────────────────────────────
let people      = [];
let expenses    = [];
let debts       = [];        // raw individual debt edges
let settlements = [];        // optimized settlement plan
let netBal      = {};        // net balance per person
let selectedSplit = new Set();

// ── COLOR PALETTE ────────────────────────────────────────────
const PALETTE = [
  '#ef4444', '#14b8a6', '#0ea5e9', '#f97316',
  '#84cc16', '#a855f7', '#ec4899', '#eab308',
  '#06b6d4', '#10b981',
];
const colorOf = (name) => PALETTE[people.indexOf(name) % PALETTE.length];

// ── TOAST ────────────────────────────────────────────────────
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── MODALS ───────────────────────────────────────────────────
function openModal(type) {
  if (type === 'expense' && people.length < 2) {
    toast('Add at least 2 people first'); return;
  }
  if (type === 'expense') {
    document.getElementById('inp-paidby').innerHTML =
      '<option value="">Select person</option>' +
      people.map(p => `<option>${p}</option>`).join('');
    selectedSplit = new Set(people);
    renderSplitChips();
  }
  document.getElementById('modal-' + type).classList.add('open');
  setTimeout(() => {
    const inp = document.getElementById(type === 'person' ? 'inp-pname' : 'inp-desc');
    if (inp) inp.focus();
  }, 100);
}

function closeModal(type) {
  document.getElementById('modal-' + type).classList.remove('open');
  if (type === 'person') document.getElementById('inp-pname').value = '';
  if (type === 'expense') {
    document.getElementById('inp-desc').value   = '';
    document.getElementById('inp-amt').value    = '';
    document.getElementById('inp-paidby').value = '';
  }
}

function renderSplitChips() {
  document.getElementById('split-chips').innerHTML = people.map(p => `
    <div class="split-chip ${selectedSplit.has(p) ? 'selected' : ''}"
         onclick="toggleChip('${p}')">
      <div class="pdot" style="background:${colorOf(p)};width:8px;height:8px"></div>
      ${p}
    </div>`).join('');
}

function toggleChip(p) {
  selectedSplit.has(p) ? selectedSplit.delete(p) : selectedSplit.add(p);
  renderSplitChips();
}

// ── SUBMIT PERSON ────────────────────────────────────────────
function submitPerson() {
  const n = document.getElementById('inp-pname').value.trim();
  if (!n)                { toast('Enter a name'); return; }
  if (people.includes(n)) { toast('Person already added'); return; }
  people.push(n);
  closeModal('person');
  recompute();
  toast(`${n} added ✓`);
}

// ── SUBMIT EXPENSE ───────────────────────────────────────────
function submitExpense() {
  const desc   = document.getElementById('inp-desc').value.trim() || 'Expense';
  const paidBy = document.getElementById('inp-paidby').value;
  const amount = parseFloat(document.getElementById('inp-amt').value);
  const split  = [...selectedSplit];

  if (!paidBy)                    { toast('Select who paid'); return; }
  if (!amount || amount <= 0)     { toast('Enter a valid amount'); return; }
  if (!split.length)              { toast('Select at least one person to split'); return; }

  expenses.push({ desc, paidBy, amount, split });
  closeModal('expense');
  recompute();
  toast(`"${desc}" added — ₹${amount.toFixed(2)} ✓`);
}

// ── REMOVE PERSON ────────────────────────────────────────────
function removePerson(name) {
  if (!confirm(`Remove ${name} from the group?`)) return;
  people   = people.filter(p => p !== name);
  expenses = expenses.filter(e => e.paidBy !== name && !e.split.includes(name));
  recompute();
  toast(`${name} removed`);
}

// ── REMOVE EXPENSE ───────────────────────────────────────────
function removeExpense(i) {
  const e = expenses[i];
  expenses.splice(i, 1);
  recompute();
  toast(`"${e.desc}" removed`);
}

// ── CLEAR ALL ────────────────────────────────────────────────
function clearAll() {
  if (!confirm('Clear all people and expenses?')) return;
  people = []; expenses = []; debts = []; settlements = []; netBal = {};
  recompute();
  toast('Cleared ✓');
}

// ── CORE ALGORITHM ───────────────────────────────────────────
function recompute() {
  // 1. Build raw debt edges from expenses
  debts = [];
  expenses.forEach(e => {
    const share = e.amount / e.split.length;
    e.split.forEach(p => {
      if (p !== e.paidBy) debts.push({ from: p, to: e.paidBy, amount: share, desc: e.desc });
    });
  });

  // 2. Net balance for each person
  netBal = {};
  people.forEach(p => netBal[p] = 0);
  debts.forEach(d => {
    netBal[d.to]   += d.amount;
    netBal[d.from] -= d.amount;
  });

  // 3. Greedy simplification — O(n log n)
  const cred = [], debt2 = [];
  people.forEach(p => {
    if (netBal[p] >  0.005) cred.push({ name: p, amount:  netBal[p] });
    if (netBal[p] < -0.005) debt2.push({ name: p, amount: -netBal[p] });
  });
  cred.sort((a, b)  => b.amount - a.amount);
  debt2.sort((a, b) => b.amount - a.amount);

  settlements = [];
  const c = cred.map(x  => ({ ...x }));
  const d = debt2.map(x => ({ ...x }));
  let ci = 0, di = 0;
  while (ci < c.length && di < d.length) {
    const pay = Math.min(c[ci].amount, d[di].amount);
    if (pay > 0.005) settlements.push({ from: d[di].name, to: c[ci].name, amount: pay });
    c[ci].amount -= pay;
    d[di].amount -= pay;
    if (c[ci].amount < 0.005) ci++;
    if (d[di].amount < 0.005) di++;
  }

  // Update status
  document.getElementById('algo-status').textContent = people.length
    ? `${people.length} people · ${expenses.length} expenses · ${settlements.length} optimized transactions`
    : 'No data';

  renderAll();
}

// ── RENDER ALL ───────────────────────────────────────────────
function renderAll() {
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  document.getElementById('sc-people').textContent = people.length;
  document.getElementById('sc-exp').textContent    = expenses.length;
  document.getElementById('sc-amt').textContent    = '₹' + total.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  document.getElementById('sc-opt').textContent    = people.length ? settlements.length : '—';
  document.getElementById('p-count').textContent   = people.length;
  document.getElementById('e-count').textContent   = expenses.length;

  renderPeople();
  renderExpenses();
  renderGraphs();
  renderBar();
  renderIndividual();
  renderSettlement();
}

// ── RENDER PEOPLE ────────────────────────────────────────────
function renderPeople() {
  const g = document.getElementById('people-grid');
  if (!people.length) {
    g.innerHTML = '<div class="empty-state"><p>No people yet</p><span>Click "Add Person" to start</span></div>';
    return;
  }
  g.innerHTML = people.map(p => `
    <div class="person-card">
      <div class="pdot" style="background:${colorOf(p)}"></div>
      <span>${p}</span>
      <button class="prm" onclick="removePerson('${p}')">×</button>
    </div>`).join('');
}

// ── RENDER EXPENSES ──────────────────────────────────────────
function renderExpenses() {
  const el = document.getElementById('exp-list');
  if (!expenses.length) {
    el.innerHTML = '<div class="empty-state" style="padding:32px"><p>No expenses logged</p><span>Click "Add Expense"</span></div>';
    return;
  }
  el.innerHTML = expenses.map((e, i) => `
    <div class="exp-row">
      <div>
        <div class="exp-desc">${e.desc}</div>
        <div class="exp-meta">
          <span class="exp-tag">Paid by <strong>${e.paidBy}</strong></span>
          <span class="exp-tag">Split: ${e.split.join(', ')}</span>
          <span class="exp-tag">₹${(e.amount / e.split.length).toFixed(2)}/person</span>
        </div>
      </div>
      <div class="exp-right">
        <span class="exp-amt">₹${e.amount.toFixed(2)}</span>
        <button class="btn btn-outline btn-sm" onclick="removeExpense(${i})">✕</button>
      </div>
    </div>`).join('');
}

// ── GRAPH CANVAS ─────────────────────────────────────────────
function getNodePositions(cvId) {
  const cv = document.getElementById(cvId);
  const W = cv.offsetWidth || 380, H = 280;
  const n = people.length;
  if (!n) return [];
  const r = Math.min(W, H) / 2 - 50;
  return people.map((p, i) => ({
    name:  p,
    color: colorOf(p),
    x: W / 2 + r * Math.cos(2 * Math.PI * i / n - Math.PI / 2),
    y: H / 2 + r * Math.sin(2 * Math.PI * i / n - Math.PI / 2),
  }));
}

function drawGraph(cvId, edges) {
  const cv  = document.getElementById(cvId);
  const ctx = cv.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W   = cv.offsetWidth || 380, H = 280;
  cv.width  = W * dpr; cv.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#f9fafb'; ctx.fillRect(0, 0, W, H);

  const nodes = getNodePositions(cvId);
  if (!nodes.length) {
    ctx.fillStyle = '#9ca3af'; ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Add people to see the graph', W / 2, H / 2);
    return;
  }

  // Aggregate edges
  const agg = {};
  edges.forEach(e => {
    const k = e.from + '__' + e.to;
    if (!agg[k]) agg[k] = { from: e.from, to: e.to, amount: 0 };
    agg[k].amount += e.amount;
  });
  const edgeArr = Object.values(agg);
  const maxAmt  = Math.max(...edgeArr.map(e => e.amount), 1);

  // Draw edges
  edgeArr.forEach(e => {
    const f = nodes.find(n => n.name === e.from);
    const t = nodes.find(n => n.name === e.to);
    if (!f || !t) return;

    const thick = 1 + (e.amount / maxAmt) * 4;
    const alpha = 0.25 + (e.amount / maxAmt) * 0.5;
    const mx = (f.x + t.x) / 2 + (t.y - f.y) * 0.22;
    const my = (f.y + t.y) / 2 - (t.x - f.x) * 0.22;

    ctx.beginPath();
    ctx.moveTo(f.x, f.y);
    ctx.quadraticCurveTo(mx, my, t.x, t.y);
    ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
    ctx.lineWidth   = thick;
    ctx.stroke();

    // Arrowhead
    const ang = Math.atan2(t.y - my, t.x - mx);
    const ax  = t.x - 23 * Math.cos(ang);
    const ay  = t.y - 23 * Math.sin(ang);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax - 9 * Math.cos(ang - 0.4), ay - 9 * Math.sin(ang - 0.4));
    ctx.lineTo(ax - 9 * Math.cos(ang + 0.4), ay - 9 * Math.sin(ang + 0.4));
    ctx.closePath();
    ctx.fillStyle = `rgba(99,102,241,${alpha + 0.15})`;
    ctx.fill();

    // Amount label
    ctx.font      = '10px Inter, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('₹' + Math.round(e.amount), mx, my - 10);
  });

  // Draw nodes
  nodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, 26, 0, Math.PI * 2);
    ctx.fillStyle = n.color + '20'; ctx.fill();

    ctx.beginPath();
    ctx.arc(n.x, n.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = n.color; ctx.fill();

    ctx.font      = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(n.name.slice(0, 2).toUpperCase(), n.x, n.y);

    const isTop = n.y < H / 2;
    ctx.font      = '500 11px Inter, sans-serif';
    ctx.fillStyle = '#1f2937';
    ctx.textAlign     = 'center';
    ctx.textBaseline  = isTop ? 'bottom' : 'top';
    ctx.fillText(n.name, n.x, isTop ? n.y - 24 : n.y + 24);
  });
}

function renderGraphs() {
  drawGraph('c-orig', debts);
  drawGraph('c-opt',  settlements);
}

// ── BAR CHART ────────────────────────────────────────────────
function renderBar() {
  const cv  = document.getElementById('c-bar');
  const ctx = cv.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W   = cv.offsetWidth || 600, H = 200;
  cv.width  = W * dpr; cv.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  if (!people.length) {
    ctx.fillStyle = '#9ca3af'; ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('No data to display', W / 2, H / 2);
    return;
  }

  const vals   = people.map(p => netBal[p] || 0);
  const maxAbs = Math.max(...vals.map(Math.abs), 0.01);
  const padL = 56, padR = 20, padT = 16, padB = 36;
  const barW  = Math.min(52, (W - padL - padR) / people.length - 10);
  const midY  = padT + (H - padT - padB) / 2;
  const chartH = (H - padT - padB) / 2;

  // Grid lines
  [-1, -0.5, 0, 0.5, 1].forEach(f => {
    const y = midY - f * chartH;
    ctx.strokeStyle = f === 0 ? '#374151' : '#e5e7eb';
    ctx.lineWidth   = f === 0 ? 1.5 : 0.5;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
    ctx.fillStyle     = '#9ca3af';
    ctx.font          = '10px Inter, sans-serif';
    ctx.textAlign     = 'right';
    ctx.textBaseline  = 'middle';
    ctx.fillText('₹' + Math.round(f * maxAbs), padL - 4, y);
  });

  // Bars
  people.forEach((p, i) => {
    const v     = vals[i];
    const slotW = (W - padL - padR) / people.length;
    const x     = padL + slotW * i + slotW / 2 - barW / 2;
    const bh    = Math.max(Math.abs(v / maxAbs) * chartH, 2);
    const y     = v >= 0 ? midY - bh : midY;

    const grad = ctx.createLinearGradient(x, y, x, y + bh);
    if (v >= 0) { grad.addColorStop(0, '#22c55e'); grad.addColorStop(1, '#16a34a'); }
    else        { grad.addColorStop(0, '#f87171'); grad.addColorStop(1, '#dc2626'); }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, bh, 4);
    ctx.fill();

    // Name label
    ctx.fillStyle    = '#374151';
    ctx.font         = '11px Inter, sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(p, x + barW / 2, H - padB + 6);

    // Value label
    ctx.fillStyle    = v >= 0 ? '#16a34a' : '#dc2626';
    ctx.font         = 'bold 10px Inter, sans-serif';
    ctx.textBaseline = v >= 0 ? 'bottom' : 'top';
    ctx.fillText('₹' + Math.round(Math.abs(v)), x + barW / 2, v >= 0 ? y - 3 : y + bh + 3);
  });
}

// ── INDIVIDUAL BALANCE CARDS ─────────────────────────────────
function renderIndividual() {
  const el = document.getElementById('ind-grid');
  if (!people.length) { el.innerHTML = '<div class="empty-state"><p>No data</p></div>'; return; }
  el.innerHTML = people.map(p => {
    const b   = netBal[p] || 0;
    const cls = b >  0.005 ? 'pos' : b < -0.005 ? 'neg' : 'zero';
    const sign = b > 0.005 ? '+' : '';
    const lbl  = b > 0.005 ? 'Gets back' : b < -0.005 ? 'Needs to pay' : 'Settled up ✓';
    return `
      <div class="ind-card ${cls}">
        <div class="ind-top">
          <div class="pdot" style="background:${colorOf(p)};width:11px;height:11px;border-radius:50%"></div>
          ${p}
        </div>
        <div class="ind-amt ${cls}">${sign}₹${Math.abs(b).toFixed(2)}</div>
        <div class="ind-lbl">${lbl}</div>
      </div>`;
  }).join('');
}

// ── SETTLEMENT PLAN ──────────────────────────────────────────
function renderSettlement() {
  const orig = debts.length, opt = settlements.length;
  const pct  = orig > 0 ? Math.round((orig - opt) / orig * 100) : 0;
  const saved = orig - opt;

  document.getElementById('sh-n').textContent     = opt  || '—';
  document.getElementById('sh-d').textContent     = orig || '—';
  document.getElementById('sh-pct').textContent   = pct + '%';
  document.getElementById('sh-saved').textContent = saved > 0
    ? `Saved ${saved} transactions with graph optimization`
    : 'Add expenses to compute';

  // Settlement rows
  const sr = document.getElementById('settle-rows');
  sr.innerHTML = settlements.length
    ? settlements.map((s, i) => `
        <div class="settle-row" style="animation-delay:${i * 0.05}s">
          <div class="settle-names">
            <div class="sname">
              <div class="pdot" style="background:${colorOf(s.from)};width:11px;height:11px;border-radius:50%"></div>
              ${s.from}
            </div>
            <span class="sarrow">→</span>
            <div class="sname">
              <div class="pdot" style="background:${colorOf(s.to)};width:11px;height:11px;border-radius:50%"></div>
              ${s.to}
            </div>
          </div>
          <div class="samount">₹${s.amount.toFixed(2)}</div>
        </div>`).join('')
    : '<div class="empty-state"><p>No settlements yet</p><span>Add expenses to compute the plan</span></div>';

  // Original transactions
  const or = document.getElementById('orig-rows');
  or.innerHTML = debts.length
    ? debts.map(d => `
        <div class="orig-row">
          <div class="orig-names">
            <div class="pdot" style="background:${colorOf(d.from)};width:9px;height:9px;border-radius:50%"></div>
            <span style="font-weight:500">${d.from}</span>
            <span style="margin:0 8px;color:#9ca3af">→</span>
            <div class="pdot" style="background:${colorOf(d.to)};width:9px;height:9px;border-radius:50%"></div>
            <span style="font-weight:500">${d.to}</span>
            <span style="margin-left:8px;font-size:11px;color:#9ca3af">${d.desc}</span>
          </div>
          <span class="orig-amt">₹${d.amount.toFixed(2)}</span>
        </div>`).join('')
    : '<div class="empty-state" style="padding:24px"><p>No transactions</p></div>';
}

// ── TAB SWITCHING ────────────────────────────────────────────
function switchTab(t) {
  document.querySelectorAll('.tab').forEach((btn, i) => {
    btn.classList.toggle('active', ['setup', 'graph', 'analysis', 'settlement'][i] === t);
  });
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + t).classList.add('active');
  if (t === 'graph' || t === 'analysis') {
    setTimeout(() => { renderGraphs(); renderBar(); renderIndividual(); }, 80);
  }
}

// ── RESPONSIVE RESIZE ────────────────────────────────────────
window.addEventListener('resize', () => {
  renderGraphs();
  renderBar();
});

// ── DEMO DATA ────────────────────────────────────────────────
people = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
expenses = [
  { desc: 'Hotel',     paidBy: 'Eve',     amount: 150, split: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'] },
  { desc: 'Dinner',    paidBy: 'Diana',   amount: 100, split: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'] },
  { desc: 'Taxi',      paidBy: 'Eve',     amount: 60,  split: ['Alice', 'Bob', 'Charlie'] },
  { desc: 'Groceries', paidBy: 'Diana',   amount: 80,  split: ['Diana', 'Eve', 'Bob'] },
  { desc: 'Museum',    paidBy: 'Bob',     amount: 50,  split: ['Alice', 'Bob', 'Charlie', 'Diana'] },
  { desc: 'Lunch',     paidBy: 'Charlie', amount: 90,  split: ['Alice', 'Charlie', 'Eve'] },
  { desc: 'Fuel',      paidBy: 'Alice',   amount: 70,  split: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'] },
  { desc: 'Snacks',    paidBy: 'Eve',     amount: 95,  split: ['Bob', 'Charlie', 'Diana', 'Eve'] },
];
recompute();
