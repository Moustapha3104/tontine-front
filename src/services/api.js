const API_URL = '/api';

// In dev (Vite on :5173) the backend typically runs on :5000.
// In prod, the frontend is served by the backend, so relative URLs work.
const DEFAULT_DEV_API_ORIGIN = 'http://localhost:5000';
export const API_ORIGIN =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_ORIGIN) ||
    (typeof window !== 'undefined' && window.location && window.location.port === '5173'
        ? DEFAULT_DEV_API_ORIGIN
        : '');

export const assetUrl = (p) => {
    if (!p) return '';
    if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) return p;
    return `${API_ORIGIN}${p}`;
};

const getHeaders = () => {
    const token = localStorage.getItem('token');
    const tontineId = localStorage.getItem('selectedTontineId');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(tontineId ? { 'x-tontine-id': tontineId } : {})
    };
};

async function readJsonSafe(response) {
    // Some endpoints can legitimately return 204 No Content.
    if (response.status === 204) return null;

    const text = await response.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch (e) {
        // Provide helpful context; caller can catch and display.
        const snippet = text.length > 200 ? `${text.slice(0, 200)}…` : text;
        throw new Error(`Réponse non-JSON ou JSON invalide (status ${response.status}): ${snippet}`);
    }
}

export const api = {
    login: async (email, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur de connexion');
        return data;
    },

    register: async (name, email, password) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur d\'inscription');
        return data;
    },

    getMe: async () => {
        const response = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    getMembres: async () => {
        const response = await fetch(`${API_URL}/membres`, { headers: getHeaders() });
        return readJsonSafe(response);
    },

    getTransactions: async () => {
        const response = await fetch(`${API_URL}/transactions`, { headers: getHeaders() });
        return readJsonSafe(response);
    },

    applyPenalty: async (membreId) => {
        const response = await fetch(`${API_URL}/membres/${membreId}/appliquer-penalite`, {
            method: 'POST',
            headers: getHeaders()
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    getLoans: async () => {
        const response = await fetch(`${API_URL}/prets`, { headers: getHeaders() });
        return readJsonSafe(response);
    },

    getAuditLogs: async () => {
        const response = await fetch(`${API_URL}/audit`, { headers: getHeaders() });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data.data;
    },

    exportReport: async (format) => {
        const response = await fetch(`${API_URL}/exports/rapport-mensuel.${format}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Erreur lors de l'export");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-tontine.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    },

    getMonthlyEvolution: async () => {
        const response = await fetch(`${API_URL}/stats/evolution-mensuelle`, { headers: getHeaders() });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data.data;
    },

    approveLoan: async (id) => {
        const response = await fetch(`${API_URL}/prets/${id}/approuver`, {
            method: 'POST',
            headers: getHeaders()
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    getLoanSchedule: async (id) => {
        const response = await fetch(`${API_URL}/prets/${id}/echeancier`, { headers: getHeaders() });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data.data;
    },

    payInstallment: async (echeanceId) => {
        const response = await fetch(`${API_URL}/prets/echeance/${echeanceId}/rembourser`, {
            method: 'POST',
            headers: getHeaders()
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    getTontine: async () => {
        const response = await fetch(`${API_URL}/tontine`, { headers: getHeaders() });
        return readJsonSafe(response);
    },

    getTontines: async () => {
        const response = await fetch(`${API_URL}/tontines`, { headers: getHeaders() });
        return readJsonSafe(response);
    },

    getTours: async () => {
        const response = await fetch(`${API_URL}/tours`, { headers: getHeaders() });
        return readJsonSafe(response);
    },

    getMemberDashboard: async () => {
        const response = await fetch(`${API_URL}/membres/me/dashboard`, { headers: getHeaders() });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    getMemberStatus: async () => {
        const response = await fetch(`${API_URL}/membres/me/status`, { headers: getHeaders() });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    updateTontine: async (data) => {
        const response = await fetch(`${API_URL}/tontine`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        const resData = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(resData.message || 'Erreur');
        return resData;
    },

    createTontine: async (data) => {
        const response = await fetch(`${API_URL}/tontine`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        const resData = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(resData.message || 'Erreur');
        return resData;
    },

    deleteTontine: async (id) => {
        const response = await fetch(`${API_URL}/tontine/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        const resData = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(resData.message || 'Erreur de suppression');
        return resData;
    },

    regenerateTontineCode: async (id) => {
        const response = await fetch(`${API_URL}/tontine/${id}/regenerate-code`, {
            method: 'POST',
            headers: getHeaders()
        });
        const resData = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(resData.message || 'Erreur');
        return resData;
    },

    createMember: async ({ nom, prenom, email, telephone, password, photo }) => {
        const response = await fetch(`${API_URL}/admin/create-member`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ nom, prenom, email, telephone, password, photo })
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur de création');
        return data;
    },

    deleteMember: async (id) => {
        const response = await fetch(`${API_URL}/admin/membres/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur de suppression');
        return data;
    },

    updateMember: async (id, { nom, prenom, email, telephone, photo }) => {
        const response = await fetch(`${API_URL}/admin/membres/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ nom, prenom, email, telephone, photo })
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur de modification');
        return data;
    },

    completeTour: async (id) => {
        const response = await fetch(`${API_URL}/tours/${id}/complete`, {
            method: 'PUT',
            headers: getHeaders()
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    sendReminders: async () => {
        const response = await fetch(`${API_URL}/notifications/send-reminders`, {
            method: 'POST',
            headers: getHeaders()
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    cotiser: async (amount, method, name, membre_id) => {
        const response = await fetch(`${API_URL}/transactions/cotiser`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ amount, method, name, membre_id })
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    rejectLoan: async (id) => {
        const response = await fetch(`${API_URL}/prets/${id}/rejeter`, {
            method: 'POST',
            headers: getHeaders()
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    requestLoan: async (montant, motif, membre_id) => {
        const response = await fetch(`${API_URL}/prets`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ montant, motif, membre_id })
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    getTirage: async () => {
        const response = await fetch(`${API_URL}/tirage`, { headers: getHeaders() });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data.data;
    },

    effectuerTirage: async (montant, membre_id) => {
        const body = { montant };
        if (membre_id) body.membre_id = membre_id;
        const response = await fetch(`${API_URL}/tirage/effectuer`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    envoyerTirage: async (id) => {
        const response = await fetch(`${API_URL}/tirage/${id}/envoyer`, {
            method: 'POST',
            headers: getHeaders()
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    sendMessage: async (id, sujet, contenu) => {
        const response = await fetch(`${API_URL}/membres/${id}/message`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ sujet, contenu })
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    cotiserBatch: async (method, membresIds) => {
        const response = await fetch(`${API_URL}/transactions/cotiser-batch`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ method, membresIds })
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    doTirage: async (membre_id, montant, mois) => {
        const response = await fetch(`${API_URL}/tirages`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ membre_id, montant, mois })
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur lors du tirage');
        return data;
    },

    getNotifications: async () => {
        const response = await fetch(`${API_URL}/notifications`, { headers: getHeaders() });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data.data || [];
    },

    getFinanceDashboard: async () => {
        const response = await fetch(`${API_URL}/stats/finance-dashboard`, { headers: getHeaders() });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data.data;
    },

    // ─── PROFILE ───────────────────────────────────────────────────────────
    updateProfile: async ({ name, email, photo }) => {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ name, email, photo })
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    updatePassword: async ({ oldPass, newPass }) => {
        const response = await fetch(`${API_URL}/auth/update-password`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ oldPass, newPass })
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    // ─── NOTIFICATIONS (IN-APP) ────────────────────────────────────────────
    createNotification: async ({ user_id, texte, icon, type, global }) => {
        const response = await fetch(`${API_URL}/notifications`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ user_id, texte, icon, type, global })
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    getNotificationCount: async () => {
        const response = await fetch(`${API_URL}/notifications/count`, { headers: getHeaders() });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data.count || 0;
    },

    markNotificationRead: async (id) => {
        const response = await fetch(`${API_URL}/notifications/${id}/read`, {
            method: 'PUT',
            headers: getHeaders()
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    markAllNotificationsRead: async () => {
        const response = await fetch(`${API_URL}/notifications/read-all`, {
            method: 'PUT',
            headers: getHeaders()
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    sendInAppReminders: async ({ message, members }) => {
        const response = await fetch(`${API_URL}/notifications/send-inapp-reminders`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ message, members })
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    sendManualNotification: async ({ message, members, type }) => {
        const response = await fetch(`${API_URL}/notifications/send-manual`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ message, members, type })
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },

    // ─── TONTINE CODE / JOIN ────────────────────────────────────────────────
    getTontineCode: async () => {
        const response = await fetch(`${API_URL}/tontine/code`, { headers: getHeaders() });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data.code;
    },

    rejoindreTontine: async (code) => {
        const response = await fetch(`${API_URL}/tontine/rejoindre`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ code })
        });
        const data = (await readJsonSafe(response)) || {};
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data;
    },
};
