// ==============================
// Dynamic Quote Generator with Filtering + Web Storage + JSON
// ==============================

let quotes = [];

// ==============================
// Web Storage Utilities
// ==============================

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Load quotes from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Inspiration" },
      { text: "In the middle of every difficulty lies opportunity.", category: "Wisdom" },
      { text: "Do or do not. There is no try.", category: "Motivation" }
    ];
    saveQuotes();
  }
}

// Save last selected category filter
function saveFilter(category) {
  localStorage.setItem("selectedCategory", category);
}

// Load last selected category filter
function loadFilter() {
  return localStorage.getItem("selectedCategory") || "all";
}

// ==============================
// DOM Elements
// ==============================
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const exportBtn = document.getElementById("exportQuotes");
const filterSelect = document.getElementById("categoryFilter");
const body = document.body;

// ==============================
// Dynamic DOM Manipulation
// ==============================

// Populate filter dropdown dynamically
function populateCategories() {
  // Get all unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  // Clear existing options except "All"
  filterSelect.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filterSelect.appendChild(option);
  });

  // Restore saved filter if available
  const savedFilter = loadFilter();
  filterSelect.value = savedFilter;
}

// Filter quotes by selected category
function filterQuotes() {
  const selectedCategory = filterSelect.value;
  saveFilter(selectedCategory); // Persist filter

  // Filter quotes
  let filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  // Display filtered quotes
  displayQuotes(filteredQuotes);
}

// Display quotes (all or filtered)
function displayQuotes(list) {
  quoteDisplay.innerHTML = "";
  if (list.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes found for this category.</p>`;
    return;
  }

  // Display all quotes in the selected category
  list.forEach(q => {
    const quoteBlock = document.createElement("div");
    quoteBlock.style.marginBottom = "10px";

    const textEl = document.createElement("p");
    textEl.textContent = `"${q.text}"`;

    const categoryEl = document.createElement("span");
    categoryEl.classList.add("category");
    categoryEl.textContent = `— ${q.category}`;

    quoteBlock.appendChild(textEl);
    quoteBlock.appendChild(categoryEl);
    quoteDisplay.appendChild(quoteBlock);
  });
}

// Show one random quote from selected filter
function showRandomQuote() {
  const selectedCategory = filterSelect.value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes found for this category.</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  displayQuotes([filteredQuotes[randomIndex]]);
}

// Create Add Quote Form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.id = "quoteFormContainer";
  formContainer.style.marginTop = "20px";

  const heading = document.createElement("h2");
  heading.textContent = "Add a New Quote";

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(heading);
  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  body.appendChild(formContainer);
}

// Add new quote and update filters
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category!");
    return;
  }

  quotes.push({ text, category });
  saveQuotes(); // persist
  populateCategories(); // update dropdowns

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  filterQuotes(); // refresh display
}

// ==============================
// JSON Import / Export
// ==============================

function exportQuotesToJson() {
  const jsonData = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (error) {
      alert("Error parsing JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ==============================
// Initialize App
// ==============================
loadQuotes();
populateCategories();
createAddQuoteForm();
filterQuotes(); // display based on saved filter

// Event Listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
exportBtn.addEventListener("click", exportQuotesToJson);
