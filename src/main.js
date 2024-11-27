import "./static/styles.css";

// List of available fonts
const fonts = [
  "Inter", "Arimo", "Caveat", "Dancing Script", "Exo", "Fira Sans", "Josefin Sans",
  "Lato", "Lobster", "Lora", "Merrieweather", "Montserrat", "Mukta",
  "Noto Sans", "Nunito", "Open Sans", "Pacifico", "Playfair Display",
  "Plus Jakarta Sans", "Poppins", "PT Sans", "Quicksand", "Raleway",
  "Roboto", "Roboto Slab", "Rokkit", "Rubik", "Source Sans 3",
  "Titillium Web", "Ubuntu", "Work Sans", "Volkhov",
  "Zilla Slab", "Karla", "Varela Round", "Barlow",
  "Mulish", "Asap", "Arvo", "Amatic SC",
  "Parkinsans", "Inconsolata", "Overpass", "Tinos", "Signika",
  "Abel", "Archivo", "Manrope", "Public Sans", "IBM Plex Sans"
];

class FontFountainApp {
  constructor() {
    this.history = [];
    this.initializeApp();
  }

  // Initialize the application on DOMContentLoaded
  initializeApp() {
    document.addEventListener("DOMContentLoaded", () => {
      this.renderAppLayout();
      this.setupFontList();
      this.setupPreviewArea();
      this.setupScrollControls();
    });
  }

  // Render the app layout
  renderAppLayout() {
    const app = document.getElementById("App");
    app.innerHTML = `
      <header id="app-identity">
        <img src="./static/logo.png" id="logo" alt="Font Fountain Logo">
        <div id="recently-viewed">
          <div id="preview-history-header">
            <h2>Preview History</h2>
            <div id="scroll-controls">
              <button id="scroll-left" class="scroll-btn" aria-label="Scroll left">&larr;</button>
              <button id="scroll-right" class="scroll-btn" aria-label="Scroll right">&rarr;</button>
            </div>
          </div>
          <div id="history-list"></div>
        </div>
      </header>
      <main>
        <section id="font-preview">
          <div id="preview-container" class="preview-text" contenteditable="true">
            ${this.createCharacterSpans("Whereas disregard and contempt for human rights have resulted")}
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
  createCharacterSpans(text) {
    return text
      .split("")
      .map(char => `<span class="char">${char}</span>`)
      .join("");
  }

  // Populate the font list
  setupFontList() {
    const fontList = document.getElementById("font-list");
    fonts.forEach(font => {
      const fontItem = document.createElement("div");
      fontItem.textContent = font;
      fontItem.style.fontFamily = font;
      fontItem.classList.add("font-item");

      fontItem.addEventListener("click", () => this.selectFont(font));
      fontList.appendChild(fontItem);
    });
  }

  // Set up the preview area for dynamic interactions
  setupPreviewArea() {
    const previewContainer = document.getElementById("preview-container");

    previewContainer.addEventListener("input", () => {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const cursorOffset = this.getCursorOffset(previewContainer, range);

      const text = previewContainer.textContent;
      previewContainer.innerHTML = this.createCharacterSpans(text);
      this.restoreCursorPosition(previewContainer, cursorOffset);
    });

    previewContainer.addEventListener("wheel", event => {
      const charElement = event.target.closest(".char");
      if (charElement) {
        this.handleGlyphRounding(charElement, event);
        event.preventDefault();
      }
    });
  }

  // Add scrolling functionality to preview history
  setupScrollControls() {
    const historyList = document.getElementById("history-list");
    const scrollLeftButton = document.getElementById("scroll-left");
    const scrollRightButton = document.getElementById("scroll-right");

    const updateScrollButtons = () => {
      const maxScrollLeft = historyList.scrollWidth - historyList.clientWidth;
      scrollLeftButton.classList.toggle("enabled", historyList.scrollLeft > 0);
      scrollRightButton.classList.toggle("enabled", historyList.scrollLeft < maxScrollLeft);
    };

    scrollLeftButton.addEventListener("click", () => {
      historyList.scrollBy({ left: -800, behavior: "smooth" });
      updateScrollButtons();
    });

    scrollRightButton.addEventListener("click", () => {
      historyList.scrollBy({ left: 800, behavior: "smooth" });
      updateScrollButtons();
    });

    historyList.addEventListener("scroll", updateScrollButtons);
    updateScrollButtons();
  }

  // Get the cursor's offset in the preview area
  getCursorOffset(container, range) {
    let offset = 0;

    const traverseNodes = (node) => {
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
    };

    traverseNodes(container);
    return offset;
  }

  // Restore the cursor's position in the preview area
  restoreCursorPosition(container, offset) {
    const range = document.createRange();
    const selection = window.getSelection();

    const setCursor = (node) => {
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
    };

    setCursor(container);
  }

  // Handle glyph rounding (change character on scroll)
  handleGlyphRounding(charElement, event) {
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
  selectFont(fontName) {
    const previewContainer = document.getElementById("preview-container");
    previewContainer.style.fontFamily = fontName;

    this.addToHistory(fontName);
    this.highlightSelectedFont(fontName);
  }

  // Highlight the selected font in the font list
  highlightSelectedFont(fontName) {
    const fontItems = document.querySelectorAll(".font-item");
    fontItems.forEach(fontItem => {
      fontItem.classList.toggle("selected-font", fontItem.textContent === fontName);
    });
  }

  // Add a font to the recently viewed history if not already there
  addToHistory(fontName) {
    if (!this.history.includes(fontName)) {
      this.history.unshift(fontName);

      const historyList = document.getElementById("history-list");
      const historyItem = document.createElement("div");
      historyItem.textContent = fontName;
      historyItem.style.fontFamily = fontName;
      historyItem.classList.add("font-item");

      historyItem.addEventListener("click", () => {
        const previewContainer = document.getElementById("preview-container");
        previewContainer.style.fontFamily = fontName;
        this.highlightSelectedFont(fontName);
      });

      historyList.prepend(historyItem);
    }
  }
}

// Initialize the application
new FontFountainApp();