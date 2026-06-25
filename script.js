// --- DICTIONARY MULTI-BAHASA ---
const languages = {
    id: {
        explore: "Jelajahi Addon",
        subtitle: "Kreasi terbaik dari komunitas",
        createBtn: "Buat Addon",
        creatorLabel: "Pembuat / Creator",
        infoTitle: "Informasi Project",
        author: "Nama Pembuat:",
        modalTitle: "Buat Addon Baru",
        labelTitle: "Nama Addon",
        labelDesc: "Deskripsi Addon",
        labelLink: "Custom Link (Download/Info)",
        labelImg: "Gambar Addon",
        uploadPrompt: "Klik untuk upload foto dari perangkat",
        imgReady: "Gambar berhasil dimuat!",
        submitAddon: "PUBLIKASIKAN ADDON",
        copySuccess: "Link berhasil disalin ke papan klip!",
        toastAdd: "Addon berhasil dibuat!",
        toastDel: "Addon berhasil dihapus!",
        toastProfile: "Profil berhasil diperbarui!",
        commentPlaceholder: "Tulis komentar / ulasan kamu...",
        submitComment: "Kirim Ulasan",
        deleteBtn: "Hapus Addon",
        noComment: "Belum ada komentar. Jadilah yang pertama!",
        by: "Oleh"
    },
    en: {
        explore: "Explore Addons",
        subtitle: "The best creations from the community",
        createBtn: "Create Addon",
        creatorLabel: "Author / Creator",
        infoTitle: "Project Information",
        author: "Developer Name:",
        modalTitle: "Create New Addon",
        labelTitle: "Addon Title",
        labelDesc: "Description",
        labelLink: "Custom Link (Download/Info)",
        labelImg: "Addon Image",
        uploadPrompt: "Click to upload image from device",
        imgReady: "Image successfully loaded!",
        submitAddon: "PUBLISH ADDON",
        copySuccess: "Link copied to clipboard!",
        toastAdd: "Addon created successfully!",
        toastDel: "Addon deleted successfully!",
        toastProfile: "Profile updated successfully!",
        commentPlaceholder: "Write your review / comment...",
        submitComment: "Submit Review",
        deleteBtn: "Delete Addon",
        noComment: "No comments yet. Be the first!",
        by: "By"
    }
};

// --- APP STATE (Lengkap dengan LocalStorage) ---
let currentLang = localStorage.getItem('mcpedl_lang') || 'id';
let profile = JSON.parse(localStorage.getItem('mcpedl_profile')) || {
    username: "AMBATUKAN",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Ambatukan"
};
let addons = JSON.parse(localStorage.getItem('mcpedl_addons')) || [
    {
        id: "default-1",
        title: "Modern Furniture Addon",
        desc: "Menambahkan lebih dari 50+ perabotan rumah tangga modern dengan tekstur HD yang sangat realistis untuk mempercantik base Minecraft kamu.",
        link: "https://mcpedl.com/modern-furniture-addon",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=60",
        creator: "AMBATUKAN",
        ratings: [5, 4, 5],
        comments: [
            { user: "SteveCraft", avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Steve", rating: 5, text: "Gokil abis perabotannya lengkap!" },
            { user: "AlexExplores", avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Alex", rating: 4, text: "Sangat bagus, tapi agak berat sedikit di HP low-end." }
        ]
    }
];

// File base64 buffer temporary storage
let tempAddonImg = "";

// --- INITIALIZE & LOADING ---
window.addEventListener('DOMContentLoaded', () => {
    // Jalankan Simulasi Loading selama 2 Detik (2000ms)
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        const mainApp = document.getElementById('main-app');
        
        loadingScreen.classList.add('opacity-0');
        mainApp.classList.remove('hidden');
        
        setTimeout(() => {
            loadingScreen.remove();
            mainApp.classList.add('opacity-100');
        }, 500);
    }, 2000);

    initApp();
});

function initApp() {
    loadProfileUI();
    applyLanguage();
    renderAddons();
    setupEventListeners();
}

// --- DOM SYNC ---
function loadProfileUI() {
    document.getElementById('nav-avatar').src = profile.avatar;
    document.getElementById('card-avatar').src = profile.avatar;
    document.getElementById('nav-username').textContent = profile.username;
    document.getElementById('username-input').value = profile.username;
    document.getElementById('lang-select').value = currentLang;
}

function applyLanguage() {
    const t = languages[currentLang];
    document.getElementById('text-explore').textContent = t.explore;
    document.getElementById('text-subtitle').textContent = t.subtitle;
    document.getElementById('text-create-btn').textContent = t.createBtn;
    document.getElementById('text-creator-label').textContent = t.creatorLabel;
    document.getElementById('text-info-title').textContent = t.infoTitle;
    document.getElementById('text-author').textContent = t.author;
    document.getElementById('text-modal-title').textContent = t.modalTitle;
    document.getElementById('text-label-title').textContent = t.labelTitle;
    document.getElementById('text-label-desc').textContent = t.labelDesc;
    document.getElementById('text-label-link').textContent = t.labelLink;
    document.getElementById('text-label-img').textContent = t.labelImg;
    document.getElementById('text-upload-prompt').textContent = t.uploadPrompt;
    document.getElementById('text-img-ready').textContent = t.imgReady;
    document.getElementById('text-submit-addon').textContent = t.submitAddon;
}

function saveData() {
    localStorage.setItem('mcpedl_lang', currentLang);
    localStorage.setItem('mcpedl_profile', JSON.stringify(profile));
    localStorage.setItem('mcpedl_addons', JSON.stringify(addons));
}

// --- NOTIFICATION ---
function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// --- RENDER ADDONS ---
function renderAddons() {
    const grid = document.getElementById('addons-grid');
    grid.innerHTML = "";
    const t = languages[currentLang];

    addons.forEach(addon => {
        // Calculate average star rating
        const avgRating = addon.ratings.length ? (addon.ratings.reduce((a,b) => a+b, 0) / addon.ratings.length).toFixed(1) : "0.0";
        
        const card = document.createElement('div');
        card.className = "bg-slate-900/60 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-800 flex flex-col group cursor-pointer transition-all duration-300 hover:-translate-y-1 addon-card-glow";
        card.onclick = (e) => {
            // Prevent trigger modal when clicking action button inside card
            if(!e.target.closest('.action-btn')) openDetailModal(addon.id);
        };

        card.innerHTML = `
            <div class="relative h-48 w-full bg-slate-950 overflow-hidden">
                <img src="${addon.image}" alt="${addon.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                <div class="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-700 flex items-center gap-1">
                    <i class="fa-solid fa-star text-amber-400"></i> ${avgRating} (${addon.ratings.length})
                </div>
            </div>
            <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                    <h3 class="font-bold text-lg text-slate-100 group-hover:text-emerald-400 transition tracking-tight line-clamp-1">${addon.title}</h3>
                    <p class="text-xs text-slate-400 mt-0.5">${t.by} <span class="text-indigo-400 font-medium">${addon.creator}</span></p>
                    <p class="text-sm text-slate-300 mt-2 line-clamp-2">${addon.desc}</p>
                </div>
                
                <div class="flex gap-2 pt-2">
                    <button onclick="copyLink('${addon.link}')" class="action-btn flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs py-2 px-3 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition">
                        <i class="fa-solid fa-copy"></i> Copy Link
                    </button>
                    ${addon.creator === profile.username ? `
                        <button onclick="deleteAddon('${addon.id}')" class="action-btn bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-950 p-2 rounded-xl border border-rose-500/20 transition" title="${t.deleteBtn}">
                            <i class="fa-solid fa-trash-can text-sm"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- ACTIONS & FEATURES ---
function copyLink(link) {
    navigator.clipboard.writeText(link).then(() => {
        showToast(languages[currentLang].copySuccess);
    });
}

function deleteAddon(id) {
    addons = addons.filter(item => item.id !== id);
    saveData();
    renderAddons();
    showToast(languages[currentLang].toastDel);
}

// --- EVENT LISTENERS HANDLING ---
function setupEventListeners() {
    // Language Switcher
    document.getElementById('lang-select').addEventListener('change', (e) => {
        currentLang = e.target.value;
        saveData();
        applyLanguage();
        renderAddons();
    });

    // Profile Username Edit Inline
    document.getElementById('username-input').addEventListener('blur', (e) => {
        let newName = e.target.value.trim();
        if(newName) {
            profile.username = newName;
            saveData();
            loadProfileUI();
            renderAddons(); // Update deletion capabilities inside view state
            showToast(languages[currentLang].toastProfile);
        }
    });

    // Profile Avatar Change From Device
    document.getElementById('avatar-input').addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profile.avatar = e.target.result;
                saveData();
                loadProfileUI();
                showToast(languages[currentLang].toastProfile);
            };
            reader.readAsDataURL(file);
        }
    });

    // Modal Control: Create Addon
    const createModal = document.getElementById('create-modal');
    const createCard = document.getElementById('create-modal-card');
    
    document.getElementById('open-create-modal').onclick = () => {
        createModal.classList.remove('hidden');
        setTimeout(() => createCard.classList.add('modal-active'), 10);
    };
    
    const hideCreateModal = () => {
        createCard.classList.remove('modal-active');
        setTimeout(() => {
            createModal.classList.add('hidden');
            document.getElementById('addon-form').reset();
            document.getElementById('img-preview').classList.add('hidden');
            tempAddonImg = "";
        }, 300);
    };
    
    document.getElementById('close-create-modal').onclick = hideCreateModal;

    // Process uploaded file for new addon
    document.getElementById('addon-img-input').addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                tempAddonImg = e.target.result;
                document.getElementById('img-preview').classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle Form Submit (Create Addon)
    document.getElementById('addon-form').onsubmit = (e) => {
        e.preventDefault();
        
        const newAddon = {
            id: 'addon-' + Date.now(),
            title: document.getElementById('addon-title').value,
            desc: document.getElementById('addon-desc').value,
            link: document.getElementById('addon-link').value,
            image: tempAddonImg || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500",
            creator: profile.username,
            ratings: [5],
            comments: []
        };

        addons.unshift(newAddon);
        saveData();
        renderAddons();
        hideCreateModal();
        showToast(languages[currentLang].toastAdd);
    };
}

// --- DETAIL MODAL & INTERACTION LAB ---
function openDetailModal(id) {
    const addon = addons.find(item => item.id === id);
    if (!addon) return;

    const modal = document.getElementById('detail-modal');
    const card = document.getElementById('detail-modal-card');
    const t = languages[currentLang];

    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    setTimeout(() => card.classList.add('modal-active'), 10);

    window.activeDetailAddonId = id; // Store temporary global references
    renderDetailContent(addon, t);

    document.getElementById('close-detail-modal').onclick = () => {
        card.classList.remove('modal-active');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }, 300);
    };
}

function renderDetailContent(addon, t) {
    const container = document.getElementById('detail-content');
    const avgRating = addon.ratings.length ? (addon.ratings.reduce((a,b) => a+b, 0) / addon.ratings.length).toFixed(1) : "0.0";

    // Comments Layout HTML
    let commentsHTML = "";
    if(addon.comments.length === 0) {
        commentsHTML = `<p class="text-slate-500 text-sm italic text-center py-4">${t.noComment}</p>`;
    } else {
        addon.comments.forEach(c => {
            let stars = "";
            for(let i=1; i<=5; i++) {
                stars += `<i class="fa-solid fa-star text-xs ${i <= c.rating ? 'text-amber-400' : 'text-slate-700'}"></i>`;
            }
            commentsHTML += `
                <div class="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-2">
                            <img src="${c.avatar}" class="w-6 h-6 rounded-full bg-slate-800 object-cover">
                            <span class="text-xs font-bold text-slate-200">${c.user}</span>
                        </div>
                        <div class="flex gap-0.5">${stars}</div>
                    </div>
                    <p class="text-sm text-slate-300 pl-8">${c.text}</p>
                </div>
            `;
        });
    }

    container.innerHTML = `
        <div class="space-y-5">
            <div class="relative h-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                <img src="${addon.image}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            </div>

            <div>
                <span class="text-xs font-bold uppercase tracking-widest text-emerald-400 px-2.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">${t.by} ${addon.creator}</span>
                <h2 class="text-3xl font-black mt-2 tracking-tight">${addon.title}</h2>
                <div class="flex items-center gap-2 mt-2 text-sm text-slate-400">
                    <div class="flex text-amber-400 gap-0.5"><i class="fa-solid fa-star"></i></div>
                    <span class="font-bold text-slate-200">${avgRating}</span> (${addon.ratings.length} Reviews)
                </div>
                <p class="text-slate-300 mt-4 leading-relaxed text-sm bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">${addon.desc}</p>
            </div>

            <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center gap-4">
                <span class="text-xs font-mono text-slate-400 truncate">${addon.link}</span>
                <button onclick="copyLink('${addon.link}')" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 shrink-0 transition">
                    <i class="fa-solid fa-copy"></i> Copy Link
                </button>
            </div>

            <div class="border-t border-slate-800 pt-5 space-y-4">
                <h3 class="font-black text-lg text-slate-200 flex items-center gap-2"><i class="fa-solid fa-comments text-indigo-400"></i> Reviews & Comments</h3>
                
                <div class="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div class="flex items-center gap-3">
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Rating Anda:</span>
                        <div class="flex gap-1.5" id="rating-input-stars">
                            <i class="fa-solid fa-star cursor-pointer text-xl star-btn text-amber-400" data-val="1"></i>
                            <i class="fa-solid fa-star cursor-pointer text-xl star-btn text-amber-400" data-val="2"></i>
                            <i class="fa-solid fa-star cursor-pointer text-xl star-btn text-amber-400" data-val="3"></i>
                            <i class="fa-solid fa-star cursor-pointer text-xl star-btn text-amber-400" data-val="4"></i>
                            <i class="fa-solid fa-star cursor-pointer text-xl star-btn text-amber-400" data-val="5"></i>
                        </div>
                    </div>
                    <div class="relative">
                        <textarea id="comment-text" rows="2" placeholder="${t.commentPlaceholder}" class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-2 text-sm resize-none"></textarea>
                    </div>
                    <div class="flex justify-end">
                        <button onclick="submitReview()" class="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg shadow-md transition transform active:scale-95 cursor-pointer">${t.submitComment}</button>
                    </div>
                </div>

                <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
                    ${commentsHTML}
                </div>
            </div>
        </div>
    `;

    // Internal dynamic rating star selectors logic
    window.selectedRatingVal = 5;
    const stars = container.querySelectorAll('.star-btn');
    stars.forEach(s => {
        s.onclick = function() {
            window.selectedRatingVal = parseInt(this.getAttribute('data-val'));
            stars.forEach((st, idx) => {
                if(idx < window.selectedRatingVal) {
                    st.classList.remove('text-slate-700');
                    st.classList.add('text-amber-400');
                } else {
                    st.classList.remove('text-amber-400');
                    st.classList.add('text-slate-700');
                }
            });
        };
    });
}

function submitReview() {
    const textVal = document.getElementById('comment-text').value.trim();
    if(!textVal) return;

    const addon = addons.find(item => item.id === window.activeDetailAddonId);
    if(addon) {
        // Push payload to storage array
        addon.ratings.push(window.selectedRatingVal);
        addon.comments.unshift({
            user: profile.username,
            avatar: profile.avatar,
            rating: window.selectedRatingVal,
            text: textVal
        });

        saveData();
        renderAddons();
        renderDetailContent(addon, languages[currentLang]);
    }
}

