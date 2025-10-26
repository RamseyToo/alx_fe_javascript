// ==============================
// Dynamic Quote Generator (with Web Storage & JSON)
// ==============================

let quotes = [];

// ==============================
// Helper Functions for Storage
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
    // Default quotes if none are stored
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Inspiration" },
      { text: "In the middle of every difficulty lies opportunity.", category: "Wisdom" },
      { text: "Do or do not. There is no try.", category: "Motivation" }
    ];
    saveQuotes();
  }
}

// Save last viewed quote in sessionStorage
function saveLastQuote(quote) {
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Load last viewed quote from sessionStorage
function loadLastQuote() {
  const lastQuote = sessionStorage.getItem("lastQuote");
  return lastQuote ? JSON.parse(lastQuote) : null;
}

// ==============================
// DOM Elements
// ==============================
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const exportBtn = document.getElementById("exportQuotes");
const body = document.body;

// Create category dropdown dynamically
const categoryContainer = document.createElement("div");
const categoryLabel = document.createElement("label");
categoryLabel.textContent = "Select Category: ";
categoryLabel.setAttribute("for", "categorySelect");

const categorySelect = document.createElement("select");
categorySelect.id = "categorySelect";

categoryContainer.appendChild(categoryLabel);
categoryContainer.appendChild(categorySelect);
body.insertBefore(categoryContainer, quoteDisplay);

// ==============================
// Dynamic DOM Manipulation
// ==============================

function populateCategories() {
  categorySelect.innerHTML = "";
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);

  quoteDisplay.innerHTML = ""; // Clear previous

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes found for this category.</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  const quoteText = document.createElement("p");
  const quoteCategory = document.createElement("span");

  quoteText.textContent = `"${quote.text}"`;
  quoteCategory.textContent = `— ${quote.category}`;
  quoteCategory.classList.add("category");

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);

  saveLastQuote(quote); // Save to sessionStorage
}

// Dynamically create form for adding new quotes
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

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category!");
    return;
  }

  quotes.push({ text, category });
  saveQuotes(); // Persist new quote

  populateCategories();
  categorySelect.value = category;

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  showRandomQuote();
}

// ==============================
// JSON Import / Export
// ==============================

// Export quotes to a JSON file
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

// Import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
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

// Restore last viewed quote if available
const lastQuote = loadLastQuote();
if (lastQuote) {
  quoteDisplay.innerHTML = `<p>"${lastQuote.text}"</p><span class="category">— ${lastQuote.category}</span>`;
} else {
  showRandomQuote();
}

// Event Listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
exportBtn.addEventListener("click", exportQuotesToJson);
