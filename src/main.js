import "./static/styles.css";

// Fonts and History
const fonts = [
  "Roboto", "Lora", "Playfair Display", "Source Sans Pro", "Merriweather",
  "Montserrat", "Open Sans", "Raleway", "Noto Sans", "PT Sans",
  "Oswald", "Roboto Slab", "Lobster", "Work Sans", "Poppins",
  "Ubuntu", "Nunito", "Fira Sans", "Quicksand", "Caveat",
  "Pacifico", "Dancing Script", "Rubik", "Titillium Web", "Arimo",
  "Exo", "Mukta", "Rokkitt", "Lato", "Baloo",
  "Josefin Sans", "Zilla Slab", "Karla", "Varela Round", "Barlow",
  "Muli", "Heebo", "Asap", "Arvo", "Amatic SC",
  "Bebas Neue", "Inconsolata", "Overpass", "Tinos", "Signika",
  "Abel", "Archivo", "Manrope", "Public Sans", "IBM Plex Sans",
];

// Store Recently Viewed Fonts
let history = [];

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  setupFontList();
  setupPreviewArea();
});

// Initialize the app layout
function initializeApp() {
  const app = document.getElementById("App");
  app.innerHTML = `
    <header id="app-identity">
      <img src="./static/logo.png" id="logo" alt="Font Fountain Logo">
      <div id="recently-viewed">
        <h2>Preview History</h2>
        <div id="history-list"></div>
      </div>
    </header>
    <main>
      <section id="font-preview">
        <div id="preview-container" class="preview-text" contenteditable="true">
          ${createCharacterSpans("Explore the beauty of typography.")}
        </div>
      </section>
      <footer id="font-browser">
        <h2>Font Collection</h2>
        <div id="font-list"></div>
      </footer>
    </main>
  `;
}

// Create span-wrapped characters for the preview
function createCharacterSpans(text) {
  return text
    .split("")
    .map((char) => `<span class="char">${char}</span>`)
    .join("");
}

// Populate the font list
function setupFontList() {
  const fontList = document.getElementById("font-list");
  fonts.forEach((font) => {
    const fontItem = document.createElement("div");
    fontItem.textContent = font;
    fontItem.style.fontFamily = font;
    fontItem.classList.add("font-item");

    fontItem.addEventListener("click", () => selectFont(font));
    fontList.appendChild(fontItem);
  });
}

// Set up the preview area
function setupPreviewArea() {
  const previewContainer = document.getElementById("preview-container");

  previewContainer.addEventListener("input", () => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const cursorOffset = getCursorOffset(previewContainer, range);
    // Recreate the spans while maintaining the cursor position
    const text = previewContainer.textContent;
    previewContainer.innerHTML = createCharacterSpans(text);
    restoreCursorPosition(previewContainer, cursorOffset);
  });

  previewContainer.addEventListener("wheel", (event) => {
    const charElement = event.target.closest(".char");
    if (charElement) {
      handleGlyphRounding(charElement, event);
      event.preventDefault();
    }
  });
}

// Get the cursor's offset within the contenteditable element
function getCursorOffset(container, range) {
  let offset = 0;

  function traverseNodes(node) {
    if (node === range.startContainer) {
      offset += range.startOffset;
      return true;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      offset += node.textContent.length;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      for (let child of node.childNodes) {
        if (traverseNodes(child)) return true;
      }
    }
    return false;
  }

  traverseNodes(container);
  return offset;
}

// Restore the cursor's position within the contenteditable element
function restoreCursorPosition(container, offset) {
  const range = document.createRange();
  const selection = window.getSelection();

  function setCursor(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (offset <= node.textContent.length) {
        range.setStart(node, offset);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return true;
      } else {
        offset -= node.textContent.length;
      }
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      for (let child of node.childNodes) {
        if (setCursor(child)) return true;
      }
    }
    return false;
  }

  setCursor(container);
}

// Handle glyph rounding
function handleGlyphRounding(charElement, event) {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const currentChar = charElement.textContent;
  const alphabetIndex = alphabet.indexOf(currentChar);

  if (alphabetIndex !== -1) {
    const newChar =
      event.deltaY < 0
        ? alphabet[(alphabetIndex + 1) % alphabet.length]
        : alphabet[(alphabetIndex - 1 + alphabet.length) % alphabet.length];

    charElement.textContent = newChar;
  }
}

// Select a font and apply it to the preview area
function selectFont(fontName) {
  const previewContainer = document.getElementById("preview-container");
  previewContainer.style.fontFamily = fontName;

  addToHistory(fontName);
}

// Add a font to the recently viewed history
function addToHistory(fontName) {
  if (!history.includes(fontName)) {
    history.push(fontName);

    const historyList = document.getElementById("history-list");
    const historyItem = document.createElement("div");
    historyItem.textContent = fontName;
    historyItem.style.fontFamily = fontName;
    historyItem.classList.add("font-item");

    historyItem.addEventListener("click", () => {
      const previewContainer = document.getElementById("preview-container");
      previewContainer.style.fontFamily = fontName;
    });

    historyList.appendChild(historyItem);
  }
}