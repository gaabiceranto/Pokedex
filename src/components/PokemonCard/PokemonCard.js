export class PokemonCard {
  static CONFIG = { ANIMATION_DURATION: 300 };

  static #TYPE_MAP = {
    grass: "grass",
    fire: "fire",
    water: "water",
    electric: "electric",
    normal: "normal",
    bug: "grass",
    poison: "grass",
    flying: "normal",
    ground: "normal",
    rock: "normal",
    psychic: "normal",
    ice: "water",
    dragon: "fire",
    dark: "normal",
    steel: "normal",
    fairy: "normal",
    fighting: "fire",
    ghost: "normal",
  };

  static #PLACEHOLDER_IMAGE = "https://placehold.co/143x143?text=Pok%C3%A9mon";

  #pokemon;
  #onClick;

  #element = null;
  #refs = { id: null, type: null, name: null, img: null, skeleton: null };
  #typeClass = "normal";
  #abortController = new AbortController();

  constructor(pokemon, onClick = null) {
    this.#pokemon = pokemon ?? {};
    this.#onClick = typeof onClick === "function" ? onClick : null;
  }

  get element() {
    return this.#element;
  }

  get pokemon() {
    return this.#pokemon;
  }

  render() {
    if (this.#element) return this.#element;

    const card = document.createElement("article");
    card.className = "pokemon-card pokemon-card--type-normal";
    card.setAttribute("role", "article");

    card.innerHTML = `
      <div class="pokemon-card__header">
        <span class="pokemon-card__type"></span>
        <span class="pokemon-card__id"></span>
      </div>
      <div class="pokemon-card__image-container">
        <img class="pokemon-card__image" loading="lazy" alt="" style="opacity: 0;" />
      </div>
      <div class="pokemon-card__info">
        <h3 class="pokemon-card__name"></h3>
      </div>
    `;

    this.#element = card;
    this.#refs = {
      id: card.querySelector(".pokemon-card__id"),
      type: card.querySelector(".pokemon-card__type"),
      name: card.querySelector(".pokemon-card__name"),
      img: card.querySelector(".pokemon-card__image"),
      skeleton: null,
    };

    this.#wire();
    this.update(this.#pokemon);

    return card;
  }

  update(pokemon) {
    this.#pokemon = pokemon ?? {};
    if (!this.#element) return;

    const displayName = this.#pokemon?.name || "Unknown";
    const primaryType = this.#getPrimaryType();
    const typeClass = this.#getTypeClass(primaryType);

    this.#setTypeClass(typeClass);

    this.#refs.id.textContent = this.#formatId();
    this.#refs.type.textContent = primaryType;
    this.#refs.name.textContent = displayName;

    this.#element.setAttribute("aria-label", `Pokémon ${displayName}`);

    this.#setLoading(true);

    const img = this.#refs.img;
    img.alt = displayName;
    img.style.opacity = "0";
    img.src = this.#getImageUrl();
  }

  destroy() {
    this.#abortController.abort();
    this.#element?.remove();
    this.#element = null;
    this.#refs = {
      id: null,
      type: null,
      name: null,
      img: null,
      skeleton: null,
    };
  }

  #wire() {
    const { signal } = this.#abortController;

    if (this.#onClick) {
      this.#element.style.cursor = "pointer";
      this.#element.addEventListener(
        "click",
        () => this.#onClick(this.#pokemon),
        { signal }
      );
    }

    const img = this.#refs.img;

    img.addEventListener(
      "load",
      async () => {
        await this.#decodeIfPossible(img);
        img.style.opacity = "1";
        this.#setLoading(false);
      },
      { signal }
    );

    img.addEventListener(
      "error",
      async () => {
        if (img.src !== PokemonCard.#PLACEHOLDER_IMAGE) {
          img.src = PokemonCard.#PLACEHOLDER_IMAGE;
          return;
        }
        await this.#decodeIfPossible(img);
        img.style.opacity = "1";
        this.#setLoading(false);
      },
      { signal }
    );

    if (img.complete && img.naturalWidth > 0) {
      queueMicrotask(async () => {
        await this.#decodeIfPossible(img);
        img.style.opacity = "1";
        this.#setLoading(false);
      });
    }
  }

  #setLoading(isLoading) {
    if (!this.#element) return;

    this.#element.classList.toggle("pokemon-card--skeleton", isLoading);
    this.#element.toggleAttribute("aria-busy", isLoading);

    if (isLoading) {
      if (!this.#refs.skeleton) {
        const skeleton = document.createElement("div");
        skeleton.className = "pokemon-card__skeleton";
        this.#element.appendChild(skeleton);
        this.#refs.skeleton = skeleton;
      }
    } else {
      if (this.#refs.skeleton) {
        this.#refs.skeleton.remove();
        this.#refs.skeleton = null;
      }
    }
  }

  #setTypeClass(next) {
    if (!this.#element) return;
    if (next === this.#typeClass) return;

    this.#element.classList.remove(`pokemon-card--type-${this.#typeClass}`);
    this.#element.classList.add(`pokemon-card--type-${next}`);
    this.#typeClass = next;
  }

  async #decodeIfPossible(img) {
    if (!img.decode) return;
    await img.decode();
  }

  #getPrimaryType() {
    return this.#pokemon?.types?.[0]?.type?.name || "normal";
  }

  #getTypeClass(type) {
    return PokemonCard.#TYPE_MAP[String(type || "").toLowerCase()] || "normal";
  }

  #formatId() {
    const id =
      this.#pokemon?.id || this.#pokemon?.url?.match(/\/(\d+)\//)?.[1] || "0";
    return `#${String(id).padStart(4, "0")}`;
  }

  #getImageUrl() {
    return (
      this.#pokemon?.sprites?.other?.["official-artwork"]?.front_default ||
      this.#pokemon?.sprites?.front_default ||
      PokemonCard.#PLACEHOLDER_IMAGE
    );
  }
}
