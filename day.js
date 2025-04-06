// day.js - for day.html (read-only itinerary view)

let itemsData = [];

async function loadItems() {
  const res = await fetch('items.json');
  itemsData = await res.json();
}

function slugMap(ids) {
  return ids.map(id => itemsData.find(item => item.id === id)).filter(Boolean);
}

function updateDayPlan(day) {
  const saved = JSON.parse(localStorage.getItem('barcelona-itinerary') || '{}');
  const dayPlan = saved[day] || {};

  ['morning', 'lunch', 'afternoon', 'dinner'].forEach(slot => {
    const ul = document.getElementById(`${slot}-list`);
    ul.innerHTML = '';

    const items = slugMap(dayPlan[slot] || []);
    items.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `${item.emoji || ''} <strong>${item.name}</strong><br><small>${item.summary || ''}</small>`;
      ul.appendChild(li);
    });
  });

  renderMapForDay(day, dayPlan);
}

function renderMapForDay(day, dayPlan) {
    const slotOrder = ['morning', 'lunch', 'afternoon', 'dinner'];
    const idsInOrder = slotOrder.flatMap(slot => dayPlan[slot] || []);
    const items = slugMap(idsInOrder);
    const mapContainer = document.getElementById('map');
  
    if (items.length === 0) {
      mapContainer.innerHTML = "<p>No map locations for this day.</p>";
      return;
    }
  
    const apartment = itemsData.find(i => i.name === "Barcelona Touch Apartments - Rosich");
    const links = [];
  
    // Add Apartment → First Stop (if applicable)
    const showApartmentLink = day >= "14" && day <= "19" && apartment && items[0] && apartment.address !== items[0].address;
    if (showApartmentLink) {
      const url = `https://www.google.com/maps/dir/${encodeURIComponent(apartment.address)}/${encodeURIComponent(items[0].address)}`;
      links.push(`<a href="${url}" target="_blank">🏁 From Apartment → ${items[0].name}</a>`);
    }
  
    // A → B, B → C, etc.
    for (let i = 0; i < items.length - 1; i++) {
      const from = items[i];
      const to = items[i + 1];
      if (from.address && to.address) {
        const url = `https://www.google.com/maps/dir/${encodeURIComponent(from.address)}/${encodeURIComponent(to.address)}`;
        links.push(`<a href="${url}" target="_blank">➡️ ${from.name} → ${to.name}</a>`);
      }
    }
  
    // Full route (exclude apartment)
    const fullRouteItems = items.filter(i => i.name !== "Barcelona Touch Apartments - Rosich");
    const fullRouteAddresses = fullRouteItems.map(i => i.address).filter(Boolean);
  
    if (fullRouteAddresses.length > 1) {
      const fullUrl = "https://www.google.com/maps/dir/" + fullRouteAddresses.map(addr => encodeURIComponent(addr)).join('/');
      links.push(`<a href="${fullUrl}" target="_blank"><strong>🗺️ View Full Route</strong></a>`);
    }
  
    mapContainer.innerHTML = links.length > 0
      ? `<div style="display: flex; flex-direction: column; gap: 0.5rem;">${links.join('')}</div>`
      : "<p>No valid routes to show.</p>";
  }
    
  

window.addEventListener('DOMContentLoaded', async () => {
  await loadItems();

  const select = document.getElementById('day-select');
  const prevBtn = document.getElementById('prev-day');
  const nextBtn = document.getElementById('next-day');

  function changeDay(offset) {
    const options = Array.from(select.options);
    let newIndex = select.selectedIndex + offset;
    newIndex = Math.max(0, Math.min(options.length - 1, newIndex));
    select.selectedIndex = newIndex;
    select.value = options[newIndex].value;
    updateDayPlan(select.value);
  }

  prevBtn.addEventListener('click', () => changeDay(-1));
  nextBtn.addEventListener('click', () => changeDay(1));

  select.addEventListener('change', (e) => {
    updateDayPlan(e.target.value);
  });

  // Auto-select correct day on load
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();
  const start = new Date(year, 3, 13);
  const end = new Date(year, 3, 19);
  let defaultValue = "13";
  if (today >= start && today <= end) {
    defaultValue = String(date);
  }
  const match = Array.from(select.options).find(opt => opt.value === defaultValue);
  if (match) {
    select.value = defaultValue;
    updateDayPlan(defaultValue);
  } else {
    select.selectedIndex = 0;
    updateDayPlan(select.value);
  }
});
