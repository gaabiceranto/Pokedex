export class SearchBar {
  #abortController = new AbortController();

  constructor(onSearch, rootSelector) {
    this.onSearch = typeof onSearch === "function" ? onSearch : null;
    this.rootSelector = rootSelector;

    this.element = null;
    this.input = null;
    this.clearButton = null;
    this.searchIcon = null;
  }

  init() {
    this.#abortController.abort();
    this.#abortController = new AbortController();

    this.element = this.rootSelector;
    if (!this.element) return null;

    this.input = this.element.querySelector(".search-bar__input");
    this.clearButton = this.element.querySelector(".search-bar__clear-button");
    this.searchIcon = this.element.querySelector(".search-bar__search-icon");

    if (!this.input) return this.element;

    this.#wire();
    this.#syncUI();

    return this.element;
  }

  destroy() {
    this.#abortController.abort();
    this.element = null;
    this.input = null;
    this.clearButton = null;
    this.searchIcon = null;
  }

  getValue() {
    return this.input ? this.input.value.trim() : "";
  }

  setValue(value) {
    if (!this.input) return;
    this.input.value = value ?? "";
    this.#syncUI();
  }


  #wire() {
    const { signal } = this.#abortController;

    const submit = () => {
      this.onSearch?.(this.getValue());
    };

    const clear = () => {
      if (!this.input) return;
      this.input.value = "";
      this.#syncUI();
      this.onSearch?.("");
      this.input.focus();
    };

    this.input.addEventListener("input", () => this.#syncUI(), { signal });

    this.input.addEventListener(
      "keydown",
      (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        submit();
      },
      { signal }
    );

    this.input.addEventListener(
      "keydown",
      (e) => {
        if (e.key !== "Escape") return;
        clear();
      },
      { signal }
    );

    this.clearButton?.addEventListener("click", clear, { signal });
  }

  #syncUI() {
    const hasText = this.getValue().length > 0;

    if (this.searchIcon) {
      this.searchIcon.style.display = hasText ? "none" : "flex";
    }

    if (this.clearButton) {
      this.clearButton.classList.toggle("search-bar__clear-button--visible", hasText);
    }
  }
}
