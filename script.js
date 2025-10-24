/* =========================================================
   ⭐ TOUR GUIDE RATING SYSTEM + SPREADSHEET SYNC
   ========================================================= */

// ====== ELEMENT DOM ======
const stars = document.querySelectorAll('.star');
const feedback = document.getElementById('feedback');
const submitBtn = document.getElementById('submitBtn');
const usernameInput = document.getElementById('username');
const commentInput = document.getElementById('comment');
const totalRatingsEl = document.getElementById('totalRatings');
const averageRatingEl = document.getElementById('averageRating');

const openAdmin = document.getElementById('openAdmin');
const closeAdmin = document.getElementById('closeAdmin');
const adminPanel = document.getElementById('adminPanel');
const clearDataBtn = document.getElementById('clearData');
const ratingTableBody = document.querySelector('#ratingTable tbody');
const adminTotal = document.getElementById('adminTotal');
const adminAverage = document.getElementById('adminAverage');
const adminLogin = document.getElementById('adminLogin');
const adminPassword = document.getElementById('adminPassword');
const loginBtn = document.getElementById('loginBtn');
const cancelLogin = document.getElementById('cancelLogin');
const loginError = document.getElementById('loginError');

// ====== KONFIGURASI ======
const ADMIN_PASS = "Nabil1902";
const SHEET_URL = "https://script.google.com/macros/s/AKfycbz4fU5JWcr3cQ8q2FdeND26MN3ghJFmoHbH71K8nKnJHUup7q6MhG3oWAeMygG5UtG1/exec"; // <--- Ganti dengan URL Google Apps Script kamu

let ratingData = JSON.parse(localStorage.getItem('tourGuideRatings')) || [];
let selectedRating = 0;

/* =========================================================
   ⭐ PILIH RATING
   ========================================================= */
stars.forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.getAttribute('data-value'));
    stars.forEach(s => s.classList.remove('active'));
    for (let i = 0; i < selectedRating; i++) {
      stars[i].classList.add('active');
    }
  });
});

/* =========================================================
   🚀 KIRIM DATA RATING
   ========================================================= */
submitBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const comment = commentInput.value.trim();

  if (!username) return alert("⚠️ Harap masukkan nama kamu!");
  if (selectedRating === 0) return alert("⚠️ Silakan pilih rating!");
  if (!comment) return alert("⚠️ Tulis kesanmu terhadap tour guide!");

  const entry = {
    name: username,
    rating: selectedRating,
    comment: comment,
    date: new Date().toLocaleString()
  };

  // Simpan lokal
  ratingData.push(entry);
  localStorage.setItem('tourGuideRatings', JSON.stringify(ratingData));

  // Kirim ke Spreadsheet
  fetch(SHEET_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  })
  .then(res => res.json())
  .then(res => console.log("✅ Data tersimpan di Spreadsheet:", res))
  .catch(err => console.error("❌ Gagal kirim ke Spreadsheet:", err));

  // Reset form & update
  feedback.textContent = `✅ Terima kasih, ${username}! Rating kamu telah disimpan.`;
  usernameInput.value = "";
  commentInput.value = "";
  stars.forEach(s => s.classList.remove('active'));
  selectedRating = 0;

  updateStatistics();
});

/* =========================================================
   📊 STATISTIK
   ========================================================= */
function updateStatistics() {
  const total = ratingData.length;
  const sum = ratingData.reduce((a, b) => a + (b.rating || 0), 0);
  const average = total ? (sum / total).toFixed(2) : 0;

  totalRatingsEl.textContent = total;
  averageRatingEl.textContent = average;
}

/* =========================================================
   🔑 LOGIN ADMIN
   ========================================================= */
openAdmin.addEventListener('click', () => adminLogin.classList.remove('hidden'));
cancelLogin.addEventListener('click', () => adminLogin.classList.add('hidden'));

loginBtn.addEventListener('click', () => {
  if (adminPassword.value.trim() === ADMIN_PASS) {
    adminLogin.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    adminPassword.value = "";
    loginError.textContent = "";
    loadAdminData();
  } else {
    loginError.textContent = "❌ Password salah!";
  }
});

/* =========================================================
   🧭 ADMIN PANEL
   ========================================================= */
closeAdmin.addEventListener('click', () => adminPanel.classList.add('hidden'));

clearDataBtn.addEventListener('click', () => {
  if (confirm("Apakah kamu yakin ingin menghapus semua data rating?")) {
    localStorage.removeItem('tourGuideRatings');
    ratingData = [];
    loadAdminData();
    updateStatistics();
  }
});

function loadAdminData() {
  ratingTableBody.innerHTML = "";
  ratingData.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.name}</td>
      <td>${item.rating} ⭐</td>
      <td>${item.comment}</td>
      <td>${item.date}</td>
    `;
    ratingTableBody.appendChild(row);
  });

  const total = ratingData.length;
  const sum = ratingData.reduce((a, b) => a + (b.rating || 0), 0);
  const average = total ? (sum / total).toFixed(2) : 0;

  adminTotal.textContent = total;
  adminAverage.textContent = average;
}

updateStatistics();
