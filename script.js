// DATABASE SIMULATOR MENGGUNAKAN LOCAL STORAGE (Data tersimpan permanen & anti error)
let activeUser = JSON.parse(localStorage.getItem('mcpedlx_user')) || null;
let imgBase64Data = "";

// DATA LOCAL DEFAULT JIKA DATABASE MASIH KOSONG
const defaultAddons = [
    { title: "Cyber Armor V3", category: "Addon", downloadLink: "https://mediafire.com/file/cyberarmor", image: "https://images.unsplash.com/photo-1605899435973-ca2d1a8861cf?w=500", author: "AMBATUKAM" },
    { title: "Rethought Shaders Ultra", category: "Shaders", downloadLink: "https://mediafire.com/file/shaders", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500", author: "Steve_Craft" }
];
const defaultComments = [
    { username: "Rian Gaming", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=rian", message: "Gila addon buatan AMBATUKAM kerennn parah abis!" }
];

let addons = JSON.parse(localStorage.getItem('mcpedlx_addons')) || defaultAddons;
let comments = JSON.parse(localStorage.getItem('mcpedlx_comments')) || defaultComments;

// 1. ENGINE LOADING 3 DETIK
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }, 3000);
    
    checkUserSession();
    renderAddons();
    renderComments();
});

// 2. GOOGLE LOGIN POPUP SYSTEM (REAL SIMULATION BYPASS)
window.triggerGoogleLogin = function() {
    // Membuat simulasi login akun Google resmi dengan jendela konfirmasi browser asli
    let confirmation = confirm("MCPEDLX ingin menggunakan akun google Anda untuk masuk ke sistem cloud community.");
    if(confirmation) {
        // Data akun Google Ter-autentikasi
        activeUser = {
            displayName: "User_" + Math.floor(Math.random() * 8999 + 1000),
            photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${Math.random()}`
        };
        localStorage.setItem('mcpedlx_user', JSON.stringify(activeUser));
        checkUserSession();
        alert("🟢 Berhasil Login menggunakan Akun Google!");
    }
}

function checkUserSession() {
    if (activeUser) {
        document.getElementById('auth-zone').innerHTML = `
            <div class="user-profile-nav">
                <img src="${activeUser.photoURL}">
                <span>${activeUser.displayName}</span>
            </div>
        `;
        document.getElementById('comment-auth-status').classList.add('hidden');
        document.getElementById('commentInputArea').classList.remove('hidden');
    }
}

// 3. MULTI LANGUAGE SYSTEM (ID / EN)
const languages = {
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
    const data = languages[lang];
    Object.keys(data).forEach(key => {
        const el = document.querySelector(`[data-key="${key}"]`);
        if(el) el.innerText = data[key];
    });
    document.getElementById('heroTitle').innerHTML = data.heroTitle;
    document.getElementById('heroSub').innerText = data.heroSub;
}

// 4. THEME CONTROLLER
window.toggleTheme = function() {
    const body = document.body;
    const btn = document.getElementById('themeBtn');
    if(body.classList.contains('dark-theme')) {
        body.classList.replace('dark-theme', 'light-theme');
        btn.innerText = "☀️ Light";
    } else {
        body.classList.replace('light-theme', 'dark-theme');
        btn.innerText = "🌓 Dark";
    }
}

window.toggleSettings = function() {
    const panel = document.getElementById('settingsPanel');
    panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
}

// 5. POST COMMENT & UPLOAD ADDON SYSTEM
window.sendComment = function() {
    const text = document.getElementById('commentText').value;
    if(!text.trim()) return alert("Komentar tidak boleh kosong!");

    comments.unshift({
        username: activeUser.displayName,
        avatar: activeUser.photoURL,
        message: text
    });

    localStorage.setItem('mcpedlx_comments', JSON.stringify(comments));
    renderComments();
    document.getElementById('commentText').value = "";
}

window.uploadAddon = function() {
    const title = document.getElementById('addonTitle').value;
    const category = document.getElementById('addonCategory').value;
    const link = document.getElementById('addonLink').value;

    if(!title || !link || !imgBase64Data) {
        alert("Lengkapi semua kolom formulir beserta Gambar dari Perangkat!");
        return;
    }

    addons.unshift({
        title: title,
        category: category,
        downloadLink: link,
        image: imgBase64Data,
        author: activeUser ? activeUser.displayName : "AMBATUKAM"
    });

    localStorage.setItem('mcpedlx_addons', JSON.stringify(addons));
    renderAddons();
    closeModal();
    alert("🔥 Sukses! Addon komunitas baru buatanmu sudah berhasil dipublish!");
}

// 6. RENDER DATA TO UI
function renderAddons() {
    const grid = document.getElementById('addonGrid');
    grid.innerHTML = "";
    addons.forEach(item => {
        const card = document.createElement('div');
        card.className = 'addon-card';
        card.innerHTML = `
            <img src="${item.image}" class="addon-img">
            <div class="addon-info">
                <div>
                    <span class="card-badge">${item.category}</span>
                    <h3>${item.title}</h3>
                    <p class="meta">By ${item.author}</p>
                </div>
                <button class="btn-copy" onclick="copyDownloadLink('${item.downloadLink}')">
                    <i class="fas fa-copy"></i> Copy Download Link
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderComments() {
    const list = document.getElementById('commentsList');
    list.innerHTML = "";
    comments.forEach(item => {
        const card = document.createElement('div');
        card.className = 'comment-card';
        card.innerHTML = `
            <img src="${item.avatar}" class="comment-avatar">
            <div class="comment-main">
                <h4>${item.username} <span class="google-tag"><i class="fab fa-google"></i> Verified</span></h4>
                <p>${item.message}</p>
            </div>
        `;
        list.appendChild(card);
    });
}

// 7. COPY TO CLIPBOARD LINK FUNCTION
window.copyDownloadLink = function(link) {
    navigator.clipboard.writeText(link).then(() => {
        alert("📋 Tautan Unduhan Addon berhasil disalin ke Papan Klip!");
    }).catch(err => {
        alert("Gagal menyalin link: " + err);
    });
}

// 8. FILE DIALOG & MODAL CONTROLLER
window.openModal = function() { document.getElementById('addonModal').style.display = 'flex'; }
window.closeModal = function() { document.getElementById('addonModal').style.display = 'none'; resetForm(); }

window.previewImage = function(event) {
    const file = event.target.files[0];
    if(file) {
        document.getElementById('file-name-preview').innerText = file.name;
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('image-preview');
            img.src = e.target.result;
            img.classList.remove('hidden');
            imgBase64Data = e.target.result; // Data gambar tersimpan sempurna
        }
        reader.readAsDataURL(file);
    }
}

function resetForm() {
    document.getElementById('addonTitle').value = "";
    document.getElementById('addonLink').value = "";
    document.getElementById('file-name-preview').innerText = "Klik untuk memilih screenshot gambar perangkat";
    document.getElementById('image-preview').classList.add('hidden');
    imgBase64Data = "";
}
