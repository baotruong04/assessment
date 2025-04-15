/*
* Data Catalog Website Project - SEA Stage 2
* 
* Author: baotruong04
* Date created: Monday, 04/14/2025
*
* Project description: This project creates a website to showcase a catalog of books with detailed information. 
* The data is loaded from a JSON file containing book information. I built two classes for better organization:
* 
* 1. Book class: Represents individual book items with properties including title, author, year, language, 
*    country, pages, and image links. The class includes helper methods for searching, filtering, and image handling.
*
* 2. BookCatalog class: Manages the collection of books and all UI interactions. The class handles:
*
* ......[1] Loading and displaying books from the JSON file with proper error handling
* ......[2] Filtering books by year range, language, and search terms
* ......[3] Sorting books by different criteria (title, author, year, pages)
* 
*/

// Book class to represent individual book objects
class Book {
  constructor(bookData) {
    this.title = bookData.title;
    this.author = bookData.author;
    this.year = bookData.year;
    this.language = bookData.language;
    this.country = bookData.country ;
    this.pages = bookData.pages;
    this.imageLink = bookData.imageLink ;

  }
  
  // Get the full image URL
  getImageURL() {
    return this.imageLink ? `data/${this.imageLink}` : "";
  }
  
  // Check if the book matches a search term
  matchesSearchTerm(searchTerm) {
    if (!searchTerm || searchTerm.trim() === "") return true;
    
    const term = searchTerm.toLowerCase().trim();
    
    // Search in title, author, and language fields
    return (
      (this.title && this.title.toLowerCase().includes(term)) ||
      (this.author && this.author.toLowerCase().includes(term)) ||
      (this.language && this.language.toLowerCase().includes(term))
    );
  }
  
  // Check if book is within a year range
  isInYearRange(minYear, maxYear) {
    const bookYear = parseInt(this.year);
    return bookYear >= minYear && bookYear <= maxYear;
  }
  
  // Check if book is in a specific language
  hasLanguage(language) {
    if (!this.language) return false;
    return this.language.split(', ').includes(language);
  }
}

// BookCatalog class to manage the collection of books
class BookCatalog {
  constructor() {
    this.books = [];              
    this.displayedBooks = [];     
    this.currentSortCriterion = "title";  
    
    // Bind methods to this instance
    this.handleSortChange = this.handleSortChange.bind(this);
    this.handleYearFilter = this.handleYearFilter.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleResetFilters = this.handleResetFilters.bind(this);
  }
  
  // Fetch books from the JSON file
  async fetchBooks() {
    try {
      const response = await fetch('data/books.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const bookData = await response.json();
      
      // Create Book instances for each book in the data
      this.books = bookData.map(data => new Book(data));
      this.displayedBooks = this.books.slice();
      
      console.log('Books loaded successfully:', this.books.length, 'books found');
    } catch (error) {
      console.error('Error loading book data:', error);
      const cardContainer = document.getElementById("card-container");
      cardContainer.innerHTML = `<div class="no-results">Error loading book data. Please try again later.</div>`;
      throw error;
    }
  }
  
  // Display books as cards on the page
  showCards() {
    const cardContainer = document.getElementById("card-container");
    cardContainer.innerHTML = "";

    if (this.displayedBooks.length === 0) {
      cardContainer.innerHTML = `<div class="no-results">No books match your search criteria.</div>`;
      this.updateBookCount();
      return;
    }

    for (const book of this.displayedBooks) {
      const bookCard = document.createElement("div");
      bookCard.className = "card";
      bookCard.style.display = "block";
      
      bookCard.innerHTML = `
        <div class="card-content">
          <h2 title="${book.title}">${book.title}</h2>
          <img src="${book.getImageURL() || 'https://via.placeholder.com/300x450?text=No+Cover+Available'}" 
               alt="${book.title} Cover" 
               onerror="this.src='https://via.placeholder.com/300x450?text=No+Cover+Available'">
          <ul>
            <li title="${book.author}"><strong>Author:</strong> ${book.author}</li>
            <li title="${book.year}"><strong>Year:</strong> ${book.year}</li>
            <li title="${book.language}"><strong>Language:</strong> ${book.language}</li>
            <li title="${book.country}"><strong>Country:</strong> ${book.country}</li>
            <li title="${book.pages}"><strong>Pages:</strong> ${book.pages}</li>
          </ul>
        </div>
      `;
      
      cardContainer.appendChild(bookCard);
    }
    
    this.updateBookCount();
  }

  // Search books by multiple fields
  searchBooks() {
    const searchInput = document.getElementById("search-input");
    if (!searchInput) {
      console.error("Search input element not found");
      return;
    }
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    console.log("Searching for:", searchTerm);
    
    if (searchTerm === "") {
      this.displayedBooks = this.books.slice();
      console.log("Empty search, showing all books:", this.books.length);
    } else {
      this.displayedBooks = this.books.filter(book => {
        const matches = book.matchesSearchTerm(searchTerm);
        console.log(`Book "${book.title}" ${matches ? "matches" : "doesn't match"} search term "${searchTerm}"`);
        return matches;
      });
      console.log("Found matching books:", this.displayedBooks.length);
    }
    
    // Re-display the sorted books immediately after search
    this.showCards();
  }

// Sort books by different criteria
sortBooks(criterion, logSort = true) {
  if (!criterion || this.displayedBooks.length === 0) return;
  
  // Store the current sort criterion
  this.currentSortCriterion = criterion;
  
  if (logSort) {
    console.log("Sorting by:", criterion);
  }
  
  switch(criterion) {
    case "title":
      this.displayedBooks.sort((a, b) => (a.title).localeCompare(b.title));
      break;
      
    case "author":
      this.displayedBooks.sort((a, b) => (a.author).localeCompare(b.author));
      break;

    case "year":
      this.displayedBooks.sort((a, b) => {
        const yearA = parseInt(a.year);
        const yearB = parseInt(b.year);
        return yearA - yearB;
      });
      break;

    default:
      // Default to title sort if criterion is not recognized
      this.displayedBooks.sort((a, b) => (a.title).localeCompare(b.title));
  }
  
  // Re-display the sorted books
  this.showCards();
}

  // Filter books by year range
  filterByYearRange() {
    const minYear = parseInt(document.getElementById("min-year").value);
    const maxYear = parseInt(document.getElementById("max-year").value);
    
    this.displayedBooks = this.books.filter(book => book.isInYearRange(minYear, maxYear));
    
    // Maintain the current sort order after filtering
    this.sortBooks(this.currentSortCriterion, false);
  }
  
  // Filter books by language
  filterByLanguage(language) {
    if (language === "All") {
      this.displayedBooks = this.books.slice();
    } else {
      this.displayedBooks = this.books.filter(book => book.hasLanguage(language));
    }
    
    // Maintain the current sort order after filtering
    this.sortBooks(this.currentSortCriterion, false);
  }
  
  // Reset all filters
  resetFilters() {
    this.displayedBooks = this.books.slice();
    
    // Reset form controls
    document.getElementById("search-input").value = "";
    document.getElementById("min-year").value = "";
    document.getElementById("max-year").value = "";
    document.getElementById("sort-by").selectedIndex = 0;
    document.getElementById("language-filter").selectedIndex = 0;
    
    // Reset to default sort
    this.currentSortCriterion = "title";
    
    this.showCards();
  }
  
  // Update the book count display
  updateBookCount() {
    const countElement = document.getElementById("book-count");
    if (countElement) {
      countElement.textContent = `Showing ${this.displayedBooks.length} of ${this.books.length} books`;
    }
  }


  // Initialize the catalog
  async initialize() {
    try {
      await this.fetchBooks();
      this.setupEventListeners();
      this.showCards();
    } catch (error) {
      console.error('Error initializing book catalog:', error);
    }
  }


  // Set up all event listeners
  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", () => this.searchBooks());
    }
    
    // Year filter
    const yearFilterButton = document.getElementById("year-filter-button");
    if (yearFilterButton) {
      yearFilterButton.addEventListener("click", this.handleYearFilter);
    }
    
    // Reset filters
    const resetButton = document.getElementById("reset-filters");
    if (resetButton) {
      resetButton.addEventListener("click", this.handleResetFilters);
    }
    
    // Sort by dropdown
    const sortBySelect = document.getElementById("sort-by");
    if (sortBySelect) {
      sortBySelect.addEventListener("change", this.handleSortChange);
    }
    
    // Add event listener for language filter
    const languageFilter = document.getElementById("language-filter");
    if (languageFilter) {
      languageFilter.addEventListener("change", (event) => {
        this.filterByLanguage(event.target.value);
      });
    }
  }
  
  // Event handler for search input
  handleSearch() {
    this.searchBooks();
  }
  
  // Event handler for year filter
  handleYearFilter() {
    this.filterByYearRange();
  }
  
  // Event handler for reset filters
  handleResetFilters() {
    this.resetFilters();
  }
  
  // Event handler for sort change
  handleSortChange(event) {
    this.sortBooks(event.target.value);
  }

  
}

// Create and initialize the book catalog when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Create global instance of BookCatalog
  window.bookCatalog = new BookCatalog();
  
  // Initialize the catalog
  window.bookCatalog.initialize();
  
}); 