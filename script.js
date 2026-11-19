const display = document.getElementById('display');
const historyList = document.getElementById('historyList');
const historyPanel = document.getElementById('historyPanel');
const themeToggle = document.getElementById('themeToggle');

let history = JSON.parse(localStorage.getItem('calcHistory') || '[]');

/* ---------- العمليات الأساسية ---------- */
function append(value) {
  if (display.value === 'خطأ') display.value = '';
  display.value += value;
}

function clearDisplay() {
  display.value = '';
}

function deleteLast() {
  if (display.value === 'خطأ') { display.value = ''; return; }
  display.value = display.value.slice(0, -1);
}

function calculate() {
  const expression = display.value;
  if (!expression) return;
  try {
    if (!/^[0-9+\-*/%.() ]+$/.test(expression)) {
      display.value = 'خطأ';
      return;
    }
    const result = eval(expression);
    if (!isFinite(result)) {
      display.value = 'خطأ';
      return;
    }
    const rounded = Math.round(result * 1e10) / 1e10;
    display.value = rounded;
    addToHistory(expression, rounded);
  } catch {
    display.value = 'خطأ';
  }
}

/* ---------- سجل العمليات ---------- */
function addToHistory(expression, result) {
  history.unshift({ expression, result });
  history = history.slice(0, 30);
  localStorage.setItem('calcHistory', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = '';
  if (history.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'لا توجد عمليات بعد';
    historyList.appendChild(li);
    return;
  }
  history.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.expression + ' = ' + item.result;
    li.title = 'اضغط لإعادة استخدام النتيجة';
    li.onclick = () => { display.value = item.result; };
    historyList.appendChild(li);
  });
}

function toggleHistory() {
  historyPanel.classList.toggle('hidden');
}

function clearHistory() {
  history = [];
  localStorage.removeItem('calcHistory');
  renderHistory();
}

/* ---------- الوضع الفاتح/الداكن ---------- */
function applyTheme(theme) {
  document.body.classList.toggle('light', theme === 'light');
  themeToggle.textContent = theme === 'light' ? '☀️' : '🌙';
}

function toggleTheme() {
  const next = document.body.classList.contains('light') ? 'dark' : 'light';
  localStorage.setItem('calcTheme', next);
  applyTheme(next);
}

applyTheme(localStorage.getItem('calcTheme') || 'dark');
renderHistory();

/* ---------- دعم لوحة المفاتيح ---------- */
document.addEventListener('keydown', (e) => {
  if ('0123456789+-*/.%()'.includes(e.key)) append(e.key);
  else if (e.key === 'Enter') { e.preventDefault(); calculate(); }
  else if (e.key === 'Backspace') deleteLast();
  else if (e.key === 'Escape') clearDisplay();
});
