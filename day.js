// day.js - for day.html (read-only itinerary view)

let itemsData = [];

async function loadItems() {
  const res = await fetch('items.json');
  itemsData = await res.json();
}

function slugMap(ids) {
  return ids.map(id => itemsData.find(item => item.id === id)).filter(Boolean);
}

function updateDayPlan(day, plan) {
    const dayPlan = plan[day] || {};
  
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
  
    // Apartment → First Stop
    const showApartmentLink = day >= "14" && day <= "19" && apartment && items[0];
    if (showApartmentLink && apartment.address && items[0].address) {
      const start = `${apartment.name}, ${apartment.address}`;
      const end = `${items[0].name}, ${items[0].address}`;
      const url = `https://www.google.com/maps/dir/${encodeURIComponent(start)}/${encodeURIComponent(end)}`;
      links.push(`<a href="${url}" target="_blank">🏁 From Apartment → ${items[0].name}</a>`);
    }
  
    // Step-by-step links
    for (let i = 0; i < items.length - 1; i++) {
      const from = items[i];
      const to = items[i + 1];
      if (from.address && to.address) {
        const fromFull = `${from.name}, ${from.address}`;
        const toFull = `${to.name}, ${to.address}`;
        const url = `https://www.google.com/maps/dir/${encodeURIComponent(fromFull)}/${encodeURIComponent(toFull)}`;
        links.push(`<a href="${url}" target="_blank">➡️ ${from.name} → ${to.name}</a>`);
      }
    }
  
    // Full route (excluding apartment)
    const fullRouteItems = items.filter(i => i.name !== "Barcelona Touch Apartments - Rosich");
    const fullRouteStops = fullRouteItems.map(i => `${i.name}, ${i.address}`).filter(Boolean);
  
    if (fullRouteStops.length > 1) {
      const fullUrl = "https://www.google.com/maps/dir/" + fullRouteStops.map(s => encodeURIComponent(s)).join('/');
      links.push(`<a href="${fullUrl}" target="_blank"><strong>🗺️ View Full Route</strong></a>`);
    }
  
    mapContainer.innerHTML = links.length > 0
      ? `<div style="display: flex; flex-direction: column; gap: 0.5rem;">${links.join('')}</div>`
      : "<p>No valid routes to show.</p>";
  }
      
  async function loadItineraryFromServer(selectedDay) {
    try {
      const res = await fetch('/api/itinerary');
      const plan = await res.json();
      console.log("✅ Day plan loaded:", plan);
      updateDayPlan(selectedDay, plan);
    } catch (err) {
      console.error("❌ Failed to load itinerary:", err);
    }
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
    loadItineraryFromServer(select.value);
}

  prevBtn.addEventListener('click', () => changeDay(-1));
  nextBtn.addEventListener('click', () => changeDay(1));

  select.addEventListener('change', (e) => {
    loadItineraryFromServer(select.value);
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
    loadItineraryFromServer(defaultValue);
} else {
    select.selectedIndex = 0;
    loadItineraryFromServer(select.value);
}
});
