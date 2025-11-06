// js/map.js — PORT-aware & matches /api/map/nearby
const PORT = (location.port && /^\d+$/.test(location.port)) ? location.port : "5555";
const API_BASE = `http://localhost:${PORT}/api/map`;

let map, userMarker, vendorMarkers = [];
const results = document.getElementById('results');

function initMap() {
  map = L.map('map').setView([23.780887, 90.279239], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
}

function clearVendors() {
  vendorMarkers.forEach(m => map.removeLayer(m));
  vendorMarkers = [];
  results.innerHTML = '';
}

function addVendor(v) {
  const m = L.marker([v.latitude, v.longitude]).addTo(map).bindPopup(`<b>${v.name}</b><br>${v.location || ''}<br>${(v.distance_km||0).toFixed(2)} km away`);
  vendorMarkers.push(m);

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="row">
      <div>
        <strong>${v.name}</strong><br>
        <span class="muted">${(v.distance_km||0).toFixed(2)} km • ${v.vendor_type || 'vendor'}</span>
      </div>
      ${v.logo_url ? `<img src="${v.logo_url}" style="width:40px;height:40px;border-radius:8px;object-fit:cover">` : ''}
    </div>
    <div class="muted">${v.location || ''}</div>
    <a class="btn" href="vendorDashboard.html" title="Open vendor">View</a>
  `;
  results.appendChild(card);
}

async function findVendors(lat, lon, radiusKm) {
  clearVendors();
  const url = `${API_BASE}/nearby?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&radius_km=${encodeURIComponent(radiusKm)}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || json.ok === false) throw new Error(json.error || 'nearby failed');

  if (!json.data.length) {
    results.innerHTML = `<div class="card"><strong>No vendors found in ${radiusKm} km.</strong></div>`;
    return;
  }
  json.data.forEach(addVendor);
}

function setUserPoint(lat, lon) {
  if (userMarker) map.removeLayer(userMarker);
  userMarker = L.marker([lat, lon], { title: 'You' }).addTo(map);
  map.setView([lat, lon], 14);
}

// Controls (present in shop-nearby.html)
window.addEventListener('DOMContentLoaded', () => {
  initMap();

  const latEl = document.getElementById('lat');
  const lonEl = document.getElementById('lon');
  const radiusEl = document.getElementById('radius');

  document.getElementById('locBtn').addEventListener('click', () => {
    if (!navigator.geolocation) return alert('Geolocation not available');
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      setUserPoint(lat, lon);
      latEl.value = lat.toFixed(6);
      lonEl.value = lon.toFixed(6);
    }, (err) => alert(err.message), { enableHighAccuracy: true, timeout: 10000 });
  });

  document.getElementById('findBtn').addEventListener('click', async () => {
    const lat = Number(latEl.value), lon = Number(lonEl.value);
    const r   = Number(radiusEl.value || 5);
    if (!isFinite(lat) || !isFinite(lon)) return alert('Provide latitude and longitude');
    try {
      setUserPoint(lat, lon);
      await findVendors(lat, lon, r);
    } catch (e) {
      alert(e.message);
    }
  });
});
