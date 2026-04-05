/**
 * Headers for Laravel web routes that must return JSON (session + CSRF).
 */
export function jsonRequestHeaders() {
    const tokenMeta = document.head.querySelector('meta[name="csrf-token"]');
    const csrfToken = tokenMeta ? tokenMeta.content : null;
    const headers = {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
    };
    if (csrfToken) {
        headers["X-CSRF-TOKEN"] = csrfToken;
    }
    return headers;
}

export function messageFromAxiosError(err) {
    if (err.response?.status === 419) {
        return "Session expired. Refresh the page and try again.";
    }
    const d = err.response?.data;
    if (!d) {
        return err.message || "Network error";
    }
    if (typeof d === "string") {
        return d.replace(/<[^>]+>/g, "").slice(0, 200) || "Server error";
    }
    if (d.message) {
        return Array.isArray(d.message) ? d.message[0] : d.message;
    }
    if (d.errors) {
        const first = Object.values(d.errors)[0];
        return Array.isArray(first) ? first[0] : first;
    }
    return "Server error";
}
