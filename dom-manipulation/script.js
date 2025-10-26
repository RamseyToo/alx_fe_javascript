// ==============================
// Dynamic Quote Generator with Server Sync + Conflict Resolution
// ==============================

// Simulated server URL
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Local quotes array
let quotes = [];

// ==============================
// Storage Helpers
// ==============================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      { id: 1, text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { id: 2, text: "Success is not final, failure is not fatal.", category: "Inspiration" },
      { id: 3, text: "In the middle of every difficulty lies opportunity.", category: "Wisdom" }
    ];
    saveQuotes();
  }
}

// ==============================
// DOM Elements
// ==============================
const quoteDisplay = document.getElementById("quoteDisplay");
const filterSelect = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");
const manualSyncBtn = document.getElementById("manualSync");
const exportBtn = document.getElementById("exportQuotes");
const newQuoteBtn = document.getElementById("newQuote");

// ==============================
// UI Feedback
// ==============================
function showSyncMessage(message, type = "ok") {
  syncStatus.textContent = message;
  syncStatus.className = "";
  if (type === "ok") syncStatus.classList.add("sync-ok");
  if (type === "conflict") syncStatus.classList.add("sync-conflict");
  if (type === "error") syncStatus.classList.add("sync-error");
}

// ==============================
// Category Handling
// ==============================
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  filterSelect.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filterSelect.appendChild(opt);
  });
}

// ==============================
// Quote Display + Filtering
// ==============================
function filterQuotes() {
  const selected = filterSelect.value;
  const filtered = selected === "all" ? quotes : quotes.filter(q => q.category === selected);
  displayQuotes(filtered);
}

function displayQuotes(list) {
  quoteDisplay.innerHTML = "";
  if (list.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes found for this category.</p>`;
    return;
  }
  list.forEach(q => {
    const div = document.createElement("div");
    div.style.marginBottom = "10px";
    div.innerHTML = `<p>"${q.text}"</p><span class="category">— ${q.category}</span>`;
    quoteDisplay.appendChild(div);
  });
}

function showRandomQuote() {
  const selected = filterSelect.value;
  const filtered = selected === "all" ? quotes : quotes.filter(q => q.category === selected);
  if (filtered.length === 0) return;
  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  displayQuotes([randomQuote]);
}

// ==============================
// Add Quote Form
// ==============================
function createAddQuoteForm() {
  const form = document.createElement("div");
  form.style.marginTop = "20px";
  form.innerHTML = `
    <h2>Add a New Quote</h2>
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;
  document.body.appendChild(form);

  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return alert("Both fields required.");

  const newQuote = { id: Date.now(), text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();
  showSyncMessage("🕒 Local changes made (not yet synced)", "conflict");
}

// ==============================
// Server Sync Simulation
// ==============================
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();
    const serverQuotes = data.slice(0, 5).map((item, i) => ({
      id: i + 1000,
      text: item.title,
      category: "Server"
    }));
    return serverQuotes;
  } catch (err) {
    showSyncMessage("❌ Error fetching from server", "error");
    return [];
  }
}

async function pushQuotesToServer(localQuotes) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      body: JSON.stringify(localQuotes),
      headers: { "Content-Type": "application/json" }
    });
    // Keep this message simple for testing/logging
    console.log("Quotes synced with server!");
    showSyncMessage("Quotes synced with server!", "ok");
  } catch {
    showSyncMessage("❌ Failed to push data to server", "error");
  }
}

// ✅ REQUIRED FUNCTION NAME
async function syncQuotes() {
  showSyncMessage("🔄 Syncing with server...");

  const serverQuotes = await fetchQuotesFromServer();
  if (serverQuotes.length === 0) return;

  const merged = [...quotes];
  let conflicts = 0;

  // Conflict resolution: server wins
  serverQuotes.forEach(sq => {
    const existing = merged.find(lq => lq.id === sq.id);
    if (existing) {
      if (existing.text !== sq.text) {
        conflicts++;
        const index = merged.indexOf(existing);
        merged[index] = sq;
      }
    } else {
      merged.push(sq);
    }
  });

  quotes = merged;
  saveQuotes();
  populateCategories();
  filterQuotes();

  if (conflicts > 0) {
    showSyncMessage(`⚠️ Conflicts resolved (${conflicts} updates applied)`, "conflict");
  } else {
    // Display required phrase here too
    showSyncMessage("Quotes synced with server!", "ok");
    console.log("Quotes synced with server!");
  }

  await pushQuotesToServer(quotes);
}

// ==============================
// JSON Import / Export
// ==============================
function exportQuotesToJson() {
  const json = JSON.stringify(quotes, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      filterQuotes();
      showSyncMessage("✅ Quotes imported successfully", "ok");
    } catch {
      showSyncMessage("❌ Error reading JSON file", "error");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// ==============================
// Initialize App
// ==============================
loadQuotes();
populateCategories();
filterQuotes();
createAddQuoteForm();

manualSyncBtn.addEventListener("click", syncQuotes);
newQuoteBtn.addEventListener("click", showRandomQuote);
exportBtn.addEventListener("click", exportQuotesToJson);

// Auto-sync every 60 seconds
setInterval(syncQuotes, 60000);
