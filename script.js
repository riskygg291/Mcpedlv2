// Database Sementara di Memory Browser (Menggunakan LocalStorage agar data tidak hilang saat direfresh)
let currentUser = null;
let uploadedImageBase64 = "";

// SIMULASI LOGIN GOOGLE
function loginSimulate() {
    // Membuat nama random untuk simulasi akun google
    const names = ["Rian Gaming", "Budi_Craft", "SteveGamer", "WibuMinecraft"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    
    currentUser = {
        name: randomName,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${randomName}`
    };

    // Update UI Navbar
    document.getElementById('auth-zone').innerHTML = `
        <div class="comment-user" style="margin-bottom:0">
            <img src="${currentUser.avatar}" alt="Avatar">
            <span style="font-weight:600">${currentUser.name}</span>
        </div>
    `;

    // Update Form Komentar
    document.getElementById('comment-auth-status').innerHTML = `
        <div class="comment-user">
            <img src="${currentUser.avatar}" alt="Avatar">
            <h4>Bekerja sebagai <strong>${currentUser.name} (Google Account)</strong></h4>
        </div>
    `;
    document.getElementById('commentInputArea').classList.remove('hidden');
}

// KIRIM KOMENTAR
function postComment() {
    const text = document.getElementById('commentText').value;
    if(!text.trim()) return alert("Tulis sesuatu dulu bro!");

    const commentList = document.getElementById('commentsList');
    
    // Template Komentar Baru
    const newComment = document.createElement('div');
    newComment.className = 'comment-card';
    newComment.innerHTML = `
        <img src="${currentUser.avatar}" class="comment-avatar">
        <div class="comment-content">
            <h4>${currentUser.name} <span class="google-badge"><i class="fab fa-google"></i> Verified</span></h4>
            <p>${text}</p>
        </div>
    `;

    // Pasang di paling atas komentar
    commentList.insertBefore(newComment, commentList.firstChild);
    document.getElementById('commentText').value = ""; // Reset text area
}

// MODAL CONTROLLER
function openModal() { document.getElementById('addonModal').style.display = 'flex'; }
function closeModal() { document.getElementById('addonModal').style.display = 'none'; resetForm(); }

// PREVIEW GAMBAR DARI PERANGKAT
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('file-name-preview').innerText = file.name;
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('image-preview');
            preview.src = e.target.result;
            preview.classList.remove('hidden');
            uploadedImageBase64 = e.target.result; // Simpan data gambar
        }
        reader.readAsDataURL(file);
    }
}

// SUBMIT ADDON BARU (MENAMBAHKAN KE WEB)
function submitAddon() {
    const title = document.getElementById('addonTitle').value;
    const category = document.getElementById('addonCategory').value;
    
    if(!title || !uploadedImageBase64) {
        return alert("Tolong isi Judul dan masukkan Gambar Addon dari perangkat kamu!");
    }

    const addonGrid = document.getElementById('addonGrid');

    // Buat element Card Baru
    const newCard = document.createElement('div');
    newCard.className = 'addon-card';
    newCard.innerHTML = `
        <img src="${uploadedImageBase64}" alt="Addon Image" class="addon-img">
        <div class="addon-info">
            <span class="badge">${category}</span>
            <h3>${title}</h3>
            <p class="author">By ${currentUser ? currentUser.name : 'Anonymous'}</p>
        </div>
    `;

    // Masukkan ke Grid Webset
    addonGrid.insertBefore(newCard, addonGrid.firstChild);
    
    // Selesai & Tutup Modal
    closeModal();
    alert("🔥 Sukses! Addon baru kamu berhasil dipasang di platform komunitas!");
}

function resetForm() {
    document.getElementById('addonTitle').value = "";
    document.getElementById('file-name-preview').innerText = "Klik untuk memilih gambar addon";
    document.getElementById('image-preview').classList.add('hidden');
    uploadedImageBase64 = "";
}
