// SikaTrack v0.1 — simple bookkeeping for Ghanaian small businesses.
// All data lives in localStorage on this device. Nothing is sent anywhere.

const KEY = 'sikatrack.entries.v1';

const SALE_CATEGORIES = ['Provisions', 'Foodstuffs', 'Drinks', 'Services', 'Other'];
const EXPENSE_CATEGORIES = ['Stock / Inventory', 'Transport', 'Airtime & Data', 'Rent', 'Utilities', 'Other'];

let entries = load();
let formType = 'sale';

const $ = (id) => document.getElementById(id);

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch (e) {
    return [];
  }
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

function formatGHS(n) {
  return 'GH₵' + Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Local YYYY-MM-DD (avoids UTC shifting the day).
function dateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function weekStartStr() {
  const d = new Date();
  const offset = (d.getDay() + 6) % 7; // Monday = start of week
  d.setDate(d.getDate() - offset);
  return dateStr(d);
}

function monthStartStr() {
  const d = new Date();
  d.setDate(1);
  return dateStr(d);
}

function sumsSince(start) {
  let sales = 0;
  let expenses = 0;
  for (const e of entries) {
    if (e.date >= start) {
      if (e.type === 'sale') sales += e.amount;
      else expenses += e.amount;
    }
  }
  return { sales, expenses, profit: sales - expenses };
}

function dayLabel(date) {
  const today = dateStr(new Date());
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = dateStr(y);
  if (date === today) return 'Today';
  if (date === yesterday) return 'Yesterday';
  return new Date(date + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function render() {
  const today = dateStr(new Date());
  const t = sumsSince(today);
  const w = sumsSince(weekStartStr());
  const m = sumsSince(monthStartStr());

  $('salesToday').textContent = formatGHS(t.sales);
  $('expensesToday').textContent = formatGHS(t.expenses);
  $('profitToday').textContent = formatGHS(t.profit);

  $('sumSalesToday').textContent = formatGHS(t.sales);
  $('sumExpToday').textContent = formatGHS(t.expenses);
  $('sumProfitToday').textContent = formatGHS(t.profit);
  $('sumSalesWeek').textContent = formatGHS(w.sales);
  $('sumExpWeek').textContent = formatGHS(w.expenses);
  $('sumProfitWeek').textContent = formatGHS(w.profit);
  $('sumSalesMonth').textContent = formatGHS(m.sales);
  $('sumExpMonth').textContent = formatGHS(m.expenses);
  $('sumProfitMonth').textContent = formatGHS(m.profit);

  renderHistory();
}

function renderHistory() {
  const list = $('historyList');
  list.innerHTML = '';
  $('emptyState').style.display = entries.length ? 'none' : 'block';

  const sorted = [...entries].sort((a, b) =>
    b.date.localeCompare(a.date) || b.id - a.id
  );

  let currentDay = null;
  for (const e of sorted) {
    if (e.date !== currentDay) {
      currentDay = e.date;
      const heading = document.createElement('div');
      heading.className = 'history-day';
      heading.textContent = dayLabel(e.date);
      list.appendChild(heading);
    }

    const row = document.createElement('div');
    row.className = 'entry';

    const info = document.createElement('div');
    info.className = 'info';
    const cat = document.createElement('div');
    cat.className = 'cat';
    cat.textContent = e.category;
    info.appendChild(cat);
    if (e.note) {
      const note = document.createElement('div');
      note.className = 'note';
      note.textContent = e.note;
      info.appendChild(note);
    }

    const amount = document.createElement('span');
    amount.className = 'amount ' + e.type;
    amount.textContent = (e.type === 'sale' ? '+' : '−') + formatGHS(e.amount);

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.textContent = '×';
    del.setAttribute('aria-label', 'Delete entry');
    del.addEventListener('click', () => {
      if (confirm('Delete this entry?')) {
        entries = entries.filter((x) => x.id !== e.id);
        save();
        render();
      }
    });

    row.appendChild(info);
    row.appendChild(amount);
    row.appendChild(del);
    list.appendChild(row);
  }
}

function openForm(type) {
  formType = type;
  const isSale = type === 'sale';
  $('formTitle').textContent = isSale ? 'Add Sale' : 'Add Expense';
  $('saveBtn').textContent = isSale ? 'Save Sale' : 'Save Expense';
  $('saveBtn').classList.toggle('expense-mode', !isSale);

  const select = $('category');
  select.innerHTML = '';
  for (const c of isSale ? SALE_CATEGORIES : EXPENSE_CATEGORIES) {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  }

  $('entryDate').value = dateStr(new Date());
  $('formSection').classList.remove('hidden');
  $('amount').value = '';
  $('note').value = '';
  $('amount').focus();
  $('formSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function closeForm() {
  $('formSection').classList.add('hidden');
}

$('addSaleBtn').addEventListener('click', () => openForm('sale'));
$('addExpenseBtn').addEventListener('click', () => openForm('expense'));
$('cancelBtn').addEventListener('click', closeForm);

$('entryForm').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const amount = parseFloat($('amount').value);
  if (!amount || amount <= 0) {
    alert('Enter an amount above GH₵0.00');
    return;
  }
  entries.push({
    id: Date.now(),
    type: formType,
    amount: Math.round(amount * 100) / 100,
    category: $('category').value,
    note: $('note').value.trim(),
    date: $('entryDate').value || dateStr(new Date()),
  });
  save();
  closeForm();
  render();
});

render();
