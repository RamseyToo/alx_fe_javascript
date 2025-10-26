// ==============================
// Dynamic Quote Generator with Server Sync + Conflict Resolution
// ==============================

// Simulated server URL (replace with a real API if needed)
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
    quoteDisplay.innerHTML = `<p
