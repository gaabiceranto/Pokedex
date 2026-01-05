export class PokeApiService {
  constructor() {
    this.baseUrl = "https://pokeapi.co/api/v2";
    this.cache = new Map();
  }

  async getPokemonList(offset = 0, limit = 18, options = {}) {
    try {
      const cacheKey = `list_${offset}_${limit}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await fetch(
        `${this.baseUrl}/pokemon?offset=${offset}&limit=${limit}`,
        options
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const pokemonDetails = await Promise.all(
        data.results.map((pokemon) => this.getPokemonDetails(pokemon.url))
      );

      const result = {
        results: pokemonDetails,
        count: data.count,
        next: data.next,
        previous: data.previous,
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Erro ao buscar lista de Pokémon:", error);
      throw error;
    }
  }

  async getPokemonDetails(url) {
    try {
      if (this.cache.has(url)) {
        return this.cache.get(url);
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.cache.set(url, data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar detalhes do Pokémon:", error);
      throw error;
    }
  }

  async searchPokemonByName(name) {
    try {
      const normalizedName = name.toLowerCase().trim();
      const cacheKey = `search_${normalizedName}`;

      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await fetch(`${this.baseUrl}/pokemon/${normalizedName}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar Pokémon por nome:", error);
      return null;
    }
  }

  async searchPokemonByNamePartial(searchTerm, maxResults = 200, options = {}) {
    try {
      const normalizedSearch = searchTerm.toLowerCase().trim();
      if (!normalizedSearch) {
        return { results: [], count: 0 };
      }

      const results = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore && results.length < maxResults) {
        const response = await fetch(
          `${this.baseUrl}/pokemon?offset=${offset}&limit=${limit}`,
          options
        );

        if (!response.ok) {
          break;
        }

        const data = await response.json();

        const matchingNames = data.results.filter((pokemon) =>
          pokemon.name.toLowerCase().includes(normalizedSearch)
        );

        if (matchingNames.length > 0) {
          const details = await Promise.all(
            matchingNames.map((pokemon) => this.getPokemonDetails(pokemon.url))
          );
          results.push(...details);
        }

        hasMore = data.next !== null;
        offset += limit;

        if (results.length > 0 && !data.next) {
          hasMore = false;
        }
      }

      return {
        results: results.slice(0, maxResults),
        count: results.length,
      };
    } catch (error) {
      console.error("Erro ao buscar Pokémon por nome parcial:", error);
      return { results: [], count: 0 };
    }
  }

  clearCache() {
    this.cache.clear();
  }
}
