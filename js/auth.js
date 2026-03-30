/* ===========================
   auth.js — Login & Signup
   =========================== */

// ---- TOGGLE PASSWORD VISIBILITY ----
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}

// ---- SHOW / HIDE ALERT ----
function showAlert(id, message, type) {
  const alert = document.getElementById(id);
  alert.textContent = message;
  alert.className = 'alert ' + type;
}

function hideAlert(id) {
  const alert = document.getElementById(id);
  alert.className = 'alert';
  alert.textContent = '';
}

// ---- VALIDATE EMAIL ----
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---- PASSWORD STRENGTH ----
function checkStrength(password) {
  let score = 0;
  if (password.length >= 6)             score++;
  if (password.length >= 10)            score++;
  if (/[A-Z]/.test(password))          score++;
  if (/[0-9]/.test(password))          score++;
  if (/[^A-Za-z0-9]/.test(password))  score++;
  return score;
}

// Attach strength checker if on signup page
const signupPw = document.getElementById('signupPassword');
if (signupPw) {
  signupPw.addEventListener('input', function () {
    const score = checkStrength(this.value);
    const fill  = document.getElementById('strengthFill');
    const text  = document.getElementById('strengthText');

    const levels = [
      { pct: '0%',   color: '',        label: '' },
      { pct: '20%',  color: '#ff5c5c', label: 'Weak' },
      { pct: '40%',  color: '#ffa94d', label: 'Fair' },
      { pct: '65%',  color: '#f0c330', label: 'Good' },
      { pct: '85%',  color: '#69db7c', label: 'Strong' },
      { pct: '100%', color: '#2bbfa0', label: 'Very Strong' },
    ];

    const level = levels[Math.min(score, 5)];
    fill.style.width      = level.pct;
    fill.style.background = level.color;
    text.textContent      = level.label;
    text.style.color      = level.color;
  });
}

// ---- LOGIN ----
function handleLogin() {
  hideAlert('loginAlert');

  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showAlert('loginAlert', 'Please fill in all fields.', 'error'); return;
  }
  if (!isValidEmail(email)) {
    showAlert('loginAlert', 'Please enter a valid email address.', 'error'); return;
  }
  if (password.length < 6) {
    showAlert('loginAlert', 'Password must be at least 6 characters.', 'error'); return;
  }

  const users = JSON.parse(localStorage.getItem('quanment_users') || '[]');
  const user  = users.find(u => u.email === email && u.password === password);

  if (!user) {
    showAlert('loginAlert', 'Invalid email or password. Try again.', 'error'); return;
  }

  localStorage.setItem('quanment_session', JSON.stringify({
    name: user.name, email: user.email, initials: user.initials
  }));

  showAlert('loginAlert', 'Login successful! Redirecting...', 'success');
  setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
}

// ---- SIGNUP ----
function handleSignup() {
  hideAlert('signupAlert');

  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const email     = document.getElementById('signupEmail').value.trim();
  const password  = document.getElementById('signupPassword').value;
  const confirm   = document.getElementById('confirmPassword').value;
  const agreed    = document.getElementById('agreeTerms').checked;

  if (!firstName || !lastName || !email || !password || !confirm) {
    showAlert('signupAlert', 'Please fill in all fields.', 'error'); return;
  }
  if (!isValidEmail(email)) {
    showAlert('signupAlert', 'Please enter a valid email address.', 'error'); return;
  }
  if (password.length < 6) {
    showAlert('signupAlert', 'Password must be at least 6 characters.', 'error'); return;
  }
  if (password !== confirm) {
    showAlert('signupAlert', 'Passwords do not match.', 'error'); return;
  }
  if (!agreed) {
    showAlert('signupAlert', 'Please agree to the Terms & Conditions.', 'error'); return;
  }

  const users = JSON.parse(localStorage.getItem('quanment_users') || '[]');
  if (users.find(u => u.email === email)) {
    showAlert('signupAlert', 'An account with this email already exists.', 'error'); return;
  }

  const initials = (firstName[0] + lastName[0]).toUpperCase();
  users.push({ name: firstName + ' ' + lastName, email, password, initials });
  localStorage.setItem('quanment_users', JSON.stringify(users));

  showAlert('signupAlert', 'Account created! Redirecting to login...', 'success');
  setTimeout(() => { window.location.href = 'index.html'; }, 1000);
}

// ---- ENTER KEY ----
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  if (document.getElementById('loginEmail'))  handleLogin();
  if (document.getElementById('signupEmail')) handleSignup();
});