// ==============================
// Dynamic Quote Generator
// ==============================

// Initial quotes data
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Inspiration" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Wisdom" },
  { text: "Do or do not. There is no try.", category: "Motivation" }
];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");
const addQuoteBtn = document.getElementById("addQuote");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");

// Initialize category dropdown
function populateCategories() {
  // Clear existing options
  categorySelect.innerHTML = "";

  // Get unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  // Create dropdown options dynamically
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Display random quote based on selected category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes found for this category.</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  // Create dynamic DOM elements
  quoteDisplay.innerHTML = ""; // Clear previous quote
  const quoteText = document.createElement("p");
  const quoteCategory = document.createElement("span");

  quoteText.textContent = `"${quote.text}"`;
  quoteCategory.textContent = `— ${quote.category}`;
  quoteCategory.classList.add("category");

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
}

// Add new quote dynamically
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category!");
    return;
  }

  // Add to quotes array
  quotes.push({ text, category });

  // Update category list if new category added
  populateCategories();

  // Clear input fields
  newQuoteText.value = "";
  newQuoteCategory.value = "";

  // Optional: automatically select new category
  categorySelect.value = category;

  // Show new quote
  showRandomQuote();
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

// Initialize app
populateCategories();
showRandomQuote();
