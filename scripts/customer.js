/* ======================== CONFIG ======================== */
const API_BASE = "http://localhost:5555"; // change if needed

/* ====================== SESSION STATE ===================== */
const CUSTOMER_ID = Number(localStorage.getItem("customerId")) || null;
const TOKEN = localStorage.getItem("customerToken") || null;

// Guard: if not authenticated, bounce to home
if (!CUSTOMER_ID || !TOKEN) {
  window.location.href = "../index.html";
}

/* ======================== DOM HOOKS ======================== */
const logoutBtn = document.getElementById("logoutBtn");

// profile
const avatarBox = document.getElementById("avatarBox");
const custName = document.getElementById("custName");
const custPhone = document.getElementById("custPhone");
const custLocation = document.getElementById("custLocation");
const custEmail = document.getElementById("custEmail");

// wishlist + orders
const wishlistContainer = document.getElementById("wishlistContainer");
const wishlistEmpty = document.getElementById("wishlistEmpty");
const ordersContainer = document.getElementById("ordersContainer");
const ordersEmpty = document.getElementById("ordersEmpty");

// dialog
const editDialog = document.getElementById("editDialog");
const openUpdateBtn = document.getElementById("openUpdateBtn");
const closeEditBtn = document.getElementById("closeEditBtn");
const resetEditBtn = document.getElementById("resetEditBtn");
const saveEditBtn = document.getElementById("saveEditBtn");
const editStatus = document.getElementById("editStatus");
const editName = document.getElementById("editName");
const editPhone = document.getElementById("editPhone");
const editLocation = document.getElementById("editLocation");
const editEmail = document.getElementById("editEmail");
const editAvatarUrl = document.getElementById("editAvatarUrl");

/* ======================== HELPERS ======================== */
function authHeaders() {
  return TOKEN ? { Authorization: "Bearer " + TOKEN } : {};
}

async function requestJSON(path, options = {}) {
  const url = path.startsWith("http") ? path : API_BASE + path;
  const resp = await fetch(url, options);
  const ctype = resp.headers.get("content-type") || "";
  const raw = await resp.text();

  let data;
  if (ctype.includes("application/json")) {
    try { data = JSON.parse(raw); } catch {}
  }
  if (!resp.ok || data?.ok === false) {
    const message = data?.error || raw?.slice(0, 200) || `HTTP ${resp.status}`;
    throw new Error(message);
  }
  return (data && data.data != null) ? data.data : (data ?? raw);
}

async function apiGET(path) {
  return requestJSON(path, { headers: { ...authHeaders() } });
}

async function apiJSON(path, method, body) {
  return requestJSON(path, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body || {})
  });
}

function showErrorInline(el, msg) {
  if (!el) return;
  el.textContent = msg || "";
  el.style.color = msg ? "crimson" : "inherit";
}

function showSuccessInline(el, msg) {
  if (!el) return;
  el.textContent = msg || "";
  el.style.color = msg ? "green" : "inherit";
}

// Safe avatar setter
function setAvatar(avatarUrl, name) {
  avatarBox.innerHTML = "";
  if (avatarUrl) {
    const img = document.createElement("img");
    img.alt = (name || "User") + " Avatar";
    img.src = avatarUrl;
    img.onerror = function () {
      avatarBox.textContent = (name || "U").slice(0, 1);
    };
    avatarBox.appendChild(img);
  } else {
    avatarBox.textContent = (name || "U").slice(0, 1);
  }
}

/* ======================== PROFILE ======================== */
let CUSTOMER_PROFILE = null;

/**
 * Maps server user object to the UI shape
 * Server (from /api/customer/me): { customer_id, customer_name, customer_email, [phone], [location], [avatar_url] }
 */
function normalizeCustomer(server) {
  return {
    customer_id: server.customer_id,
    name: server.customer_name ?? server.name ?? "",
    email: server.customer_email ?? server.email ?? "",
    phone: server.phone ?? "",
    location: server.location ?? "",
    avatar_url: server.avatar_url ?? ""
  };
}

async function loadCustomerProfile() {
  try {
    const meServer = await apiGET("/api/customer/me");
    const me = normalizeCustomer(meServer);
    CUSTOMER_PROFILE = me;

    custName.textContent = me.name || "—";
    custPhone.textContent = me.phone || "—";
    custLocation.textContent = me.location || "—";
    custEmail.textContent = me.email || "—";
    setAvatar(me.avatar_url, me.name);

    if (me.email) localStorage.setItem("customerEmail", me.email);
    if (me.customer_id) localStorage.setItem("customerId", String(me.customer_id));
  } catch (e) {
    console.error("Failed to load customer profile:", e.message);
    // If unauthorized, kick back to login
    if (/unauthorized/i.test(e.message)) {
      localStorage.removeItem("customerId");
      localStorage.removeItem("customerToken");
      localStorage.removeItem("customerEmail");
      window.location.href = "../index.html";
    }
  }
}

function openEditDialog(prefillFrom) {
  showErrorInline(editStatus, "");
  editDialog.style.display = "flex";
  document.body.style.overflow = "hidden";

  const src = prefillFrom || CUSTOMER_PROFILE || {};
  editName.value = src.name || "";
  editPhone.value = src.phone || "";
  editLocation.value = src.location || "";
  editEmail.value = src.email || "";
  editAvatarUrl.value = src.avatar_url || "";
}

function closeDialog() {
  editDialog.style.display = "none";
  document.body.style.overflow = "";
}

async function saveCustomerUpdate() {
  try {
    showErrorInline(editStatus, "");
    editStatus.textContent = "Saving...";
    editStatus.style.color = "inherit";

    const payload = {
      // IMPORTANT: keys must match your server's customers.js -> expects name, email, phone, location, avatar_url
      name: (editName.value || "").trim(),
      email: (editEmail.value || "").trim(),
      phone: (editPhone.value || "").trim(),
      location: (editLocation.value || "").trim(),
      avatar_url: (editAvatarUrl.value || "").trim() || null
    };

    // Pinpoint missing fields
    const missing = [];
    if (!payload.name) missing.push("Name");
    if (!payload.phone) missing.push("Phone");
    if (!payload.location) missing.push("Location");
    if (!payload.email) missing.push("Email");

    if (missing.length) {
      throw new Error(`Please fill in: ${missing.join(", ")}`);
    }

    // debug: see exactly what we send
    console.log("[PATCH /api/customer/me] payload:", payload);

    // SINGULAR path (you said server mount is /api/customer)
    const updated = await apiJSON("/api/customer/me", "PATCH", payload);

    // Normalize fields from server back to UI
    const normalized = {
      name: updated.name ?? updated.customer_name ?? "",
      email: updated.email ?? updated.customer_email ?? "",
      phone: updated.phone ?? "",
      location: updated.location ?? "",
      avatar_url: updated.avatar_url ?? ""
    };

    // reflect in UI
    custName.textContent = normalized.name || "—";
    custPhone.textContent = normalized.phone || "—";
    custLocation.textContent = normalized.location || "—";
    custEmail.textContent = normalized.email || "—";
    setAvatar(normalized.avatar_url, normalized.name);

    showSuccessInline(editStatus, "Saved!");
    setTimeout(() => {
      editStatus.textContent = "";
      closeDialog();
    }, 600);
  } catch (e) {
    showErrorInline(editStatus, e.message || "Save failed");
    console.error("Save failed:", e);
  }
}

/* ======================== WISHLIST ======================== */
async function loadWishlist() {
  try {
    wishlistContainer.innerHTML = "";
    // Endpoint suggestion: GET /api/customer/me/wishlist
    const rows = await apiGET("/api/customer/me/wishlist");
    if (!rows.length) {
      wishlistEmpty.classList.remove("hidden");
      return;
    }
    wishlistEmpty.classList.add("hidden");

    rows.forEach((item) => {
      const div = document.createElement("div");
      div.className = "wishlist-item";

      const img = document.createElement("img");
      img.src = item.image_url || "../images/placeholder.jpg";
      img.alt = item.title || "Wishlist";

      const p = document.createElement("p");
      const price = (item.price_bdt != null) ? "৳" + item.price_bdt : "";
      p.textContent = price ? (item.title + " - " + price) : (item.title || "Item");

      div.appendChild(img);
      div.appendChild(p);
      wishlistContainer.appendChild(div);
    });
  } catch (e) {
    // If the endpoint doesn't exist yet, fail gracefully
    wishlistEmpty.textContent = "No wishlist yet.";
    wishlistEmpty.classList.remove("hidden");
  }
}

/* ======================== ORDERS ======================== */
function badgeClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "delivered") return "delivered";
  if (s === "shipped") return "shipped";
  return "processing";
}

async function loadOrders() {
  try {
    ordersContainer.innerHTML = "";
    // Endpoint suggestion: GET /api/customer/me/orders
    const rows = await apiGET("/api/customer/me/orders");
    if (!rows.length) {
      ordersEmpty.classList.remove("hidden");
      return;
    }
    ordersEmpty.classList.add("hidden");

    rows.forEach((o) => {
      const div = document.createElement("div");
      div.className = "order-item";

      const img = document.createElement("img");
      img.src = o.image_url || "../images/placeholder.jpg";
      img.alt = o.title ? o.title : ("Order #" + o.order_id);

      const p = document.createElement("p");
      p.textContent = o.title ? o.title : ("Order #" + o.order_id);

      const s = document.createElement("span");
      s.className = badgeClass(o.status);
      s.textContent = o.status || "Processing";

      div.appendChild(img);
      div.appendChild(p);
      div.appendChild(s);
      ordersContainer.appendChild(div);
    });
  } catch (e) {
    ordersEmpty.textContent = "No orders found.";
    ordersEmpty.classList.remove("hidden");
  }
}

/* ======================== EVENTS ======================== */
if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("customerId");
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerEmail");
  });
}
if (openUpdateBtn) openUpdateBtn.addEventListener("click", function () { openEditDialog(); });
if (closeEditBtn) closeEditBtn.addEventListener("click", function () { closeDialog(); });
if (resetEditBtn) resetEditBtn.addEventListener("click", function () { openEditDialog(CUSTOMER_PROFILE); });
if (saveEditBtn) saveEditBtn.addEventListener("click", function () { saveCustomerUpdate(); });

/* ======================== INIT ======================== */
(async function init() {
  await loadCustomerProfile();
  await loadWishlist();
  await loadOrders();
})();
