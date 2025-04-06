// calendar.js - for index.html (drag-and-drop itinerary planner)

let items = [];

fetch('items.json')
  .then(res => res.json())
  .then(data => {
    items = data;
    populateTabsAndPanel();
    autoInsertApartment();
  })
  .catch(err => console.error("Failed to load JSON:", err));

function autoInsertApartment() {
  const apartment = items.find(item => item.name === "Barcelona Touch Apartments - Rosich");
  if (!apartment) return;

  const apartmentId = apartment.id;

  document.querySelectorAll('.calendar-column').forEach(col => {
    const day = col.dataset.day;
    if (["14", "15", "16", "17", "18", "19"].includes(day)) {
      const morningSlot = col.querySelector('[data-slot="morning"]');
      const existing = morningSlot.querySelector(`[data-id="${apartmentId}"]`);
      if (!existing) {
        const clone = document.querySelector(`#item-panel .item[data-id="${apartmentId}"]`).cloneNode(true);
        clone.setAttribute('draggable', true);
        clone.addEventListener('dragstart', e => {
          window.draggedItem = clone;
          e.dataTransfer.effectAllowed = 'move';
        });
        morningSlot.prepend(clone);
      }
    }
  });
}

function populateTabsAndPanel() {
  const tabsContainer = document.getElementById('tabs');
  const panel = document.getElementById('item-panel');
  const uniqueAreas = [...new Set(items.map(item => item.area))];

  uniqueAreas.forEach((area, index) => {
    const tab = document.createElement('div');
    tab.className = 'tab' + (index === 0 ? ' active' : '');
    tab.textContent = area;
    tab.dataset.area = area;
    tabsContainer.appendChild(tab);

    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterItems(area, document.getElementById('type-filter').value);
    });
  });

  document.getElementById('type-filter').addEventListener('change', function () {
    const type = this.value;
    const area = document.querySelector('.tab.active').dataset.area;
    filterItems(area, type);
  });

  items.forEach(item => {
    const el = document.createElement('div');
    el.dataset.id = item.id;
    el.className = `item ${item.category}`;
    el.textContent = `${item.emoji || ''} ${item.name}`;
    el.dataset.area = item.area;
    el.dataset.type = item.type;
    el.dataset.summary = item.summary;
    el.dataset.map = item.website || item.photo || '';

    el.setAttribute('draggable', true);
    el.addEventListener('dragstart', e => {
      window.draggedItem = el;
      e.dataTransfer.effectAllowed = 'move';
    });

    el.addEventListener('click', () => {
      document.getElementById('modal-title').textContent = `${item.emoji || ''} ${item.name}`;
      document.getElementById('modal-summary').textContent = item.summary || '';
      document.getElementById('modal-category').textContent = `${item.category} (${item.type})`;
      document.getElementById('modal-hours').textContent = item.open_time || 'N/A';
      document.getElementById('modal-address').textContent = item.address || 'Not available';
      document.getElementById('modal-hint').textContent = item.day_hint || '';
      document.getElementById('modal-website').href = item.website || '#';
      document.getElementById('modal-website').textContent = item.website ? 'Visit website' : '';
      document.getElementById('modal-photo').src = item.photo || '';
      document.getElementById('modal-photo').style.display = item.photo ? 'block' : 'none';
      const mapQuery = encodeURIComponent(item.address || item.name + ' Barcelona');
      document.getElementById('modal-map').src = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
      document.getElementById('overlay').classList.add('active');
      document.getElementById('modal').classList.add('active');
    });

    panel.appendChild(el);
  });

  document.querySelectorAll('.calendar-column').forEach(col => {
    col.innerHTML = `
      <div class="time-slot" data-slot="morning"></div>
      <div class="time-slot" data-slot="lunch"></div>
      <div class="time-slot" data-slot="afternoon"></div>
      <div class="time-slot" data-slot="dinner"></div>
    `;
    col.querySelectorAll('.time-slot').forEach(slot => {
      slot.addEventListener('dragover', e => e.preventDefault());
      slot.addEventListener('drop', e => {
        e.preventDefault();
        if (window.draggedItem) {
          slot.appendChild(window.draggedItem);
          window.draggedItem = null;
        }
      });
    });
  });

  document.getElementById('item-panel').addEventListener('dragover', e => e.preventDefault());
  document.getElementById('item-panel').addEventListener('drop', e => {
    e.preventDefault();
    if (window.draggedItem) {
      document.getElementById('item-panel').appendChild(window.draggedItem);
      window.draggedItem = null;
    }
  });

  document.getElementById('bin').addEventListener('dragover', e => e.preventDefault());
  document.getElementById('bin').addEventListener('drop', e => {
    e.preventDefault();
    if (window.draggedItem) {
      window.draggedItem.remove();
      window.draggedItem = null;
    }
  });
}

function filterItems(area, type) {
  document.querySelectorAll('#item-panel .item').forEach(item => {
    const matchesArea = item.dataset.area === area;
    const matchesType = type === 'all' || item.dataset.type === type;
    item.style.display = matchesArea && matchesType ? 'inline-block' : 'none';
  });
}

function closeModal() {
  document.getElementById('overlay').classList.remove('active');
  document.getElementById('modal').classList.remove('active');
}

function savePlan() {
  const plan = {};
  document.querySelectorAll('.calendar-column').forEach(col => {
    const day = col.dataset.day;
    plan[day] = {};
    col.querySelectorAll('.time-slot').forEach(slot => {
      const slotName = slot.dataset.slot;
      plan[day][slotName] = [];
      slot.querySelectorAll('.item').forEach(item => {
        if (item.dataset.id) {
          plan[day][slotName].push(item.dataset.id);
        }
      });
    });
  });
  localStorage.setItem('barcelona-itinerary', JSON.stringify(plan));
  alert('Itinerary saved!');
}

function loadPlan() {
  const saved = localStorage.getItem('barcelona-itinerary');
  if (!saved) return;
  const plan = JSON.parse(saved);

  document.querySelectorAll('.calendar-column').forEach(col => {
    const day = col.dataset.day;
    const slots = col.querySelectorAll('.time-slot');
    if (plan[day]) {
      slots.forEach(slot => {
        const slotName = slot.dataset.slot;
        const ids = plan[day][slotName] || [];
        ids.forEach(id => {
          const match = document.querySelector(`#item-panel .item[data-id="${id}"]`);
          if (match) {
            slot.appendChild(match);
          }
        });
      });
    }
  });
}

function clearPlan() {
  localStorage.removeItem('barcelona-itinerary');
  location.reload();
}

window.addEventListener('load', () => {
  setTimeout(loadPlan, 500);
});
