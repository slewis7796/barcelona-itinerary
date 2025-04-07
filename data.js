// calendar.js - for index.html (drag-and-drop itinerary planner)
require('dotenv').config();
const githubToken = process.env.GITHUB_TOKEN;

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
      const fullMapQuery = encodeURIComponent(`${item.name}, ${item.address}`);
      document.getElementById('modal-map').src = `https://www.google.com/maps?q=${fullMapQuery}&output=embed`;
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

async function savePlan() {
  const plan = {}; // This will be your itinerary data.

  // GitHub repository details
  const repoOwner = 'slewis7796';  // Your GitHub username
  const repoName = 'barcelona-itinerary';  // Your repository name
  const filePath = 'itinerary.json';  // Path to the JSON file you created in the repo

  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

  // Get the current file details (for versioning)
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `token ${githubToken}`,
    },
  });

  const data = await response.json();

  // If the file doesn't exist yet, this will return undefined
  if (!data.sha) {
    console.error('Error fetching file details: ', data);
    return;
  }

  const sha = data.sha; // Get the file's SHA for version control

  // Make the POST request to update the file
  const commitResponse = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Update itinerary plan',
      content: btoa(JSON.stringify(plan)), // Base64 encode the JSON data
      sha: sha // This ensures you're updating the file, not creating a new one
    })
  });

  const commitData = await commitResponse.json();
  console.log(commitData);
  alert('Itinerary saved successfully!');
}



async function loadPlan() {
  const repoOwner = 'slewis7796';  // Replace with your GitHub username
  const repoName = 'barcelona-itinerary';  // The name of your existing repository
  const filePath = 'itinerary.json';  // Path to the JSON file in your repo

  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('GitHub file not found or error fetching the file');
    }
    const data = await response.json();
    
    // Decode the Base64 content if it exists
    if (data.content) {
      const decodedContent = atob(data.content); // Decode the Base64 data
      const plan = JSON.parse(decodedContent);   // Parse the JSON data

      // Now you can use `plan` to populate your itinerary
      console.log(plan);
    } else {
      console.error("No content found in the GitHub file.");
    }
  } catch (error) {
    console.error('Error loading the plan:', error);
  }
}



function clearPlan() {
  localStorage.removeItem('barcelona-itinerary');
  location.reload();
}

window.addEventListener('load', () => {
  setTimeout(loadPlan, 500);
});
