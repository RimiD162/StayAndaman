/* ═══════════════════════════════════════════════════
   STAY-EASE — Admin Dashboard Scripts
   State management, API fetches, forms, and modals
   ═══════════════════════════════════════════════════ */

// ===== State =====
let allListings = [];
let allUsers = [];
let filteredUsers = [];
let allBookings = [];
let filteredBookings = [];
let editingId = null;
let deletingId = null;
let currentImageBase64_1 = '';
let currentImageBase64_2 = '';
let currentImageBase64_3 = '';
let currentImageBase64_4 = '';

// ===== DOM References =====
const sidebarLinks = document.querySelectorAll('.sidebar-link[data-page]');
const pages = document.querySelectorAll('.admin-page');
const topbarTitle = document.getElementById('topbar-title');
const formModal = document.getElementById('form-modal');
const deleteModal = document.getElementById('delete-modal');
const sidebar = document.getElementById('admin-sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');

// ===== Page Titles =====
const pageTitles = {
    overview: 'Dashboard Overview',
    hotels: 'Manage Hotels',
    lodges: 'Manage Lodges',
    rentals: 'Manage Rentals',
    users: 'Manage Users',
    bookings: 'Manage Bookings',
    profile: 'My Profile'
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    fetchListings();
    fetchProfile();
    fetchUsers();
    fetchBookings();
    setupNavigation();
    setupStarRating();
    setupAmenityChips();
    setupAvailabilityToggle();
    setupMobileMenu();
    setupUserFilters();

    // Check if page initial override is set from backend
    const initialPage = window.ADMIN_ACTIVE_PAGE || 'overview';
    switchPage(initialPage);
});

// ===== Navigation =====
function setupNavigation() {
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            switchPage(page);
            closeMobileMenu();
        });
    });
}

// ===== Switch Page =====
function switchPage(page) {
    sidebarLinks.forEach(l => l.classList.remove('active'));
    pages.forEach(p => p.classList.remove('active'));

    const activeLink = document.querySelector(`.sidebar-link[data-page="${page}"]`);
    const activePage = document.getElementById(`page-${page}`);

    if (activeLink) activeLink.classList.add('active');
    if (activePage) activePage.classList.add('active');
    if (topbarTitle) topbarTitle.textContent = pageTitles[page] || 'Dashboard';
}

// ===== Mobile Menu =====
function setupMobileMenu() {
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            if (sidebar) sidebar.classList.toggle('open');
            if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
        });
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeMobileMenu);
    }
}

function closeMobileMenu() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
}

// ===== Fetch Listings =====
async function fetchListings() {
    try {
        const res = await fetch('/api/listings');
        allListings = await res.json();
        renderAll();
    } catch (err) {
        console.error('Failed to fetch listings:', err);
        showToast('Failed to load listings', 'error');
    }
}

// ===== Render All =====
function renderAll() {
    renderStats();
    renderRecentTable();
    renderCategoryTable('Hotel', 'hotels-table-body');
    renderCategoryTable('Lodge', 'lodges-table-body');
    renderCategoryTable('Rental', 'rentals-table-body');
    updateBadgeCounts();
}

// ===== Stats =====
function renderStats() {
    const hotels = allListings.filter(l => l.category === 'Hotel').length;
    const lodges = allListings.filter(l => l.category === 'Lodge').length;
    const rentals = allListings.filter(l => l.category === 'Rental').length;

    const statHotels = document.getElementById('stat-hotels');
    const statLodges = document.getElementById('stat-lodges');
    const statRentals = document.getElementById('stat-rentals');
    const statTotal = document.getElementById('stat-total');
    
    const statBookings = document.getElementById('stat-bookings');
    const statBookingsToday = document.getElementById('stat-bookings-today');
    const statRevenue = document.getElementById('stat-revenue');

    if (statHotels) statHotels.textContent = hotels;
    if (statLodges) statLodges.textContent = lodges;
    if (statRentals) statRentals.textContent = rentals;
    if (statTotal) statTotal.textContent = allListings.length;
    
    if (statBookings) statBookings.textContent = allBookings.length;
    
    const today = new Date().toDateString();
    const newBookingsToday = allBookings.filter(b => new Date(b.createdAt).toDateString() === today).length;
    if (statBookingsToday) statBookingsToday.textContent = `${newBookingsToday} New Today`;
    
    const totalRev = allBookings.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    if (statRevenue) statRevenue.textContent = `₹${totalRev.toLocaleString('en-IN')}`;
}

function updateBadgeCounts() {
    const hotelBadge = document.getElementById('hotel-count-badge');
    const lodgeBadge = document.getElementById('lodge-count-badge');
    const rentalBadge = document.getElementById('rental-count-badge');
    const userBadge = document.getElementById('user-count-badge');
    const bookingBadge = document.getElementById('booking-count-badge');

    if (hotelBadge) hotelBadge.textContent = allListings.filter(l => l.category === 'Hotel').length;
    if (lodgeBadge) lodgeBadge.textContent = allListings.filter(l => l.category === 'Lodge').length;
    if (rentalBadge) rentalBadge.textContent = allListings.filter(l => l.category === 'Rental').length;
    if (userBadge) userBadge.textContent = allUsers.length;
    if (bookingBadge) bookingBadge.textContent = allBookings.length;
}

// ===== Recent Table =====
function renderRecentTable() {
    const tbody = document.getElementById('recent-table-body');
    if (!tbody) return;
    const recent = [...allListings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    if (recent.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="table-empty"><div class="table-empty-icon"></div><div class="table-empty-text">No listings yet</div><div class="table-empty-sub">Add your first listing to get started</div></div></td></tr>`;
        return;
    }

    tbody.innerHTML = recent.map(l => {
        const fallbackImg = l.category === 'Hotel' 
            ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&fit=crop' 
            : l.category === 'Lodge' 
                ? 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80&fit=crop' 
                : 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80&fit=crop';
        return `
        <tr>
            <td><img class="loaded" src="${l.image || l.image2 || l.image3 || l.image4 || fallbackImg}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&fit=crop'"></td>
            <td class="table-name">${escapeHtml(l.name)}</td>
            <td><span class="category-badge cat-${l.category}">${l.category}</span></td>
            <td>${escapeHtml(l.location)}</td>
            <td><strong>₹${(l.price || 0).toLocaleString('en-IN')}</strong></td>
            <td>${renderStars(l.rating)}</td>
            <td>${renderStatus(l.available)}</td>
        </tr>
        `;
    }).join('');
}

// ===== Category Table =====
function renderCategoryTable(category, tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    const items = allListings.filter(l => l.category === category);

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="table-empty"><div class="table-empty-icon"></div><div class="table-empty-text">No ${category.toLowerCase()}s added yet</div><div class="table-empty-sub">Click "Add ${category}" to create one</div></div></td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(l => {
        const fallbackImg = l.category === 'Hotel' 
            ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&fit=crop' 
            : l.category === 'Lodge' 
                ? 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80&fit=crop' 
                : 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80&fit=crop';
        return `
        <tr>
            <td><img class="loaded" src="${l.image || l.image2 || l.image3 || l.image4 || fallbackImg}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&fit=crop'"></td>
            <td class="table-name">${escapeHtml(l.name)}</td>
            <td>${escapeHtml(l.location)}</td>
            <td><strong>₹${(l.price || 0).toLocaleString('en-IN')}</strong></td>
            <td>${renderStars(l.rating)}</td>
            <td>${renderStatus(l.available)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-action btn-edit" title="Edit" onclick="openEditForm('${l._id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn-action btn-delete" title="Delete" onclick="openDeleteModal('${l._id}', '${escapeHtml(l.name).replace(/'/g, "\\'")}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>
        </tr>
        `;
    }).join('');
}

// ===== Helpers =====
function renderStars(rating) {
    let html = '<div class="table-rating">';
    for (let i = 1; i <= 5; i++) {
        html += i <= rating
            ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
            : '<svg width="14" height="14" class="star-empty" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    }
    html += `<span class="table-rating-value">${rating}.0</span></div>`;
    return html;
}

function renderStatus(available) {
    return available
        ? '<span class="status-badge available"><span class="status-dot"></span>Available</span>'
        : '<span class="status-badge unavailable"><span class="status-dot"></span>Unavailable</span>';
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ===== Star Rating =====
function setupStarRating() {
    const container = document.getElementById('star-rating-input');
    if (!container) return;
    const stars = container.querySelectorAll('.star-btn');
    const hiddenInput = document.getElementById('listing-rating');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = parseInt(star.dataset.value);
            if (hiddenInput) hiddenInput.value = val;
            stars.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.value) <= val);
            });
        });
    });
}

function setStarRating(val) {
    const ratingInput = document.getElementById('listing-rating');
    if (ratingInput) ratingInput.value = val;
    document.querySelectorAll('#star-rating-input .star-btn').forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.value) <= val);
    });
}

// ===== Fetch Users =====
async function fetchUsers() {
    try {
        const res = await fetch('/api/admin/users');
        allUsers = await res.json();
        filteredUsers = [...allUsers];
        renderUsersAll();
    } catch (err) {
        console.error('Failed to fetch users:', err);
        showToast('Failed to load users', 'error');
    }
}

// ===== Render Users All =====
function renderUsersAll() {
    renderUsersStats();
    renderUsersTable();
    updateBadgeCounts();
}

function renderUsersStats() {
    const statUsers = document.getElementById('stat-users');
    const statUsersToday = document.getElementById('stat-users-today');
    if (!statUsers) return;
    
    statUsers.textContent = allUsers.length;
    const today = new Date().toDateString();
    const newToday = allUsers.filter(u => new Date(u.createdAt).toDateString() === today).length;
    if (statUsersToday) statUsersToday.textContent = `${newToday} New Today`;
}

// ===== Render Users Table =====
function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    if (filteredUsers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10"><div class="table-empty"><div class="table-empty-icon"></div><div class="table-empty-text">No users found</div><div class="table-empty-sub">Adjust filters or search parameters</div></div></td></tr>`;
        return;
    }

    tbody.innerHTML = filteredUsers.map(u => `
        <tr class="${!u.isActive ? 'user-inactive-row' : ''}">
            <td class="col-avatar">
                ${u.avatar ? `<img class="table-thumb loaded" style="border-radius: 50%;" src="${u.avatar}" alt="${escapeHtml(u.fullName)}">` : `<div class="table-thumb-placeholder" style="border-radius: 50%; background: #f5a623; color: #1a1f36; font-weight: 700; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 14px;">${escapeHtml(u.fullName).charAt(0).toUpperCase()}</div>`}
            </td>
            <td class="table-name col-name">${escapeHtml(u.fullName)}</td>
            <td class="col-email">${escapeHtml(u.email)}</td>
            <td class="col-phone">${escapeHtml(u.phone)}</td>
            <td class="col-gender">${u.gender || '-'}</td>
            <td class="col-city">${escapeHtml(u.city) || '-'}</td>
            <td class="col-joined">${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
            <td class="col-lastlogin">${u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}</td>
            <td class="col-status">
                <span class="status-badge ${u.isActive ? 'available' : 'unavailable'}" style="cursor: pointer;" onclick="toggleUserStatus('${u._id}')">
                    <span class="status-dot"></span>
                    ${u.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="col-actions">
                <div class="table-actions">
                    <button class="btn-action btn-edit" title="View Details" onclick="viewUserDetails('${u._id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button class="btn-action btn-delete" title="Delete User" onclick="deleteUserPrompt('${u._id}', '${escapeHtml(u.fullName).replace(/'/g, "\\'")}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ===== Toggle User Status =====
async function toggleUserStatus(id) {
    try {
        const res = await fetch(`/api/admin/users/${id}/toggle`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (res.ok) {
            showToast(`User status updated to ${data.isActive ? 'Active' : 'Inactive'}.`, 'success');
            fetchUsers();
        } else {
            showToast(data.error || 'Failed to toggle status', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Failed to toggle status', 'error');
    }
}

// ===== View User Details Modal =====
function viewUserDetails(id) {
    const user = allUsers.find(u => u._id === id);
    if (!user) return;

    const modalBody = document.getElementById('user-detail-modal-body');
    if (!modalBody) return;
    
    const dobFormatted = user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not provided';
    const joinedFormatted = user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '-';
    const lastLoginFormatted = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never';

    modalBody.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 16px; margin-bottom: 24px;">
            <div style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; border: 3px solid var(--admin-border); background: var(--admin-card-bg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                ${user.avatar ? `<img class="loaded" src="${user.avatar}" alt="${escapeHtml(user.fullName)}" style="width:100%; height:100%; object-fit:cover;">` : `<div style="font-size: 36px; font-weight: 700; color: #f5a623;">${escapeHtml(user.fullName).charAt(0).toUpperCase()}</div>`}
            </div>
            <div>
                <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 4px; color: var(--admin-text);">${escapeHtml(user.fullName)}</h3>
                <span class="status-badge ${user.isActive ? 'available' : 'unavailable'}">
                    <span class="status-dot"></span>
                    ${user.isActive ? 'Account Active' : 'Account Deactivated'}
                </span>
            </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px; background: rgba(0,0,0,0.02); border: 1px solid var(--admin-border); border-radius: 8px; padding: 20px; color: var(--admin-text);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 8px; gap: 12px;">
                <span style="color: var(--admin-text-light); font-size: 13px; flex-shrink: 0;">Email Address</span>
                <strong style="font-size: 14px; word-break: break-all; text-align: right;">${escapeHtml(user.email)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 8px; gap: 12px;">
                <span style="color: var(--admin-text-light); font-size: 13px; flex-shrink: 0;">Phone Number</span>
                <strong style="font-size: 14px; word-break: break-all; text-align: right;">${escapeHtml(user.phone)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 8px; gap: 12px;">
                <span style="color: var(--admin-text-light); font-size: 13px; flex-shrink: 0;">Gender</span>
                <strong style="font-size: 14px; word-break: break-word; text-align: right;">${user.gender || 'Not specified'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 8px; gap: 12px;">
                <span style="color: var(--admin-text-light); font-size: 13px; flex-shrink: 0;">Date of Birth</span>
                <strong style="font-size: 14px; word-break: break-word; text-align: right;">${dobFormatted}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 8px; gap: 12px;">
                <span style="color: var(--admin-text-light); font-size: 13px; flex-shrink: 0;">City / Location</span>
                <strong style="font-size: 14px; word-break: break-word; text-align: right;">${escapeHtml(user.city) || 'Not provided'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 8px; gap: 12px;">
                <span style="color: var(--admin-text-light); font-size: 13px; flex-shrink: 0;">Joined Date</span>
                <strong style="font-size: 14px; word-break: break-word; text-align: right;">${joinedFormatted}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 4px; gap: 12px;">
                <span style="color: var(--admin-text-light); font-size: 13px; flex-shrink: 0;">Last Login</span>
                <strong style="font-size: 14px; word-break: break-word; text-align: right;">${lastLoginFormatted}</strong>
            </div>
        </div>

        <div style="margin-top: 24px; display: flex; justify-content: flex-end;">
            <button class="btn-cancel" onclick="closeUserDetailModal()">Close</button>
        </div>
    `;

    document.getElementById('user-detail-modal').classList.add('active');
}

function closeUserDetailModal() {
    const detailModal = document.getElementById('user-detail-modal');
    if (detailModal) detailModal.classList.remove('active');
}

// ===== Delete User Prompt =====
let userDeletingId = null;
function deleteUserPrompt(id, name) {
    userDeletingId = id;
    const deleteModalEl = document.getElementById('delete-modal');
    if (!deleteModalEl) return;
    
    deleteModalEl.querySelector('.delete-modal-title').textContent = 'Delete User';
    deleteModalEl.querySelector('.delete-modal-text').innerHTML = `Are you sure you want to delete <strong id="delete-listing-name">${escapeHtml(name)}</strong>? This action cannot be undone.`;
    
    const confirmBtn = document.getElementById('btn-delete-confirm');
    confirmBtn.onclick = confirmDeleteUser;

    deleteModalEl.classList.add('active');
}

async function confirmDeleteUser() {
    if (!userDeletingId) return;
    try {
        const res = await fetch(`/api/admin/users/${userDeletingId}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('User permanently deleted successfully.', 'success');
            fetchUsers();
        } else {
            const data = await res.json();
            showToast(data.error || 'Failed to delete user', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Failed to delete user', 'error');
    } finally {
        closeDeleteModal();
    }
}

// ===== Filters & Search Setup =====
function setupUserFilters() {
    const searchInput = document.getElementById('search-users');
    const genderSelect = document.getElementById('filter-user-gender');
    const cityInput = document.getElementById('filter-user-city');
    const dateStartInput = document.getElementById('filter-user-date-start');
    const dateEndInput = document.getElementById('filter-user-date-end');

    if (!searchInput) return;

    const applyFilters = () => {
        const search = searchInput.value.toLowerCase().trim();
        const gender = genderSelect.value;
        const city = cityInput.value.toLowerCase().trim();
        const start = dateStartInput.value;
        const end = dateEndInput.value;

        filteredUsers = allUsers.filter(u => {
            if (search && !u.fullName.toLowerCase().includes(search) && !u.email.toLowerCase().includes(search)) {
                return false;
            }
            if (gender && u.gender !== gender) {
                return false;
            }
            if (city && (!u.city || !u.city.toLowerCase().includes(city))) {
                return false;
            }
            if (start || end) {
                if (!u.createdAt) return false;
                const created = new Date(u.createdAt).toISOString().split('T')[0];
                if (start && created < start) return false;
                if (end && created > end) return false;
            }
            return true;
        });

        renderUsersTable();
    };

    searchInput.addEventListener('input', applyFilters);
    genderSelect.addEventListener('change', applyFilters);
    cityInput.addEventListener('input', applyFilters);
    dateStartInput.addEventListener('change', applyFilters);
    dateEndInput.addEventListener('change', applyFilters);
}

function resetUserFilters() {
    const searchInput = document.getElementById('search-users');
    const genderSelect = document.getElementById('filter-user-gender');
    const cityInput = document.getElementById('filter-user-city');
    const dateStartInput = document.getElementById('filter-user-date-start');
    const dateEndInput = document.getElementById('filter-user-date-end');

    if (searchInput) searchInput.value = '';
    if (genderSelect) genderSelect.value = '';
    if (cityInput) cityInput.value = '';
    if (dateStartInput) dateStartInput.value = '';
    if (dateEndInput) dateEndInput.value = '';
    
    filteredUsers = [...allUsers];
    renderUsersTable();
}

// ===== Amenity Chips =====
function setupAmenityChips() {
    document.querySelectorAll('.amenity-chip').forEach(chip => {
        const checkbox = chip.querySelector('input[type="checkbox"]');
        chip.addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT') return;
            checkbox.checked = !checkbox.checked;
            chip.classList.toggle('checked', checkbox.checked);
        });
        checkbox.addEventListener('change', () => {
            chip.classList.toggle('checked', checkbox.checked);
        });
    });
}

function setAmenities(amenities) {
    document.querySelectorAll('.amenity-chip').forEach(chip => {
        const checkbox = chip.querySelector('input[type="checkbox"]');
        const val = chip.dataset.amenity;
        const isChecked = amenities.includes(val);
        checkbox.checked = isChecked;
        chip.classList.toggle('checked', isChecked);
    });
}

// ===== Availability Toggle =====
function setupAvailabilityToggle() {
    const toggle = document.getElementById('listing-available');
    const label = document.getElementById('toggle-label-text');
    if (toggle && label) {
        toggle.addEventListener('change', () => {
            label.textContent = toggle.checked ? 'Available' : 'Not Available';
        });
    }
}

// ===== Image Upload =====
function previewImageSlot(slot, event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be under 5MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result;
        if (slot === 1) currentImageBase64_1 = base64;
        else if (slot === 2) currentImageBase64_2 = base64;
        else if (slot === 3) currentImageBase64_3 = base64;
        else if (slot === 4) currentImageBase64_4 = base64;

        const preview = document.getElementById(`image-preview-${slot}`);
        const area = document.getElementById(`image-upload-area-${slot}`);
        if (preview && area) {
            preview.src = base64;
            area.classList.add('has-image');
        }
    };
    reader.readAsDataURL(file);
}

function removeImageSlot(slot, event) {
    if (event) event.stopPropagation();
    if (slot === 1) currentImageBase64_1 = '';
    else if (slot === 2) currentImageBase64_2 = '';
    else if (slot === 3) currentImageBase64_3 = '';
    else if (slot === 4) currentImageBase64_4 = '';

    const preview = document.getElementById(`image-preview-${slot}`);
    const area = document.getElementById(`image-upload-area-${slot}`);
    const input = document.getElementById(`listing-image-input-${slot}`);
    if (preview) preview.src = '';
    if (area) area.classList.remove('has-image');
    if (input) input.value = '';
}

// ===== Open Add Form =====
function openForm(category) {
    editingId = null;
    currentImageBase64_1 = '';
    currentImageBase64_2 = '';
    currentImageBase64_3 = '';
    currentImageBase64_4 = '';
    document.getElementById('form-modal-title').textContent = `Add New ${category}`;
    document.getElementById('form-submit-btn').textContent = 'Save Listing';
    document.getElementById('listing-form').reset();
    document.getElementById('listing-id').value = '';
    document.getElementById('listing-category').value = category;
    
    for (let slot = 1; slot <= 4; slot++) {
        const preview = document.getElementById(`image-preview-${slot}`);
        const area = document.getElementById(`image-upload-area-${slot}`);
        if (preview) preview.src = '';
        if (area) area.classList.remove('has-image');
    }
    document.getElementById('toggle-label-text').textContent = 'Available';

    setStarRating(3);
    setAmenities([]);

    formModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ===== Open Edit Form =====
function openEditForm(id) {
    const listing = allListings.find(l => l._id === id);
    if (!listing) return;

    editingId = id;
    document.getElementById('form-modal-title').textContent = `Edit ${listing.category}`;
    document.getElementById('form-submit-btn').textContent = 'Update Listing';
    document.getElementById('listing-id').value = id;
    document.getElementById('listing-name').value = listing.name;
    document.getElementById('listing-category').value = listing.category;
    document.getElementById('listing-location').value = listing.location;
    document.getElementById('listing-price').value = listing.price;
    document.getElementById('listing-description').value = listing.description || '';
    document.getElementById('listing-contact').value = listing.contact || '';
    document.getElementById('listing-available').checked = listing.available;
    document.getElementById('toggle-label-text').textContent = listing.available ? 'Available' : 'Not Available';

    setStarRating(listing.rating || 3);
    setAmenities(listing.amenities || []);

    // Load up to 4 images
    currentImageBase64_1 = listing.image || '';
    currentImageBase64_2 = listing.image2 || '';
    currentImageBase64_3 = listing.image3 || '';
    currentImageBase64_4 = listing.image4 || '';

    for (let slot = 1; slot <= 4; slot++) {
        const imgVal = slot === 1 ? currentImageBase64_1 : slot === 2 ? currentImageBase64_2 : slot === 3 ? currentImageBase64_3 : currentImageBase64_4;
        const preview = document.getElementById(`image-preview-${slot}`);
        const area = document.getElementById(`image-upload-area-${slot}`);
        if (imgVal) {
            if (preview) preview.src = imgVal;
            if (area) area.classList.add('has-image');
        } else {
            if (preview) preview.src = '';
            if (area) area.classList.remove('has-image');
        }
    }

    formModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ===== Close Form =====
function closeForm() {
    formModal.classList.remove('active');
    document.body.style.overflow = '';
    editingId = null;
}

// ===== Handle Form Submit =====
async function handleFormSubmit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('form-submit-btn');
    submitBtn.classList.add('loading');
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Saving...';

    const amenitiesChecked = [];
    document.querySelectorAll('.amenity-chip input[type="checkbox"]:checked').forEach(cb => {
        amenitiesChecked.push(cb.value);
    });

    const data = {
        name: document.getElementById('listing-name').value.trim(),
        category: document.getElementById('listing-category').value,
        location: document.getElementById('listing-location').value.trim(),
        price: parseFloat(document.getElementById('listing-price').value),
        description: document.getElementById('listing-description').value.trim(),
        contact: document.getElementById('listing-contact').value.trim(),
        rating: parseInt(document.getElementById('listing-rating').value),
        amenities: amenitiesChecked,
        available: document.getElementById('listing-available').checked,
        image: currentImageBase64_1,
        image2: currentImageBase64_2,
        image3: currentImageBase64_3,
        image4: currentImageBase64_4
    };

    try {
        let res;
        if (editingId) {
            res = await fetch(`/api/listings/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            res = await fetch('/api/listings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        if (!res.ok) throw new Error('Failed to save');

        const result = await res.json();
        showToast(editingId ? 'Listing updated successfully!' : 'Listing added successfully!', 'success');
        closeForm();
        await fetchListings();
    } catch (err) {
        console.error(err);
        showToast('Failed to save listing. Please try again.', 'error');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.textContent = editingId ? 'Update Listing' : 'Save Listing';
    }
}

// ===== Delete =====
function openDeleteModal(id, name) {
    deletingId = id;
    const deleteModalEl = document.getElementById('delete-modal');
    if (!deleteModalEl) return;
    
    deleteModalEl.querySelector('.delete-modal-title').textContent = 'Delete Listing';
    deleteModalEl.querySelector('.delete-modal-text').innerHTML = `Are you sure you want to delete <strong id="delete-listing-name">${escapeHtml(name)}</strong>? This action cannot be undone.`;
    
    const confirmBtn = document.getElementById('btn-delete-confirm');
    confirmBtn.onclick = confirmDelete;

    deleteModalEl.classList.add('active');
}

function closeDeleteModal() {
    if (deleteModal) deleteModal.classList.remove('active');
    deletingId = null;
    userDeletingId = null;
    bookingDeletingId = null;
}

async function confirmDelete() {
    if (!deletingId) return;

    try {
        const res = await fetch(`/api/listings/${deletingId}`, {
            method: 'DELETE'
        });

        if (!res.ok) throw new Error('Failed to delete');

        showToast('Listing deleted successfully!', 'success');
        await fetchListings();
    } catch (err) {
        console.error(err);
        showToast('Failed to delete listing. Please try again.', 'error');
    } finally {
        closeDeleteModal();
    }
}

// ===== Toast Notifications =====
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };

    toast.innerHTML = `${icons[type] || icons.success}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 250);
    }, 3500);
}

// ===== Close modals on overlay click =====
if (formModal) {
    formModal.addEventListener('click', (e) => {
        if (e.target === formModal) closeForm();
    });
}

if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });
}

// ===== Close modals on Escape =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const deleteModalEl = document.getElementById('delete-modal');
        const formModalEl = document.getElementById('form-modal');
        if (deleteModalEl && deleteModalEl.classList.contains('active')) closeDeleteModal();
        else if (formModalEl && formModalEl.classList.contains('active')) closeForm();
    }
});

// =============================================
//  ADMIN PROFILE MANAGEMENT
// =============================================

let profileAvatarBase64 = '';
let currentProfile = {};

// ===== Fetch Profile =====
async function fetchProfile() {
    try {
        const res = await fetch('/api/admin/profile');
        if (res.ok) {
            currentProfile = await res.json();
            renderProfile();
        }
    } catch (err) {
        console.error('Failed to fetch profile:', err);
    }
}

// ===== Render Profile =====
function renderProfile() {
    const p = currentProfile;
    const name = p.displayName || 'Admin';
    const initial = name.charAt(0).toUpperCase();

    // Profile card
    const nameEl = document.getElementById('profile-display-name');
    const emailEl = document.getElementById('profile-display-email');
    const phoneEl = document.getElementById('profile-display-phone');
    const locEl = document.getElementById('profile-display-location');
    const webEl = document.getElementById('profile-display-website');

    if (nameEl) nameEl.textContent = name;
    if (emailEl) emailEl.textContent = p.email || 'Not set';
    if (phoneEl) phoneEl.textContent = p.phone || 'Not set';
    if (locEl) locEl.textContent = p.location || 'Not set';
    if (webEl) webEl.textContent = p.website || 'Not set';

    // Avatar on profile card
    const avatarLetter = document.getElementById('profile-avatar-letter');
    const avatarImg = document.getElementById('profile-avatar-img');
    if (avatarLetter && avatarImg) {
        if (p.avatar) {
            avatarImg.src = p.avatar;
            avatarImg.style.display = 'block';
            avatarLetter.style.display = 'none';
        } else {
            avatarImg.style.display = 'none';
            avatarLetter.style.display = 'block';
            avatarLetter.textContent = initial;
        }
    }

    // Topbar avatar
    const topbarAvatar = document.getElementById('topbar-avatar');
    const topbarName = document.getElementById('topbar-admin-name');
    if (topbarName) topbarName.textContent = name;
    if (topbarAvatar) {
        if (p.avatar) {
            topbarAvatar.innerHTML = `<img src="${p.avatar}" alt="${name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
        } else {
            topbarAvatar.textContent = initial;
        }
    }

    // Edit form
    const pName = document.getElementById('profile-name');
    const pEmail = document.getElementById('profile-email');
    const pPhone = document.getElementById('profile-phone');
    const pLoc = document.getElementById('profile-location');
    const pWeb = document.getElementById('profile-website');
    const pBio = document.getElementById('profile-bio');

    if (pName) pName.value = p.displayName || '';
    if (pEmail) pEmail.value = p.email || '';
    if (pPhone) pPhone.value = p.phone || '';
    if (pLoc) pLoc.value = p.location || '';
    if (pWeb) pWeb.value = p.website || '';
    if (pBio) pBio.value = p.bio || '';

    // Avatar in edit form
    profileAvatarBase64 = p.avatar || '';
    const uploadArea = document.getElementById('profile-avatar-upload');
    const preview = document.getElementById('profile-avatar-preview');
    if (uploadArea && preview) {
        if (p.avatar) {
            preview.src = p.avatar;
            uploadArea.classList.add('has-image');
        } else {
            preview.src = '';
            uploadArea.classList.remove('has-image');
        }
    }
}

// ===== Profile Avatar Upload =====
function previewProfileAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
        showToast('Avatar must be under 2MB', 'error');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        profileAvatarBase64 = e.target.result;
        const preview = document.getElementById('profile-avatar-preview');
        const uploadArea = document.getElementById('profile-avatar-upload');
        if (preview) preview.src = profileAvatarBase64;
        if (uploadArea) uploadArea.classList.add('has-image');
    };
    reader.readAsDataURL(file);
}

function removeProfileAvatar(event) {
    event.stopPropagation();
    profileAvatarBase64 = '';
    const preview = document.getElementById('profile-avatar-preview');
    const uploadArea = document.getElementById('profile-avatar-upload');
    const input = document.getElementById('profile-avatar-input');
    
    if (preview) preview.src = '';
    if (uploadArea) uploadArea.classList.remove('has-image');
    if (input) input.value = '';
}

// ===== Reset Profile Form =====
function resetProfileForm() {
    renderProfile();
    showToast('Form reset to saved values', 'warning');
}

// ===== Handle Profile Submit =====
async function handleProfileSubmit(event) {
    event.preventDefault();
    const submitBtn = document.getElementById('profile-submit-btn');
    if (!submitBtn) return;
    
    submitBtn.classList.add('loading');
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Saving...';

    const data = {
        displayName: document.getElementById('profile-name').value.trim(),
        email: document.getElementById('profile-email').value.trim(),
        phone: document.getElementById('profile-phone').value.trim(),
        location: document.getElementById('profile-location').value.trim(),
        website: document.getElementById('profile-website').value.trim(),
        bio: document.getElementById('profile-bio').value.trim(),
        avatar: profileAvatarBase64
    };

    try {
        const res = await fetch('/api/admin/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error('Failed to update profile');

        currentProfile = await res.json();
        renderProfile();
        showToast('Profile updated successfully!', 'success');
    } catch (err) {
        console.error(err);
        showToast('Failed to update profile', 'error');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Save Changes';
    }
}

// ===== Fetch Bookings =====
async function fetchBookings() {
    try {
        const res = await fetch('/api/admin/bookings');
        allBookings = await res.json();
        filteredBookings = [...allBookings];
        renderBookingsAll();
    } catch (err) {
        console.error('Failed to fetch bookings:', err);
        showToast('Failed to load bookings', 'error');
    }
}

// ===== Render Bookings All =====
function renderBookingsAll() {
    renderBookingsStats();
    renderBookingsTable();
    updateBadgeCounts();
    renderStats(); // Update dashboard overview stats
}

// ===== Bookings Stats =====
function renderBookingsStats() {
    const revTotalEl = document.getElementById('rev-total');
    const revMonthEl = document.getElementById('rev-month');
    const revPendingEl = document.getElementById('rev-pending');
    const revCancelledEl = document.getElementById('rev-cancelled-count');
    
    const activeBookings = allBookings.filter(b => b.status !== 'Cancelled');

    // Total revenue from all non-cancelled bookings
    if (revTotalEl) {
        const totalRev = activeBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        revTotalEl.textContent = `₹${totalRev.toLocaleString('en-IN')}`;
    }

    // This month's revenue (non-cancelled bookings created in current month)
    if (revMonthEl) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthRev = activeBookings
            .filter(b => {
                const d = new Date(b.createdAt);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        revMonthEl.textContent = `₹${thisMonthRev.toLocaleString('en-IN')}`;
    }

    // Pending revenue (status is Pending or payment method is Pay at Property and status is Confirmed/Pending)
    if (revPendingEl) {
        const pendingAmount = allBookings
            .filter(b => b.status === 'Pending' || (b.paymentMethod === 'Pay at Property' && b.status !== 'Cancelled'))
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        revPendingEl.textContent = `₹${pendingAmount.toLocaleString('en-IN')}`;
    }

    // Cancelled count
    if (revCancelledEl) {
        const cancelledCount = allBookings.filter(b => b.status === 'Cancelled').length;
        revCancelledEl.textContent = cancelledCount;
    }
}

// ===== Render Bookings Table =====
function renderBookingsTable() {
    const tbody = document.getElementById('bookings-table-body');
    const countEl = document.getElementById('booking-results-count');
    if (!tbody) return;

    if (countEl) countEl.textContent = filteredBookings.length;

    if (filteredBookings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8"><div class="table-empty"><div class="table-empty-icon"></div><div class="table-empty-text">No bookings found</div><div class="table-empty-sub">Adjust filters or search parameters</div></div></td></tr>`;
        return;
      }

      tbody.innerHTML = filteredBookings.map(b => {
          const checkin = new Date(b.checkIn).toLocaleDateString('en-IN', {day:'numeric', month:'short'});
          const checkout = new Date(b.checkOut).toLocaleDateString('en-IN', {day:'numeric', month:'short'});
          const fallbackImg = b.category === 'Hotel' 
              ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&fit=crop' 
              : b.category === 'Lodge' 
                  ? 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80&fit=crop' 
                  : 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80&fit=crop';
          const listingImg = b.listingImage || fallbackImg;
          
          let statusBadgeClass = 'pending';
          if(b.status === 'Confirmed') statusBadgeClass = 'available';
          if(b.status === 'Cancelled') statusBadgeClass = 'unavailable';

          return `
          <tr>
              <td><strong style="color:var(--primary); font-family:var(--font-mono); font-size:13px;">#${b.bookingId}</strong></td>
              <td>
                  <div style="display:flex; align-items:center; gap:10px;">
                      <img src="${listingImg}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&fit=crop'">
                      <div>
                          <div style="font-weight:600; font-size:13px; color:var(--admin-text);">${escapeHtml(b.listingName)}</div>
                          <div style="font-size:11px; color:var(--text-soft);">${escapeHtml(b.location.split(',')[0])} &bull; ${b.category}</div>
                      </div>
                  </div>
              </td>
              <td>
                  <div style="font-size:13px; font-weight:600; color:var(--admin-text);">${escapeHtml(b.guestName)}</div>
                  <div style="font-size:11px; color:var(--text-soft);">${escapeHtml(b.guestEmail)} &bull; ${escapeHtml(b.guestPhone)}</div>
              </td>
              <td>
                  <div style="font-size:13px; font-weight:600; color:var(--admin-text);">📅 ${checkin} &rarr; ${checkout}</div>
                  <div style="font-size:11px; color:var(--text-soft);">${b.nights} night${b.nights > 1 ? 's' : ''} &bull; ${b.guests} guest${b.guests > 1 ? 's' : ''} &bull; ${b.roomType}</div>
              </td>
              <td><strong>₹${(b.totalAmount || 0).toLocaleString('en-IN')}</strong></td>
              <td><span style="font-size:12px; color:var(--text-mid);">${b.paymentMethod}</span></td>
              <td>
                  <span class="status-badge ${statusBadgeClass}">
                      <span class="status-dot"></span>
                      ${b.status}
                  </span>
              </td>
              <td>
                  <div class="table-actions">
                      <button class="btn-action btn-edit" title="View Details" onclick="viewAdminBookingDetails('${b._id || b.id}')">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button class="btn-action btn-delete" title="Delete Booking" onclick="deleteBookingPrompt('${b._id || b.id}', '${b.bookingId}')">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                  </div>
              </td>
          </tr>
          `;
      }).join('');
}

// ===== Filter Bookings =====
function filterBookings() {
    const search = (document.getElementById('filter-booking-search')?.value || '').toLowerCase().trim();
    const category = document.getElementById('filter-booking-category')?.value;
    const status = document.getElementById('filter-booking-status')?.value;
    const payment = document.getElementById('filter-booking-payment')?.value;
    const dateStart = document.getElementById('filter-booking-date-start')?.value;
    const dateEnd = document.getElementById('filter-booking-date-end')?.value;

    filteredBookings = allBookings.filter(b => {
        let show = true;
        
        if (search) {
            const bookingId = (b.bookingId || '').toLowerCase();
            const guestName = (b.guestName || '').toLowerCase();
            const property = (b.listingName || '').toLowerCase();
            const email = (b.guestEmail || '').toLowerCase();
            const phone = (b.guestPhone || '').toLowerCase();
            if (!bookingId.includes(search) && !guestName.includes(search) && !property.includes(search) && !email.includes(search) && !phone.includes(search)) {
                show = false;
            }
        }
        
        if (category && b.category !== category) show = false;
        if (status && b.status !== status) show = false;
        if (payment && b.paymentMethod !== payment) show = false;
        
        if (dateStart) {
            const bCheckin = new Date(b.checkIn).toISOString().split('T')[0];
            if (bCheckin < dateStart) show = false;
        }
        
        if (dateEnd) {
            const bCheckin = new Date(b.checkIn).toISOString().split('T')[0];
            if (bCheckin > dateEnd) show = false;
        }
        
        return show;
    });

    renderBookingsTable();
}

// ===== Reset Booking Filters =====
function resetBookingFilters() {
    const search = document.getElementById('filter-booking-search');
    const cat = document.getElementById('filter-booking-category');
    const stat = document.getElementById('filter-booking-status');
    const pay = document.getElementById('filter-booking-payment');
    const start = document.getElementById('filter-booking-date-start');
    const end = document.getElementById('filter-booking-date-end');

    if (search) search.value = '';
    if (cat) cat.value = '';
    if (stat) stat.value = '';
    if (pay) pay.value = '';
    if (start) start.value = '';
    if (end) end.value = '';

    filteredBookings = [...allBookings];
    renderBookingsTable();
}

// ===== View Booking Details in Admin Modal =====
function viewAdminBookingDetails(id) {
    const booking = allBookings.find(b => b._id === id || b.id === id);
    if (!booking) return;

    const modalBody = document.getElementById('admin-booking-detail-body');
    if (!modalBody) return;

    const checkin = new Date(booking.checkIn).toLocaleDateString('en-IN', {year:'numeric', month:'long', day:'numeric'});
    const checkout = new Date(booking.checkOut).toLocaleDateString('en-IN', {year:'numeric', month:'long', day:'numeric'});
    const created = new Date(booking.createdAt).toLocaleString();
    const fallbackImg = booking.category === 'Hotel' 
        ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&fit=crop' 
        : booking.category === 'Lodge' 
            ? 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80&fit=crop' 
            : 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80&fit=crop';
    const listingImg = booking.listingImage || fallbackImg;

    modalBody.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px; color:var(--admin-text);">
            
            <!-- Property Header -->
            <div style="display:flex; align-items:center; gap:12px; padding-bottom:12px; border-bottom:1px solid var(--admin-border);">
                <img src="${listingImg}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&fit=crop'">
                <div>
                    <h3 style="font-size:16px; font-weight:700; margin:0;">${escapeHtml(booking.listingName)}</h3>
                    <div style="font-size:12px; color:var(--admin-text-light); margin-top:2px;">📍 ${escapeHtml(booking.location)} (${booking.category})</div>
                </div>
            </div>

            <!-- Booking Info Grid -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:13px;">
                <div>
                    <span style="color:var(--admin-text-light);">Booking ID</span><br>
                    <strong style="font-family:var(--font-mono); font-size:14px; color:var(--primary);">#${booking.bookingId}</strong>
                </div>
                <div>
                    <span style="color:var(--admin-text-light);">Booked On</span><br>
                    <strong>${created}</strong>
                </div>
                <div>
                    <span style="color:var(--admin-text-light);">Check-in Date</span><br>
                    <strong>📅 ${checkin}</strong>
                </div>
                <div>
                    <span style="color:var(--admin-text-light);">Check-out Date</span><br>
                    <strong>📅 ${checkout}</strong>
                </div>
                <div>
                    <span style="color:var(--admin-text-light);">Stay Details</span><br>
                    <strong>${booking.nights} Night${booking.nights > 1 ? 's' : ''} &bull; ${booking.guests} Guest${booking.guests > 1 ? 's' : ''}</strong>
                </div>
                <div>
                    <span style="color:var(--admin-text-light);">Room Category</span><br>
                    <strong>${booking.roomType} Suite</strong>
                </div>
            </div>

            <hr style="border:0; height:1px; background:var(--admin-border); margin:4px 0;">

            <!-- Guest Details -->
            <div style="font-size:13px;">
                <span style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--admin-text-light); display:block; margin-bottom:4px;">Guest Profile</span>
                <strong>Name:</strong> ${escapeHtml(booking.guestName)}<br>
                <strong>Email:</strong> ${escapeHtml(booking.guestEmail)}<br>
                <strong>Phone:</strong> ${escapeHtml(booking.guestPhone)}
            </div>

            ${booking.specialRequests ? `
            <div style="font-size:13px;">
                <span style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--admin-text-light); display:block; margin-bottom:4px;">Special Requests</span>
                <div style="background:rgba(0,0,0,0.02); border:1px solid var(--admin-border); border-radius:6px; padding:10px; line-height:1.4; color:var(--admin-text-light);">
                    ${escapeHtml(booking.specialRequests)}
                </div>
            </div>
            ` : ''}

            <hr style="border:0; height:1px; background:var(--admin-border); margin:4px 0;">

            <!-- Payment Details -->
            <div style="font-size:13px;">
                <span style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--admin-text-light); display:block; margin-bottom:6px;">Financial Summary</span>
                <div style="display:flex; flex-direction:column; gap:4px; font-size:12.5px;">
                    <div style="display:flex; justify-content:space-between;">
                        <span>Room Subtotal (${booking.nights} nights &times; ₹${booking.pricePerNight.toLocaleString('en-IN')})</span>
                        <span>₹${booking.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    ${booking.tax && booking.tax > 0 ? `
                    <div style="display:flex; justify-content:space-between;">
                        <span>GST Tax Charges (18%)</span>
                        <span>₹${booking.tax.toLocaleString('en-IN')}</span>
                    </div>
                    ` : ''}
                    <div style="display:flex; justify-content:space-between; font-weight:700; font-size:14px; border-top:1px dashed var(--admin-border); padding-top:6px; margin-top:4px;">
                        <span>Total Paid Amount (${booking.paymentMethod})</span>
                        <span>₹${booking.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>

            <hr style="border:0; height:1px; background:var(--admin-border); margin:4px 0;">

            <!-- Status Modification Controls -->
            <div style="display:flex; align-items:center; justify-content:space-between; margin-top:4px;">
                <div>
                    <label class="form-label" for="update-booking-status-select" style="margin-bottom:2px; font-size:11px;">Modify Stay Status</label>
                    <select id="update-booking-status-select" class="form-select" style="width:160px; padding:6px 10px; font-size:12.5px;" onchange="updateBookingStatusAJAX('${booking._id || booking.id}', this.value)">
                        <option value="Pending" ${booking.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Confirmed" ${booking.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Cancelled" ${booking.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
                <div style="text-align:right;">
                    <span style="font-size:11px; color:var(--admin-text-light); display:block; margin-bottom:2px;">Current Badge</span>
                    <span class="status-badge ${booking.status === 'Confirmed' ? 'available' : (booking.status === 'Cancelled' ? 'unavailable' : 'pending')}">${booking.status}</span>
                </div>
            </div>
            
            <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
                <button class="btn-cancel" onclick="closeAdminBookingDetailModal()">Close Details</button>
            </div>
        </div>
    `;

    document.getElementById('booking-detail-modal').classList.add('active');
}

function closeAdminBookingDetailModal() {
    const detailModal = document.getElementById('booking-detail-modal');
    if (detailModal) detailModal.classList.remove('active');
}

// ===== Update Booking Status AJAX =====
async function updateBookingStatusAJAX(id, status) {
    try {
        const res = await fetch(`/admin/booking/status/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const result = await res.json();
        
        if (res.ok && result.success) {
            showToast(`Booking status updated to ${status}.`, 'success');
            
            // Refresh table details locally without modal closing
            fetchBookings();
            
            // Update current badge inside modal if open
            const select = document.getElementById('update-booking-status-select');
            if (select) {
                const badge = select.closest('div').nextElementSibling.querySelector('.status-badge');
                if (badge) {
                    badge.className = `status-badge ${status === 'Confirmed' ? 'available' : (status === 'Cancelled' ? 'unavailable' : 'pending')}`;
                    badge.innerText = status;
                }
            }
        } else {
            showToast(result.error || 'Failed to update status', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Network error during status update', 'error');
    }
}

// ===== Delete Booking Prompt =====
let bookingDeletingId = null;
function deleteBookingPrompt(id, bookingId) {
    bookingDeletingId = id;
    const deleteModalEl = document.getElementById('delete-modal');
    if (!deleteModalEl) return;

    deleteModalEl.querySelector('.delete-modal-title').textContent = 'Delete Booking';
    deleteModalEl.querySelector('.delete-modal-text').innerHTML = `Are you sure you want to delete Booking record <strong id="delete-listing-name">#${bookingId}</strong>? This action cannot be undone.`;

    const confirmBtn = document.getElementById('btn-delete-confirm');
    confirmBtn.onclick = confirmDeleteBooking;

    deleteModalEl.classList.add('active');
}

async function confirmDeleteBooking() {
    if (!bookingDeletingId) return;
    try {
        const res = await fetch(`/admin/booking/delete/${bookingDeletingId}`, { method: 'POST' });
        const result = await res.json();
        if (res.ok && result.success) {
            showToast('Booking record deleted successfully.', 'success');
            fetchBookings();
        } else {
            showToast(result.error || 'Failed to delete booking', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Failed to delete booking', 'error');
    } finally {
        closeDeleteModal();
    }
}

// ===== Export Bookings CSV =====
function exportBookingsCSV() {
    window.location.href = '/api/admin/bookings/export';
}
