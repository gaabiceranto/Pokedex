import { PokemonCard } from "../PokemonCard/PokemonCard.js";

export class PokemonGrid {
  static CONFIG = { SKELETON_COUNT: 18 };

  element = null;

  #cards = new Map();

  init() {
    if (!this.element) this.element = document.querySelector(".pokemon-grid");
    return this.element;
  }

  render() {
    return this.element || this.init();
  }

  getElement() {
    return this.element;
  }

  clear() {
    this.#destroyAllCards();
    this.element?.replaceChildren();
  }

  renderPokemon(pokemonList, onClick = null) {
    if (!this.element) return;

    const list = Array.isArray(pokemonList) ? pokemonList : [];

    if (list.length === 0) {
      this.clear();
      this.#showEmpty();
      return;
    }

    this.element?.classList.remove("pokemon-grid--has-empty-state");

    const nextKeys = new Set();
    const nextMap = new Map();
    const frag = document.createDocumentFragment();

    for (const p of list) {
      const key = this.#keyOf(p);
      if (!key) continue;

      nextKeys.add(key);

      let card = this.#cards.get(key);
      if (!card) card = new PokemonCard(p, onClick);
      else card.update(p);

      nextMap.set(key, card);
      frag.appendChild(card.render());
    }

    for (const [key, card] of this.#cards) {
      if (!nextKeys.has(key)) card.destroy();
    }

    this.#cards = nextMap;
    this.element.replaceChildren(frag);
  }

  showLoading() {
    if (!this.element) return;

    this.#destroyAllCards();

    const frag = document.createDocumentFragment();
    for (let i = 0; i < PokemonGrid.CONFIG.SKELETON_COUNT; i++) {
      frag.appendChild(this.#createSkeletonCard());
    }
    this.element.replaceChildren(frag);
  }

  showError(message = "Erro ao carregar Pokémon") {
    if (!this.element) return;

    this.clear();
    this.element?.classList.add("pokemon-grid--has-empty-state");

    this.element.innerHTML = `
      <div class="pokemon-grid--error">
        <p class="pokemon-grid__error-message">${message}</p>
      </div>
    `;
  }

  destroy() {
    this.clear();
    this.element?.remove();
    this.element = null;
  }

  #destroyAllCards() {
    for (const card of this.#cards.values()) card.destroy();
    this.#cards.clear();
  }

  #keyOf(pokemon) {
    return pokemon?.id || pokemon?.name || "";
  }

  #showEmpty() {
    this.element?.classList.add("pokemon-grid--has-empty-state");

    this.element.innerHTML = `
      <div class="pokemon-grid--empty">
        <p class="pokemon-grid__empty-message">
          Nenhum Pokémon encontrado. Tente buscar com outro Nome.
        </p>
      </div>
    `;
  }

  #createSkeletonCard() {
    const card = document.createElement("article");
    card.className =
      "pokemon-card pokemon-card--skeleton pokemon-card--type-normal";
    card.setAttribute("role", "article");
    card.setAttribute("aria-label", "Carregando Pokémon");
    card.setAttribute("aria-busy", "true");

    const skeleton = document.createElement("div");
    skeleton.className = "pokemon-card__skeleton";

    card.innerHTML = `
      <div class="pokemon-card__header">
        <span class="pokemon-card__type"></span>
        <span class="pokemon-card__id"></span>
      </div>
      <div class="pokemon-card__image-container"></div>
      <div class="pokemon-card__info">
        <h3 class="pokemon-card__name"></h3>
      </div>
    `;

    card.appendChild(skeleton);
    return card;
  }
}
