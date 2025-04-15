# Book Catalog Application Technical Documentation

This document provides a detailed technical explanation of the JavaScript code in `scripts.js`. The code implements a book catalog application using object-oriented programming principles with two main classes: `Book` and `BookCatalog`.

## 1. Book Class

### `constructor(bookData)`
```javascript
constructor(bookData) {
  this.title = bookData.title;       // Assigns the book title from input data
  this.author = bookData.author;     // Assigns the author name from input data
  this.year = bookData.year;         // Assigns the publication year from input data
  this.language = bookData.language; // Assigns the language from input data
  this.country = bookData.country;   // Assigns the country of origin from input data
  this.pages = bookData.pages;       // Assigns the page count from input data
  this.imageLink = bookData.imageLink; // Assigns the image path from input data
}
```
- Each line takes a property from the `bookData` parameter and assigns it to the corresponding property on the Book instance
- This creates a structured object with all book properties accessible via dot notation

### `getImageURL()`
```javascript
getImageURL() {
  return this.imageLink ? `data/${this.imageLink}` : "";
}
```
- Uses a ternary operator to check if `this.imageLink` exists (is truthy)
- If it exists, returns a string that prepends "data/" to the image link path
- If not, returns an empty string to handle missing images gracefully

### `matchesSearchTerm(searchTerm)`
```javascript
matchesSearchTerm(searchTerm) {
  if (!searchTerm || searchTerm.trim() === "") return true;
  
  const term = searchTerm.toLowerCase().trim();
  
  return this.title && this.title.toLowerCase().includes(term);
}
```
- First line checks if the search term is empty or null, and returns true if so (all books match an empty search)
- Second line converts the search term to lowercase and removes whitespace
- Third line:
  - Checks if the book title exists (defensive programming)
  - Converts the title to lowercase for case-insensitive comparison
  - Uses the `includes()` method to check if the title contains the search term anywhere
  - Returns the boolean result of this check

#### Detailed Explanation of String Methods
Let's examine the string handling in this method:
```javascript
if (!searchTerm || searchTerm.trim() === "") return true;
const term = searchTerm.toLowerCase().trim();
return this.title && this.title.toLowerCase().includes(term);
```

1. **Logical Negation and OR (`!` and `||`)**:
   - `!searchTerm` checks if the search term is null, undefined, or an empty string (falsy values)
   - The OR operator `||` creates a short-circuit evaluation - if the first condition is true, the second isn't checked
   - This combines two checks in one efficient statement

2. **`trim()` Method**:
   - Removes whitespace characters (spaces, tabs, newlines) from both ends of a string
   - `"  hello  ".trim()` becomes `"hello"`
   - Helps normalize user input that might contain accidental spaces

3. **`toLowerCase()` Method**:
   - Converts all characters in a string to lowercase
   - Makes the search case-insensitive (so "Book" will match "book", "BOOK", etc.)
   - Important for user-friendly searching that doesn't require exact case matching

4. **Method Chaining**:
   - `searchTerm.toLowerCase().trim()` chains methods together
   - Each method returns a string, allowing the next method to be called immediately
   - Elegant way to apply multiple transformations in a single line

5. **`includes()` Method**:
   - ES6 method that checks if a string contains another string
   - Returns true if the substring is found anywhere, false otherwise
   - More modern and readable than using `indexOf() !== -1`
   - Enables partial matching rather than requiring exact matches

6. **Defensive Programming**:
   - `this.title &&` checks if the title property exists before trying to use it
   - Prevents errors if a book object is malformed or incomplete
   - Gracefully handles edge cases like missing titles

### `isInYearRange(minYear, maxYear)`
```javascript
isInYearRange(minYear, maxYear) {
  const bookYear = parseInt(this.year || 0);
  return bookYear >= minYear && bookYear <= maxYear;
}
```
- First line parses the book's year as an integer, with a fallback to 0 if year is undefined
- Second line uses a logical AND operator to check if:
  - The book year is greater than or equal to the minimum year
  - AND the book year is less than or equal to the maximum year
- Returns true only if both conditions are met

### `hasLanguage(genre)`
```javascript
hasLanguage(genre) {
  if (!this.language) return false;
  return this.language.split(', ').includes(genre);
}
```
- First line is a guard clause that returns false if the book has no language property
- Second line:
  - Splits the language string by comma and space (`', '`)
  - Creates an array of individual languages
  - Uses the `includes()` method to check if the specified genre is in this array
  - Returns the boolean result

## 2. BookCatalog Class

### `constructor()`
```javascript
constructor() {
  this.books = [];              // Initialize empty array for all books
  this.displayedBooks = [];     // Initialize empty array for currently displayed books
  this.currentSortCriterion = "title";  // Set default sort criterion
  
  // Bind methods to this instance
  this.handleSortChange = this.handleSortChange.bind(this);
  this.handleYearFilter = this.handleYearFilter.bind(this);
  this.handleSearch = this.handleSearch.bind(this);
  this.handleResetFilters = this.handleResetFilters.bind(this);
}
```
- First three lines initialize instance properties:
  - `books`: Empty array to store all loaded book objects
  - `displayedBooks`: Empty array to track which books are currently shown
  - `currentSortCriterion`: String set to "title" as the default sort method
- The next four lines bind event handler methods to this instance:
  - This ensures that when these methods are called from event listeners, `this` refers to the BookCatalog instance
  - Without binding, `this` would refer to the DOM element that triggered the event
  - Using `.bind(this)` creates a new function with the correct context

### `initialize()`
```javascript
async initialize() {
  try {
    await this.fetchBooks();
    this.setupEventListeners();
    this.showCards();
  } catch (error) {
    console.error('Error initializing book catalog:', error);
  }
}
```
- `async` keyword defines this as an asynchronous function that returns a Promise
- `try` block attempts to execute the initialization sequence:
  - `await this.fetchBooks()` loads book data and waits for it to complete
  - `this.setupEventListeners()` connects event handlers to UI elements
  - `this.showCards()` renders the initial book display
- `catch` block handles any errors during initialization:
  - Logs detailed error information to the console
  - Prevents the application from crashing if initialization fails

### `fetchBooks()`
```javascript
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
```
- `async` keyword defines this as an asynchronous function
- `try` block attempts to fetch and process the data:
  - `const response = await fetch('data/books.json')` sends an HTTP request to get the book data
  - The `if (!response.ok)` check validates that the response is successful
  - `const bookData = await response.json()` parses the JSON response
  - `this.books = bookData.map(data => new Book(data))` creates an array of Book objects
  - `this.displayedBooks = this.books.slice()` makes a copy of all books for display
  - `console.log` outputs a success message with book count
- `catch` block handles any errors:
  - Logs detailed error information to console
  - Gets the card container element
  - Sets its HTML to display an error message
  - Re-throws the error to let calling code handle it

#### Detailed Explanation of Async/Await and Array Methods
Let's examine the asynchronous code and array methods:
```javascript
async fetchBooks() {
  // ...
  const response = await fetch('data/books.json');
  // ...
  const bookData = await response.json();
  
  this.books = bookData.map(data => new Book(data));
  this.displayedBooks = this.books.slice();
}
```

1. **`async/await` Pattern**:
   - `async` keyword marks a function as asynchronous, meaning it returns a Promise implicitly
   - `await` pauses execution until the Promise resolves, making asynchronous code look synchronous
   - Makes complex asynchronous operations more readable and easier to reason about
   - Eliminates deeply nested callbacks (often called "callback hell")

2. **`fetch()` API**:
   - Modern browser API for making HTTP requests
   - Returns a Promise that resolves to the Response object
   - Simpler and more powerful alternative to the older XMLHttpRequest
   - First `await` pauses until the network request completes

3. **`response.json()`**:
   - Method of the Response object that extracts and parses JSON data
   - Returns another Promise that resolves to the parsed JavaScript object
   - Second `await` pauses until JSON parsing is complete

4. **`map()` Array Method**:
   - Higher-order function that transforms each element of an array
   - Takes a callback function that is applied to each array element
   - Returns a new array with the transformed elements
   - In this case, transforms each raw data object into a Book instance
   - `data => new Book(data)` is an arrow function that creates a new Book

5. **`slice()` Array Method**:
   - Creates a shallow copy of an array (or portion of an array)
   - Without arguments, copies the entire array
   - Important for maintaining separation between the master list and displayed list
   - Prevents unintended modifications to the original array

6. **Error Handling with try/catch**:
   - `try` block contains code that might throw exceptions
   - `catch` block handles any errors that occur
   - Provides graceful error handling and user feedback
   - Re-throwing the error allows calling code to also handle it if needed

### `showCards()`
```javascript
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
```
- `const cardContainer = document.getElementById("card-container")` gets the DOM element to hold book cards
- `cardContainer.innerHTML = ""` clears any existing content
- The `if` block handles empty results:
  - Checks if `displayedBooks` array is empty
  - If empty, shows a "no results" message
  - Updates the book count display
  - Returns early to skip the rest of the function
- The `for` loop creates a card for each book:
  - `const bookCard = document.createElement("div")` creates a new div element
  - `bookCard.className = "card"` sets its CSS class
  - `bookCard.style.display = "block"` makes it visible
  - `bookCard.innerHTML = ...` sets the HTML template for the card with:
    - Book title with tooltip
    - Book cover image with a fallback using the placeholder service
    - List of book details (author, year, language, country, pages)
  - `cardContainer.appendChild(bookCard)` adds the card to the container
- `this.updateBookCount()` refreshes the count of displayed books

### `filterByYearRange()`
```javascript
filterByYearRange() {
  const minYear = parseInt(document.getElementById("min-year").value) || -3000;
  const maxYear = parseInt(document.getElementById("max-year").value) || 3000;
  
  this.displayedBooks = this.books.filter(book => book.isInYearRange(minYear, maxYear));
  
  // Maintain the current sort order after filtering
  this.sortBooks(this.currentSortCriterion, false);
}
```
- First two lines get the year range values:
  - Gets the values from the input fields
  - Parses them as integers
  - Provides default values (-3000 and 3000) using the OR operator if parsing fails
- `this.displayedBooks = this.books.filter(...)` updates displayed books by:
  - Starting with the complete books array
  - Applying a filter that keeps only books within the year range
  - Using the Book's `isInYearRange` method to check each book
- `this.sortBooks(this.currentSortCriterion, false)` maintains sorting by:
  - Calling the sort function with the current criterion
  - Passing `false` to prevent unnecessary logging

#### Detailed Explanation of filter() Method
Let's examine how the filter method works:
```javascript
this.displayedBooks = this.books.filter(book => book.isInYearRange(minYear, maxYear));
```

1. **`filter()` Array Method**:
   - Creates a new array with elements that pass a test function
   - Takes a callback function that returns true or false
   - Elements that return true are included in the result array
   - Does not modify the original array (non-destructive)

2. **Arrow Function `book => book.isInYearRange(minYear, maxYear)`**:
   - Concise syntax for the filter callback
   - For each book in the array, calls its `isInYearRange` method
   - Passes the minYear and maxYear values to the method
   - Returns the boolean result from `isInYearRange`

3. **Delegation Pattern**:
   - Instead of implementing the year check directly, it delegates to the Book class
   - Each Book instance knows how to check itself against a year range
   - This follows good object-oriented design principles
   - The filter callback simply calls the appropriate method on each object

4. **Assignment to `this.displayedBooks`**:
   - Reassigns the filtered array to the displayedBooks property
   - This updates what is shown to the user
   - Only books meeting the year range criteria remain

5. **Chain of Operations**:
   - After filtering, sorting is automatically applied 
   - This maintains a consistent user experience
   - The `false` parameter suppresses logging during this automatic sort

### `filterByLanguage(language)`
```javascript
filterByLanguage(language) {
  if (language === "All") {
    this.displayedBooks = this.books.slice();
  } else {
    this.displayedBooks = this.books.filter(book => book.hasLanguage(language));
  }
  
  // Maintain the current sort order after filtering
  this.sortBooks(this.currentSortCriterion, false);
}
```
- The `if/else` block handles filtering:
  - If "All" is selected, creates a copy of all books with `.slice()`
  - Otherwise, filters the books array to include only those with the selected language
  - Uses the Book's `hasLanguage` method for language checking
- `this.sortBooks(this.currentSortCriterion, false)` maintains the current sort order

### `sortBooks(criterion, logSort = true)`
```javascript
sortBooks(criterion, logSort = true) {
  if (!criterion || this.displayedBooks.length === 0) return;
  
  // Store the current sort criterion
  this.currentSortCriterion = criterion;
  
  if (logSort) {
    console.log("Sorting by:", criterion);
  }
  
  switch(criterion) {
    case "title":
      this.displayedBooks.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      break;
    case "author":
      this.displayedBooks.sort((a, b) => (a.author || "").localeCompare(b.author || ""));
      break;
    case "year":
      this.displayedBooks.sort((a, b) => {
        const yearA = parseInt(a.year || 0);
        const yearB = parseInt(b.year || 0);
        return yearA - yearB;
      });
      break;
    default:
      // Default to title sort if criterion is not recognized
      this.displayedBooks.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }
  
  // Re-display the sorted books
  this.showCards();
}
```
- The first line is a guard clause:
  - Exits early if no criterion is provided or there are no books to sort
- `this.currentSortCriterion = criterion` updates the class property to track sort state
- The `if (logSort)` block conditionally logs sorting information to the console
- The `switch` statement handles different sort criteria:
  - For "title": Uses `localeCompare` for alphabetical sorting with fallback to empty string
  - For "author": Similar to title sorting but on the author field
  - For "year": Converts years to integers and uses numeric comparison
  - Default case: Falls back to title sort for unrecognized criteria
- `this.showCards()` refreshes the display with the newly sorted books

#### Detailed Explanation of Sort Method
Let's examine this critical sorting statement in detail:
```javascript
this.displayedBooks.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
```

1. **`sort()` Method**:
   - JavaScript's built-in array sorting method
   - It takes a comparison function as an argument
   - The comparison function receives two elements from the array (referred to as `a` and `b`)
   - The function must return:
     - A negative value if `a` should come before `b`
     - A positive value if `a` should come after `b`
     - Zero if they are equivalent for sorting purposes
   - Without a comparison function, `sort()` converts elements to strings and sorts by Unicode code points

2. **Arrow Function `(a, b) => ...`**:
   - Creates a compact comparison function
   - `a` and `b` represent two Book objects being compared
   - Returns the result of `localeCompare()`

3. **Null Handling `(a.title || "")`**:
   - The logical OR operator `||` provides a fallback value 
   - If `a.title` is null, undefined, or empty, it uses an empty string instead
   - This prevents errors when comparing against missing values

4. **`localeCompare()` Method**:
   - A String method that compares two strings properly according to the current locale
   - Returns negative, positive, or zero values as required by the sort method
   - Benefits over basic comparison (`<` or `>`):
     - Handles language-specific sorting rules (e.g., accented characters)
     - Properly sorts uppercase and lowercase letters according to locale rules
     - Handles special characters appropriately

5. **Overall Function**:
   - In-place sorts the `displayedBooks` array alphabetically by title
   - Handles null values gracefully
   - Uses locale-aware sorting for proper alphabetical order
   - Books with titles earlier in the alphabet appear first

### `searchBooks()`
```javascript
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
```
- First block gets and validates the search input element:
  - Gets the DOM element by ID
  - Returns early with an error log if not found
- `const searchTerm = searchInput.value.toLowerCase().trim()` processes the search input:
  - Gets the text value from the input
  - Converts to lowercase for case-insensitive search
  - Removes whitespace from both ends
- The `if/else` block handles different search cases:
  - For empty search: Resets to all books using `.slice()` to create a copy
  - For active search: Filters books using their `matchesSearchTerm` method
  - Logs detailed information about matches for debugging
- `this.showCards()` refreshes the UI with the search results

### `resetFilters()`
```javascript
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
```
- `this.displayedBooks = this.books.slice()` resets displayed books to all books
- The next five lines reset all form controls:
  - Clears text in the search input
  - Clears both year range inputs
  - Sets dropdown selects back to first option using `selectedIndex = 0`
- `this.currentSortCriterion = "title"` resets sort to the default criterion
- `this.showCards()` refreshes the display with all books

### `updateBookCount()`
```javascript
updateBookCount() {
  const countElement = document.getElementById("book-count");
  if (countElement) {
    countElement.textContent = `Showing ${this.displayedBooks.length} of ${this.books.length} books`;
  }
}
```
- `const countElement = document.getElementById("book-count")` gets the element to show the count
- The `if` block updates the text if the element exists:
  - Uses a template string to show the number of displayed books
  - Shows the total number of books for reference
  - Updates the element's text content

### `setupEventListeners()`
```javascript
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
```
- This function sets up five different event listeners:
  1. Search input:
     - Gets the search input field
     - Attaches an "input" event listener (fires on each keystroke)
     - Uses an arrow function to maintain correct context
  2. Year filter button:
     - Gets the year filter button
     - Attaches a "click" event listener
     - Uses the pre-bound handler method
  3. Reset filters button:
     - Gets the reset button
     - Attaches a "click" event listener
     - Uses the pre-bound handler method
  4. Sort dropdown:
     - Gets the sort selection dropdown
     - Attaches a "change" event listener
     - Uses the pre-bound handler method
  5. Language filter:
     - Gets the language dropdown
     - Attaches a "change" event listener
     - Uses an arrow function that passes the selected value to filterByLanguage
- Each section includes a conditional check to ensure the element exists before attaching listeners

#### Detailed Explanation of Event Handling
Let's examine the event handling patterns used:
```javascript
const searchInput = document.getElementById("search-input");
if (searchInput) {
  searchInput.addEventListener("input", () => this.searchBooks());
}

// ...vs...

const resetButton = document.getElementById("reset-filters");
if (resetButton) {
  resetButton.addEventListener("click", this.handleResetFilters);
}
```

1. **`document.getElementById()`**:
   - Core DOM method to find elements by their ID attribute
   - Returns a single element or null if not found
   - Much faster than other selector methods since IDs are unique
   - Used consistently to access UI elements

2. **Existence Check `if (element)`**:
   - Defensive programming technique to prevent null reference errors
   - Only attempts to add event listeners if the element exists
   - Guards against missing elements in the DOM
   - Makes code more robust against HTML changes

3. **`addEventListener()` Method**:
   - Modern way to attach event handlers to DOM elements
   - Takes an event type (like "click" or "input") and a callback function
   - Better than older methods like `onclick` because:
     - Multiple listeners can be attached to the same event
     - Provides more control over event propagation
     - Follows the W3C standard for event handling

4. **Event Types**:
   - "input" - Fires when the value of an input element changes (for real-time search)
   - "click" - Fires when the element is clicked (for buttons)
   - "change" - Fires when the selected value changes (for dropdowns)
   - Each event type matches the expected user interaction with that element

5. **Two Callback Styles**:
   - **Arrow Function `() => this.searchBooks()`**:
     - Creates a new function that preserves the current `this` context
     - Used when additional processing is needed or when passing parameters
     - In the language filter case, it extracts and passes the selected value
   
   - **Pre-bound Method `this.handleResetFilters`**:
     - References a method that was bound to the class instance in the constructor
     - Binding was done with `this.handleResetFilters = this.handleResetFilters.bind(this)`
     - Ensures that `this` refers to the BookCatalog instance, not the DOM element
     - Slightly more efficient than creating a new arrow function for each listener

### Event Handler Methods
```javascript
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
```
- `handleSearch()`: Simply calls the `searchBooks()` method
- `handleYearFilter()`: Simply calls the `filterByYearRange()` method
- `handleResetFilters()`: Simply calls the `resetFilters()` method
- `handleSortChange(event)`:
  - Takes the event object as a parameter
  - Gets the selected value from `event.target.value`
  - Passes this value to the `sortBooks()` method

## 3. Application Initialization
```javascript
document.addEventListener("DOMContentLoaded", () => {
  // Create global instance of BookCatalog
  window.bookCatalog = new BookCatalog();
  
  // Initialize the catalog
  window.bookCatalog.initialize();
}); 
```
- `document.addEventListener("DOMContentLoaded", () => {...})`:
  - Listens for the "DOMContentLoaded" event
  - Uses an arrow function as the callback
- Inside the callback:
  - `window.bookCatalog = new BookCatalog()` creates a new catalog instance and assigns it to the global window object
  - `window.bookCatalog.initialize()` starts the initialization process
  - This ensures the application only runs after the HTML is fully loaded
 