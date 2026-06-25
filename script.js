let activeUser = JSON.parse(localStorage.getItem('mcpedlx_user')) || null;
let imgBase64Data = "";
let currentEditCommentId = null;

// DATA BAWAN SUDAH DIKOSONGKAN TOTAL SESUAI PERMINTAAN
const defaultAddons = [];
const defaultComments = [];

let addons = JSON.parse(localStorage.getItem('mcpedlx_addons')) || defaultAddons;
let comments = JSON.parse(localStorage.getItem('mcpedlx_comments')) || defaultComments;

// 1. ENGINE LOADING SCREEN
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

// 2. GOOGLE AUTH SIMULATION
window.triggerGoogleLogin = function() {
    let confirmation = confirm("MCPEDLX ingin menggunakan akun google Anda untuk masuk ke sistem cloud community.");
    if(confirmation) {
        activeUser = {
            displayName: "User_" + Math.floor(Math.random() * 8999 + 1000),
            photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${Math.random()}`
        };
        localStorage.setItem('mcpedlx_user', JSON.stringify(activeUser));
        checkUserSession();
        renderAddons();
        renderComments();
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
        
        // Load data ke panel setting
        document.getElementById('profile-edit-zone').classList.remove('hidden');
        document.getElementById('settings-avatar-preview').src = activeUser.photoURL;
        document.getElementById('editDisplayName').value = activeUser.displayName;
    }
}

// ENGINE UPDATE NAMA PROFIL
window.updateDisplayName = function() {
    const newName = document.getElementById('editDisplayName').value.trim();
    if (!newName) return alert("Nama tidak boleh kosong!");
    
    if (activeUser) {
        const oldName = activeUser.displayName;
        
        activeUser.displayName = newName;
        localStorage.setItem('mcpedlx_user', JSON.stringify(activeUser));
        
        comments.forEach(comment => {
            if (comment.username === oldName) {
                comment.username = newName;
            }
        });
        localStorage.setItem('mcpedlx_comments', JSON.stringify(comments));
        
        addons.forEach(addon => {
            if (addon.author === oldName) {
                addon.author = newName;
            }
        });
        localStorage.setItem('mcpedlx_addons', JSON.stringify(addons));

        checkUserSession();
        renderAddons();
        renderComments();
        alert("🎉 Nama profilmu berhasil diubah menjadi: " + newName);
    }
}

// ENGINE UPDATE FOTO PROFIL
window.updateProfilePicture = function(event) {
    const file = event.target.files[0];
    if (file && activeUser) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const newAvatarBase64 = e.target.result;
            activeUser.photoURL = newAvatarBase64;
            localStorage.setItem('mcpedlx_user', JSON.stringify(activeUser));
            
            comments.forEach(comment => {
                if (comment.username === activeUser.displayName) {
                    comment.avatar = newAvatarBase64;
                }
            });
            localStorage.setItem('mcpedlx_comments', JSON.stringify(comments));
            
            checkUserSession();
            renderComments();
            alert("📸 Foto profil berhasil diperbarui!");
        }
        reader.readAsDataURL(file);
    }
}

// 3. POST & EDIT CHAT SYSTEM
window.sendComment = function() {
    const text = document.getElementById('commentText').value;
    if(!text.trim()) return alert("Komentar tidak boleh kosong!");

    if (currentEditCommentId) {
        const commentIndex = comments.findIndex(c => c.id === currentEditCommentId);
        if (commentIndex !== -1) {
            comments[commentIndex].message = text;
            alert("📝 Komentar berhasil diubah!");
        }
        currentEditCommentId = null;
        document.getElementById('submitCommentBtn').innerHTML = `<i class="fas fa-paper-plane"></i> <span data-key="sendComment">Kirim</span>`;
    } else {
        comments.unshift({
            id: "comment_" + Date.now(),
            username: activeUser ? activeUser.displayName : "Guest",
            avatar: activeUser ? activeUser.photoURL : "https://api.dicebear.com/7.x/bottts/svg?seed=guest",
            message: text
        });
    }

    localStorage.setItem('mcpedlx_comments', JSON.stringify(comments));
    renderComments();
    document.getElementById('commentText').value = "";
}

window.startEditComment = function(id) {
    const targetComment = comments.find(c => c.id === id);
    if (targetComment) {
        document.getElementById('commentText').value = targetComment.message;
        document.getElementById('commentText').focus();
        currentEditCommentId = id;
        document.getElementById('submitCommentBtn').innerHTML = `<i class="fas fa-edit"></i> Simpan Perubahan`;
    }
}

window.deleteComment = function(id) {
    if(confirm("Hapus komentar ini secara permanen?")) {
        comments = comments.filter(c => c.id !== id);
        localStorage.setItem('mcpedlx_comments', JSON.stringify(comments));
        renderComments();
    }
}

// 4. PUBLISH & DELETE ADDON SYSTEM
window.uploadAddon = function() {
    const title = document.getElementById('addonTitle').value;
    const category = document.getElementById('addonCategory').value;
    const link = document.getElementById('addonLink').value;

    if(!title || !link || !imgBase64Data) {
        alert("Lengkapi semua kolom formulir beserta Gambar dari Perangkat!");
        return;
    }

    addons.unshift({
        id: "addon_" + Date.now(),
        title: title,
        category: category,
        downloadLink: link,
        image: imgBase64Data,
        author: activeUser ? activeUser.displayName : "Guest"
    });

    localStorage.setItem('mcpedlx_addons', JSON.stringify(addons));
    renderAddons();
    closeModal();
    alert("🔥 Sukses! Addon komunitas baru buatanmu sudah berhasil dipublish!");
}

window.deleteAddon = function(id) {
    if(confirm("Apakah kamu yakin ingin menghapus addon ini dari daftar website?")) {
        addons = addons.filter(item => item.id !== id);
        localStorage.setItem('mcpedlx_addons', JSON.stringify(addons));
        renderAddons();
        alert("🗑️ Addon telah berhasil dihapus!");
    }
}

// 5. RENDERING CORE ENGINE
function renderAddons() {
    const grid = document.getElementById('addonGrid');
    grid.innerHTML = "";
    addons.forEach(item => {
        const currentUser = activeUser ? activeUser.displayName : "";
        const showDeleteBtn = (item.author === currentUser || currentUser === "");

        const card = document.createElement('div');
        card.className = 'addon-card';
        card.innerHTML = `
            ${showDeleteBtn ? `<button class="btn-delete-addon" onclick="deleteAddon('${item.id}')" title="Hapus Addon"><i class="fas fa-trash-alt"></i></button>` : ''}
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
        const currentUser = activeUser ? activeUser.displayName : "";
        const isMyComment = (item.username === currentUser);

        const card = document.createElement('div');
        card.className = 'comment-card';
        card.innerHTML = `
            <img src="${item.avatar}" class="comment-avatar">
            <div class="comment-main">
                <h4>${item.username} <span class="google-tag"><i class="fab fa-google"></i> Verified</span></h4>
                <p>${item.message}</p>
            </div>
            ${isMyComment ? `
                <div class="comment-actions">
                    <button class="btn-action-mini" onclick="startEditComment('${item.id}')" title="Edit Teks"><i class="fas fa-edit"></i></button>
                    <button class="btn-action-mini delete" onclick="deleteComment('${item.id}')" title="Hapus Chat"><i class="fas fa-trash-alt"></i></button>
                </div>
            ` : ''}
        `;
        list.appendChild(card);
    });
}

// 6. GENERAL SYSTEM SETUP
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

window.copyDownloadLink = function(link) {
    navigator.clipboard.writeText(link).then(() => {
        alert("📋 Tautan Unduhan Addon berhasil disalin ke Papan Klip!");
    }).catch(err => {
        alert("Gagal menyalin link: " + err);
    });
}

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
            imgBase64Data = e.target.result;
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

