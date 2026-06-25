// KONEKSI DATABASE UTAMA MENGGUNAKAN FIREBASE SDK OFFICIAL
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Ganti konfigurasi di bawah ini dengan kredensial dari Console Firebase kamu agar data sinkron global!
const firebaseConfig = {
    apiKey: "AIzaSyAsYourActualApiKeyHere_ReplaceMe",
    authDomain: "your-project-id.firebaseapp.com",
    databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};

// Start Firebase Engine
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const provider = new GoogleAuthProvider();

let userLoginActive = null;
let base64ImageString = "";

// 1. ENGINE AUTOMATIC LOADING TIMEOUT (3 DETIK PAS)
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }, 3000);
    listenToGlobalDatabase(); // Dapatkan data komentar dan addon ter-update dari cloud
});

// 2. SISTEM LOGIN GOOGLE NYATA (REAL AUTHENTICATION)
const loginBtn = document.getElementById('btnLogin');
if(loginBtn) {
    loginBtn.addEventListener('click', () => {
        signInWithPopup(auth, provider)
        .then((result) => {
            // Berhasil Login Menggunakan Akun Google Resmi
            console.log("User terverifikasi Google:", result.user);
        }).catch((error) => {
            console.error("Gagal Login Google Auth: ", error.message);
        });
    });
}

// Memantau Status Autentikasi Pengguna di Jagat Web
onAuthStateChanged(auth, (user) => {
    if (user) {
        userLoginActive = user;
        // Ganti UI Tombol Login Menjadi Profile Google Pengguna
        document.getElementById('auth-zone').innerHTML = `
            <div class="user-profile-nav">
                <img src="${user.photoURL}" alt="User Avatar">
                <span>${user.displayName}</span>
            </div>
        `;
        // Tampilkan Area Menulis Komentar
        document.getElementById('comment-auth-status').classList.add('hidden');
        document.getElementById('commentInputArea').classList.remove('hidden');
    }
});

// 3. DICTIONARY MULTI-LANGUAGE (INDONESIA / ENGLISH)
const langData = {
    id: {
        settingsTitle: "Pengaturan Sistem", themeLabel: "Tema Tampilan", langLabel: "Bahasa",
        login: "Masuk dengan Google", shareAddonBtn: "Bagikan Addon", trendingTitle: "⚡ Addon Komunitas",
        commentTitle: "Diskusi Publik Komunitas", loginAlert: "Anda harus masuk menggunakan Google Akun untuk dapat menulis komentar secara publik.",
        sendComment: "Kirim", modalTitle: "Unggah Addon Baru", labelTitle: "Nama Addon", labelCategory: "Kategori",
        labelLink: "Link Download File Addon", labelImg: "Upload Thumbnail Cover", dropzoneText: "Klik untuk memilih screenshot gambar perangkat",
        publishBtn: "Publish Addon", heroTitle: "Temukan & Bagikan <br>Minecraft <span>Addons</span> Terbaik",
        heroSub: "Platform komunitas generasi baru untuk membagikan kreativitas modifikasi Minecraft Anda."
    },
    en: {
        settingsTitle: "System Settings", themeLabel: "Interface Theme", langLabel: "Language",
        login: "Sign in with Google", shareAddonBtn: "Share Addon", trendingTitle: "⚡ Trending Addons",
        commentTitle: "Community Public Discussion", loginAlert: "You must sign in with a Google account to post comments publicly.",
        sendComment: "Post", modalTitle: "Upload New Addon", labelTitle: "Addon Name", labelCategory: "Category",
        labelLink: "Addon Download Link", labelImg: "Upload Thumbnail Cover", dropzoneText: "Click to select screenshot image from device",
        publishBtn: "Publish Addon", heroTitle: "Discover & Share <br>The Ultimate <span>Addons</span>",
        heroSub: "Next-generation community platform to distribute your Minecraft creations globally."
    }
};

window.changeLanguage = function(lang) {
    document.documentElement.lang = lang;
    const keys = Object.keys(langData[lang]);
    keys.forEach(key => {
        const element = document.querySelector(`[data-key="${key}"]`);
        if(element) element.innerText = langData[lang][key];
    });
    // Khusus Hero Text
    document.getElementById('heroTitle').innerHTML = langData[lang].heroTitle;
    document.getElementById('heroSub').innerText = langData[lang].heroSub;
}

// 4. THEME CONTROLLER (DARK <=> LIGHT MODE)
window.toggleTheme = function() {
    const body = document.body;
    const themeBtn = document.getElementById('themeBtn');
    if(body.classList.contains('dark-theme')) {
        body.classList.replace('dark-theme', 'light-theme');
        themeBtn.innerText = "☀️ Light";
    } else {
        body.classList.replace('light-theme', 'dark-theme');
        themeBtn.innerText = "🌓 Dark";
    }
}

window.toggleSettings = function() {
    const panel = document.getElementById('settingsPanel');
    panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
}

// 5. SYNCHRONIZE DATA NYATA DENGAN FIREBASE DATABASE (REALTIME)
window.sendCommentToServer = function() {
    const text = document.getElementById('commentText').value;
    if(!text.trim()) return;

    push(ref(database, 'comments/'), {
        username: userLoginActive.displayName,
        avatar: userLoginActive.photoURL,
        message: text,
        timestamp: Date.now()
    });
    document.getElementById('commentText').value = "";
};

window.uploadAddonToServer = function() {
    const title = document.getElementById('addonTitle').value;
    const category = document.getElementById('addonCategory').value;
    const link = document.getElementById('addonLink').value;

    if(!title || !link || !base64ImageString) {
        alert("Semua kolom dan gambar wajib diisi/diunggah!");
        return;
    }

    push(ref(database, 'addons/'), {
        title: title,
        category: category,
        downloadLink: link,
        image: base64ImageString,
        author: userLoginActive ? userLoginActive.displayName : "AMBATUKAM"
    });

    closeModal();
    alert("🔥 Addon sukses dipublish dan langsung online di seluruh dunia!");
};

function listenToGlobalDatabase() {
    // Sinkronisasi Komentar
    onValue(ref(database, 'comments/'), (snapshot) => {
        const list = document.getElementById('commentsList');
        list.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const card = document.createElement('div');
            card.className = 'comment-card';
            card.innerHTML = `
                <img src="${data.avatar}" class="comment-avatar">
                <div class="comment-main">
                    <h4>${data.username} <span class="google-tag"><i class="fab fa-google"></i> Verified</span></h4>
                    <p>${data.message}</p>
                </div>
            `;
            list.insertBefore(card, list.firstChild);
        });
    });

    // Sinkronisasi List Addon
    onValue(ref(database, 'addons/'), (snapshot) => {
        const grid = document.getElementById('addonGrid');
        grid.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const card = document.createElement('div');
            card.className = 'addon-card';
            card.innerHTML = `
                <img src="${data.image}" class="addon-img">
                <div class="addon-info">
                    <div>
                        <span class="card-badge">${data.category}</span>
                        <h3>${data.title}</h3>
                        <p class="meta">By ${data.author}</p>
                    </div>
                    <button class="btn-copy" onclick="copyLink('${data.downloadLink}')">
                        <i class="fas fa-copy"></i> Copy Download Link
                    </button>
                </div>
            `;
            grid.insertBefore(card, grid.firstChild);
        });
    });
}

// 6. FUNCTION SALIN LINK DOWNLOAD
window.copyLink = function(link) {
    navigator.clipboard.writeText(link).then(() => {
        alert("📋 Link download berhasil disalin ke papan klip!");
    }).catch(err => {
        console.error("Gagal menyalin link: ", err);
    });
}

// 7. UTILITIES FORM (MODAL & FILE PREVIEW)
window.openModal = function() { document.getElementById('addonModal').style.display = 'flex'; }
window.closeModal = function() { document.getElementById('addonModal').style.display = 'none'; }
window.previewImage = function(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('file-name-preview').innerText = file.name;
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('image-preview');
            img.src = e.target.result;
            img.classList.remove('hidden');
            base64ImageString = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}
