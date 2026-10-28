// Admin page (admin.html). Uses SUPABASE_URL, SUPABASE_KEY, escapeHtml and safeImageUrl from scripts.js.
// This page only hides the tools from the public site; the database's Row Level Security
// policies (supabase/security.sql) are what actually restrict who can publish.
// By design there is no delete feature: published activities and photos are never removed from here.

const ADMIN_SESSION_KEY = 'cdl_admin_session';
const IMAGE_BUCKET = 'activity-images';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

// Client-side cooldown for the sign-in form. This only slows down the form;
// the server-side limit is Supabase Auth's own rate limiting.
const LOGIN_COOLDOWN_KEY = 'cdl_admin_login_attempts';
const LOGIN_COOLDOWN_MINUTES = [0, 0, 1, 3, 5, 15, 30]; // after the 1st..7th+ failure

function readLoginAttempts() {
    try {
        const data = JSON.parse(localStorage.getItem(LOGIN_COOLDOWN_KEY));
        if (data && typeof data.failures === 'number') return data;
    } catch (err) { /* storage unavailable */ }
    return { failures: 0, lockedUntil: 0 };
}

function writeLoginAttempts(data) {
    try {
        if (data.failures === 0) localStorage.removeItem(LOGIN_COOLDOWN_KEY);
        else localStorage.setItem(LOGIN_COOLDOWN_KEY, JSON.stringify(data));
    } catch (err) { /* storage unavailable */ }
}

function recordLoginFailure() {
    const data = readLoginAttempts();
    data.failures += 1;
    const index = Math.min(data.failures, LOGIN_COOLDOWN_MINUTES.length) - 1;
    data.lockedUntil = Date.now() + LOGIN_COOLDOWN_MINUTES[index] * 60 * 1000;
    writeLoginAttempts(data);
}

// Session is kept in sessionStorage, so it ends when the tab is closed.
function loadSession() {
    try { return JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY)); } catch (err) { return null; }
}

function saveSession(session) {
    try {
        if (session) sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
        else sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (err) { /* storage unavailable */ }
}

function sessionFromAuth(authData) {
    return {
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
        expires_at: Date.now() + (authData.expires_in || 3600) * 1000,
        user_id: authData.user && authData.user.id,
        email: authData.user && authData.user.email
    };
}

document.addEventListener('DOMContentLoaded', function () {
    const statusBox = document.getElementById('admin-status');
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const loginSubmit = document.getElementById('login-submit');
    const signOutBtn = document.getElementById('sign-out-btn');
    const userEmail = document.getElementById('admin-user-email');
    const activityForm = document.getElementById('activity-form');
    const activitySubmit = document.getElementById('activity-submit');
    const photoInput = document.getElementById('activity-photo');
    const photoPreview = document.getElementById('activity-photo-preview');
    const activityList = document.getElementById('activity-list');
    const refreshBtn = document.getElementById('refresh-btn');

    let session = loadSession();
    let previewUrl = null;
    // If a photo uploaded but saving the activity failed, reuse it on retry instead of uploading again.
    let uploadedPhoto = null; // { file, url }

    function showStatus(message, kind) {
        const styles = {
            error: 'border-red-200 bg-red-50 text-red-800',
            success: 'border-green-200 bg-green-50 text-green-800',
            info: 'border-gray-200 bg-white text-gray-700'
        };
        statusBox.className = `mb-6 rounded-xl border px-4 py-3 text-sm ${styles[kind] || styles.info}`;
        statusBox.textContent = message;
    }

    function clearStatus() {
        statusBox.className = 'hidden';
        statusBox.textContent = '';
    }

    function showLogin() {
        dashboardView.classList.add('hidden');
        loginView.classList.remove('hidden');
        signOutBtn.classList.add('hidden');
        userEmail.textContent = '';
    }

    function showDashboard() {
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        signOutBtn.classList.remove('hidden');
        userEmail.textContent = session.email || '';
        loadActivities();
    }

    async function refreshSession() {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: session.refresh_token })
        });
        if (!response.ok) throw new Error('expired');
        session = sessionFromAuth(await response.json());
        saveSession(session);
    }

    // Returns a valid access token, refreshing it when it is about to expire.
    async function getAccessToken() {
        if (!session) throw new Error('expired');
        if (session.expires_at - Date.now() < 60 * 1000) await refreshSession();
        return session.access_token;
    }

    function endSession(message) {
        session = null;
        saveSession(null);
        showLogin();
        if (message) showStatus(message, 'info');
    }

    async function authHeaders(extra) {
        const token = await getAccessToken();
        return Object.assign({ 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${token}` }, extra || {});
    }

    // Checks the staff allowlist via the is_admin() database function from supabase/security.sql.
    // Returns null when the function is not installed yet (Row Level Security still applies).
    async function checkIsAdmin() {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
            method: 'POST',
            headers: await authHeaders({ 'Content-Type': 'application/json' }),
            body: '{}'
        });
        if (!response.ok) return null;
        return (await response.json()) === true;
    }

    // ---- Sign in / out ----

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        clearStatus();

        const attempts = readLoginAttempts();
        if (attempts.lockedUntil > Date.now()) {
            const minutes = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
            showStatus(`Too many failed sign-in attempts. Please wait ${minutes} minute${minutes === 1 ? '' : 's'} and try again.`, 'error');
            return;
        }

        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;
        loginSubmit.disabled = true;

        try {
            const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (response.status === 429) {
                showStatus('Too many sign-in attempts. Please try again later.', 'error');
                return;
            }
            if (!response.ok) {
                recordLoginFailure();
                showStatus('Sign-in failed. Please check your email and password.', 'error');
                return;
            }
            writeLoginAttempts({ failures: 0, lockedUntil: 0 });
            session = sessionFromAuth(await response.json());
            saveSession(session);

            if (await checkIsAdmin() === false) {
                await signOut();
                showStatus('This account does not have admin access.', 'error');
                return;
            }
            loginForm.reset();
            showDashboard();
        } catch (err) {
            console.error('Sign-in error:', err.message);
            showStatus('Could not reach the server. Please check your connection.', 'error');
        } finally {
            loginSubmit.disabled = false;
        }
    });

    async function signOut() {
        const token = session && session.access_token;
        endSession();
        if (token) {
            fetch(`${SUPABASE_URL}/auth/v1/logout`, {
                method: 'POST',
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${token}` }
            }).catch(() => {});
        }
    }

    signOutBtn.addEventListener('click', function () {
        clearStatus();
        signOut();
    });

    // ---- Published activities (read-only) ----

    function renderActivities(activities) {
        activityList.replaceChildren();
        if (!activities.length) {
            const empty = document.createElement('li');
            empty.className = 'px-6 py-8 text-sm text-gray-500 text-center';
            empty.textContent = 'No activities published yet.';
            activityList.appendChild(empty);
            return;
        }
        activities.forEach(activity => {
            const item = document.createElement('li');
            item.className = 'px-6 py-4 flex items-center gap-4';

            const image = document.createElement('img');
            image.src = safeImageUrl(activity.image_url, 'images/OIP-17.png');
            image.alt = '';
            image.loading = 'lazy';
            image.className = 'w-16 h-16 rounded-lg object-cover border border-gray-200 bg-gray-50 flex-shrink-0';

            const text = document.createElement('div');
            text.className = 'min-w-0';
            const title = document.createElement('p');
            title.className = 'text-sm font-semibold text-deepCharcoal truncate';
            title.textContent = activity.title || 'Untitled activity';
            const meta = document.createElement('p');
            meta.className = 'text-xs text-gray-500 mt-0.5';
            const date = activity.date ? new Date(activity.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
            meta.textContent = [date, activity.location].filter(Boolean).join(' · ');
            text.append(title, meta);

            item.append(image, text);
            activityList.appendChild(item);
        });
    }

    async function loadActivities() {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/project_activities?select=id,title,date,location,image_url&order=date.desc&limit=100`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            if (!response.ok) throw new Error(`status ${response.status}`);
            renderActivities(await response.json());
        } catch (err) {
            console.error('Could not load activities:', err.message);
            activityList.innerHTML = '<li class="px-6 py-8 text-sm text-gray-500 text-center">Could not load activities.</li>';
        }
    }

    refreshBtn.addEventListener('click', loadActivities);

    // ---- Photo selection ----

    function validatePhoto(file) {
        if (!IMAGE_TYPES[file.type]) return 'Photo must be a JPG, PNG or WebP image.';
        const extension = (file.name.split('.').pop() || '').toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'webp'].includes(extension)) return 'Photo must have a .jpg, .png or .webp file name.';
        if (file.size > MAX_IMAGE_BYTES) return 'Photo must be 5 MB or smaller.';
        return null;
    }

    function clearPreview() {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = null;
        photoPreview.removeAttribute('src');
        photoPreview.classList.add('hidden');
    }

    photoInput.addEventListener('change', function () {
        clearPreview();
        const file = photoInput.files[0];
        if (!file) return;
        const problem = validatePhoto(file);
        if (problem) {
            showStatus(problem, 'error');
            photoInput.value = '';
            return;
        }
        clearStatus();
        previewUrl = URL.createObjectURL(file);
        photoPreview.src = previewUrl;
        photoPreview.classList.remove('hidden');
    });

    activityForm.addEventListener('reset', function () {
        clearPreview();
        uploadedPhoto = null;
    });

    // Uploads to the public activity-images bucket under a generated name; returns the public URL.
    async function uploadPhoto(file) {
        if (uploadedPhoto && uploadedPhoto.file === file) return uploadedPhoto.url;

        const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${IMAGE_TYPES[file.type]}`;
        const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${IMAGE_BUCKET}/${path}`, {
            method: 'POST',
            headers: await authHeaders({ 'Content-Type': file.type, 'Cache-Control': '3600', 'x-upsert': 'false' }),
            body: file
        });
        if (!response.ok) {
            console.error('Photo upload failed with status', response.status);
            throw new Error(response.status === 401 || response.status === 403
                ? 'This account is not allowed to upload photos.'
                : 'The photo could not be uploaded. Please try again.');
        }
        const url = `${SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
        uploadedPhoto = { file, url };
        return url;
    }

    // ---- Publish ----

    activityForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        clearStatus();

        const file = photoInput.files[0];
        const imageLink = document.getElementById('activity-image-url').value.trim();
        if (file) {
            const problem = validatePhoto(file);
            if (problem) { showStatus(problem, 'error'); return; }
        } else if (imageLink && !/^https?:\/\//i.test(imageLink)) {
            showStatus('Image link must start with https:// or http://', 'error');
            return;
        }

        activitySubmit.disabled = true;
        try {
            const imageUrl = file ? await uploadPhoto(file) : imageLink;
            const response = await fetch(`${SUPABASE_URL}/rest/v1/project_activities`, {
                method: 'POST',
                headers: await authHeaders({ 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }),
                body: JSON.stringify({
                    title: document.getElementById('activity-title').value.trim(),
                    description: document.getElementById('activity-description').value.trim(),
                    location: document.getElementById('activity-location').value.trim(),
                    date: document.getElementById('activity-date').value,
                    image_url: imageUrl,
                    user_id: session.user_id
                })
            });
            if (!response.ok) {
                console.error('Insert failed with status', response.status);
                throw new Error(response.status === 401 || response.status === 403
                    ? 'This account is not allowed to add activities.'
                    : 'The activity could not be saved. Please try again.');
            }
            activityForm.reset();
            showStatus('Activity published.', 'success');
            loadActivities();
        } catch (err) {
            if (err.message === 'expired') {
                endSession('Your session has expired. Please sign in again.');
            } else {
                showStatus(err instanceof TypeError ? 'Could not reach the server. Please check your connection.' : err.message, 'error');
            }
        } finally {
            activitySubmit.disabled = false;
        }
    });

    // ---- Start ----

    if (session && session.access_token) {
        getAccessToken().then(showDashboard).catch(() => endSession());
    } else {
        showLogin();
    }
});
