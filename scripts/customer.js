// scripts/customer.js
const API_BASE = (() => {
  try {
    if (location.origin && /^https?:\/\//.test(location.origin)) return location.origin;
  } catch {}
  return 'http://localhost:5555';
})();

const els = {
  signupName: document.getElementById('signupName'),
  signupEmail: document.getElementById('signupEmail'),
  signupPass: document.getElementById('signupPass'),
  signupBtn: document.getElementById('signupBtn'),

  loginEmail: document.getElementById('loginEmail'),
  loginPass: document.getElementById('loginPass'),
  loginBtn: document.getElementById('loginBtn'),

  status: document.getElementById('customerStatus'),
};

function showStatus(msg, ok = false) {
  if (!els.status) return;
  els.status.textContent = msg;
  els.status.style.color = ok ? 'green' : 'crimson';
}

/** ---------- SIGNUP ---------- */
async function customerSignup() {
  try {
    showStatus('Signing up...', true);
    const name = els.signupName.value.trim();
    const email = els.signupEmail.value.trim();
    const password = els.signupPass.value;

    if (!name || !email || !password) throw new Error('Fill all fields');

    const res = await fetch(`${API_BASE}/api/customer/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || 'Signup failed');

    const { customer_id, token } = json;
    localStorage.setItem('customerId', String(customer_id));
    localStorage.setItem('customerToken', token);

    showStatus('Signed up! Redirecting...', true);
    setTimeout(() => (location.href = 'customerDashboard.html'), 300);
  } catch (e) {
    showStatus(e.message || 'Signup failed');
  }
}

/** ---------- LOGIN ---------- */
async function customerLogin() {
  try {
    showStatus('Signing in...', true);
    const email = els.loginEmail.value.trim();
    const password = els.loginPass.value;
    if (!email || !password) throw new Error('Enter email and password');

    const res = await fetch(`${API_BASE}/api/customer/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || 'Login failed');

    const { customer_id, token } = json;
    localStorage.setItem('customerId', String(customer_id));
    localStorage.setItem('customerToken', token);

    showStatus('Logged in! Redirecting...', true);
    setTimeout(() => (location.href = 'customerDashboard.html'), 300);
  } catch (e) {
    showStatus(e.message || 'Login failed');
  }
}

/** ---------- WIRE UI ---------- */
if (els.signupBtn) els.signupBtn.addEventListener('click', customerSignup);
if (els.loginBtn) els.loginBtn.addEventListener('click', customerLogin);
