import { SearchBar } from "../components/SearchBar/SearchBar.js";
import { PokemonGrid } from "../components/PokemonGrid/PokemonGrid.js";
import { Pagination } from "../components/Pagination/Pagination.js";
import { PokeApiService } from "./services/PokeApiService.js";

export class App {
  constructor() {
    this.apiService = new PokeApiService();

    this.currentPage = 1;
    this.itemsPerPage = 18;
    this.totalPokemon = 0;

    this.currentPokemonList = [];

    this.searchTerm = "";
    this.isSearching = false;

    this.searchBar = null;
    this.pokemonGrid = null;
    this.pagination = null;

    this._reqAC = null;
    this._reqToken = 0;
  }

  async init() {
    const appContainer = document.getElementById("app");
    if (!appContainer) {
      console.error("Container #app não encontrado");
      return;
    }

    this._readUrlParams();
    this._renderLayout(appContainer);

    window.addEventListener("popstate", async () => {
      this._readUrlParams();
      await this._applyUrlParams();
    });

    await this._applyUrlParams();
  }

  _renderLayout(container) {
    this._initHeader(container);

    const existingSearchBar = container.querySelector(".search-bar");
    this.searchBar = new SearchBar(
      (term) => this._handleSearch(term),
      existingSearchBar
    );
    this.searchBar.init();

    const existingGrid = container.querySelector(".pokemon-grid");
    this.pokemonGrid = new PokemonGrid(existingGrid);
    this.pokemonGrid.init();

    const existingPagination = container.querySelector(".pagination");
    this.pagination = new Pagination(
      (page) => this._handlePageChange(page),
      existingPagination
    );
    this.pagination.init();
  }

  _initHeader(container) {
    const header = container.querySelector(".header");
    if (!header) return;

    const navLinks = header.querySelectorAll(".navigation-item");
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        navLinks.forEach((navLink) => {
          navLink.classList.remove("navigation-item--active");
          navLink.removeAttribute("aria-current");
        });

        link.classList.add("navigation-item--active");
        link.setAttribute("aria-current", "page");
      });
    });
  }

  _normalizeTerm(term) {
    return String(term ?? "").trim();
  }

  _getTotalPages(totalItems) {
    return Math.max(1, Math.ceil(totalItems / this.itemsPerPage));
  }

  _getPageSlice(list, page) {
    const start = (page - 1) * this.itemsPerPage;
    return list.slice(start, start + this.itemsPerPage);
  }

  _startRequest() {
    if (this._reqAC) this._reqAC.abort();
    this._reqAC = new AbortController();
    this._reqToken += 1;

    return { signal: this._reqAC.signal, token: this._reqToken };
  }

  _isStale(token) {
    return token !== this._reqToken;
  }

  async _renderCurrentView({ updateUrl = true } = {}) {
    if (updateUrl) this._updateUrl();

    if (this.isSearching) {
      await this._loadSearchResults();
      return;
    }

    await this._loadPokemonPage();
  }

  async _loadPokemonPage() {
    const { signal, token } = this._startRequest();

    try {
      this.pokemonGrid.showLoading();

      const offset = (this.currentPage - 1) * this.itemsPerPage;

      const data = await this.apiService.getPokemonList(
        offset,
        this.itemsPerPage,
        { signal }
      );

      if (this._isStale(token)) return;

      this.currentPokemonList = data.results;
      this.totalPokemon = data.count;

      const totalPages = this._getTotalPages(this.totalPokemon);
      this.pagination.update(this.currentPage, totalPages);

      this.pokemonGrid.renderPokemon(this.currentPokemonList);
    } catch (error) {
      if (error?.name === "AbortError") return;
      if (this._isStale(token)) return;

      console.error("Erro ao carregar Pokémon:", error);
      this.pokemonGrid.showError(
        "Erro ao carregar os Pokémon. Tente novamente mais tarde."
      );
    }
  }

  async _loadSearchResults() {
    const { signal, token } = this._startRequest();

    try {
      this.pokemonGrid.showLoading();

      const searchResults = await this.apiService.searchPokemonByNamePartial(
        this.searchTerm,
        200,
        { signal }
      );

      if (this._isStale(token)) return;

      this.currentPokemonList = searchResults.results || [];

      const totalPages = this._getTotalPages(this.currentPokemonList.length);
      this.pagination.update(this.currentPage, totalPages);

      const pageItems = this._getPageSlice(
        this.currentPokemonList,
        this.currentPage
      );
      this.pokemonGrid.renderPokemon(pageItems);
    } catch (error) {
      if (this._isStale(token)) return;

      console.error("Erro ao buscar Pokémon:", error);
      this.pokemonGrid.showError(
        "Erro ao buscar Pokémon. Verifique sua conexão e tente novamente."
      );
    }
  }

  async _handleSearch(searchTerm, updateUrl = true) {
    const term = this._normalizeTerm(searchTerm);

    if (term === this.searchTerm && this.isSearching === term.length > 0)
      return;

    this.searchTerm = term;
    this.isSearching = term.length > 0;

    this.currentPage = 1;

    await this._renderCurrentView({ updateUrl });
  }

  async _handlePageChange(page, updateUrl = true) {
    this.currentPage = page > 0 ? page : 1;

    if (updateUrl) this._updateUrl();

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (this.isSearching) {
      const totalPages = this._getTotalPages(this.currentPokemonList.length);
      this.pagination.update(this.currentPage, totalPages);

      const pageItems = this._getPageSlice(
        this.currentPokemonList,
        this.currentPage
      );
      this.pokemonGrid.renderPokemon(pageItems);
      return;
    }

    await this._loadPokemonPage();
  }

  _readUrlParams() {
    const params = new URLSearchParams(window.location.search);

    this.searchTerm = this._normalizeTerm(params.get("search") || "");
    this.isSearching = this.searchTerm.length > 0;

    const page = Number(params.get("page"));
    this.currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  }

  async _applyUrlParams() {
    if (this.searchBar) this.searchBar.setValue(this.searchTerm);
    await this._renderCurrentView({ updateUrl: false });
  }

  _updateUrl() {
    const params = new URLSearchParams();

    if (this.isSearching && this.searchTerm) {
      params.set("search", this.searchTerm);
    }

    if (this.currentPage > 1) {
      params.set("page", String(this.currentPage));
    }

    const qs = params.toString();
    const newUrl = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname;

    window.history.pushState(
      { search: this.searchTerm, page: this.currentPage },
      "",
      newUrl
    );
  }
}
