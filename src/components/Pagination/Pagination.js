export class Pagination {
  #element = null;
  #currentPage = 1;
  #totalPages = 1;
  #onPageChange;
  #isInitialized = false;

  constructor(onPageChange, element = null) {
    this.#onPageChange = onPageChange;
    this.#element = element;
  }

  get currentPage() {
    return this.#currentPage;
  }
  get totalPages() {
    return this.#totalPages;
  }
  get element() {
    return this.#element;
  }

  init() {
    if (!this.#element) {
      this.#element = document.querySelector(".pagination");
    }

    if (this.#element) {
      this.#ensureStructure();
      this.#ensureEvents();
      this.update();
    }

    return this.#element;
  }

  render(container = null) {
    if (!this.#element) {
      this.#element = this.#createElement();
      this.#isInitialized = true;
    }

    if (container) {
      container.appendChild(this.#element);
    }

    return this.#element;
  }

  update(currentPage = 1, totalPages = 1) {
    if (!this.#element) return;

    this.#currentPage = Math.max(1, Math.min(currentPage, totalPages));
    this.#totalPages = Math.max(1, totalPages);

    this.#updateButtons();
    this.#updatePageList();
  }

  destroy() {
    if (this.#element) {
      this.#element.removeEventListener("click", this.#handleClick);
      this.#element.remove();
      this.#element = null;
      this.#isInitialized = false;
    }
  }

  #getHTMLTemplate() {
    return `
      <button class="pagination__previous" aria-label="Página anterior">
        <img src="/src/assets/icons/arrow-right.svg" alt=""
             class="pagination__icon pagination__icon--left" aria-hidden="true">
        <span class="pagination__text">Anterior</span>
      </button>
      <ul class="pagination__list"></ul>
      <button class="pagination__next" aria-label="Próxima página">
        <span class="pagination__text">Próximo</span>
        <img src="/src/assets/icons/arrow-right.svg" alt=""
             class="pagination__icon" aria-hidden="true">
      </button>
    `;
  }

  #ensureStructure() {
    if (!this.#element.querySelector(".pagination__previous")) {
      this.#element.innerHTML = this.#getHTMLTemplate();
    }
  }

  #ensureEvents() {
    if (!this.#isInitialized) {
      this.#element.addEventListener("click", this.#handleClick);
      this.#isInitialized = true;
    }
  }

  #createElement() {
    const nav = document.createElement("nav");
    nav.className = "pagination";
    nav.setAttribute("role", "navigation");
    nav.setAttribute("aria-label", "Paginação");
    nav.innerHTML = this.#getHTMLTemplate();
    nav.addEventListener("click", this.#handleClick);
    return nav;
  }

  #handleClick(e) {
    const button = e.target.closest("[data-page]");
    if (!button) return;

    e.preventDefault();
    const page = parseInt(button.dataset.page, 10);

    if (this.#isValidPage(page) && page !== this.#currentPage) {
      this.#onPageChange?.(page);
    }
  }

  #isValidPage(page) {
    return Number.isInteger(page) && page >= 1 && page <= this.#totalPages;
  }

  #updateButtons() {
    const prevBtn = this.#element.querySelector(".pagination__previous");
    const nextBtn = this.#element.querySelector(".pagination__next");

    if (prevBtn) {
      prevBtn.disabled = this.#currentPage === 1;
      prevBtn.dataset.page = this.#currentPage - 1;
    }

    if (nextBtn) {
      nextBtn.disabled = this.#currentPage === this.#totalPages;
      nextBtn.dataset.page = this.#currentPage + 1;
    }
  }

  #updatePageList() {
    const list = this.#element.querySelector(".pagination__list");
    if (!list) return;

    const fragment = document.createDocumentFragment();

    for (const page of this.#generatePageNumbers()) {
      const li = document.createElement("li");
      li.className = "pagination__item";

      if (page === "...") {
        li.innerHTML = '<span class="pagination__gap">...</span>';
      } else {
        const isCurrent = page === this.#currentPage;
        li.innerHTML = `
          <button class="pagination__page ${
            isCurrent ? "pagination__page--current" : ""
          }"
                  data-page="${page}"
                  aria-label="Página ${page}"
                  ${isCurrent ? 'aria-current="page"' : ""}>
            ${page}
          </button>
        `;
      }

      fragment.appendChild(li);
    }

    list.replaceChildren(fragment);
  }

  #generatePageNumbers() {
    const totalPages = this.#totalPages;
    const currentPage = this.#currentPage;

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  }
}