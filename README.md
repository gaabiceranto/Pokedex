# Pokédex

Aplicação de Pokédex desenvolvida com Vanilla JavaScript, Vite e SCSS. Arquitetura modular com nomenclatura BEM e design tokens.

## Tecnologias

- Vanilla JavaScript (ES6+)
- Vite 5.0
- SCSS
- PokéAPI

## Funcionalidades

- Listagem de Pokémon com paginação (18 por página)
- Busca por nome (dispara ao pressionar Enter)
- Paginação com navegação entre páginas
- Estado sincronizado com URL (query params)
- Cache de requisições para melhor performance
- Cancelamento de requisições obsoletas
- Estados de loading e erro
- Layout responsivo
- Acessibilidade (ARIA, navegação por teclado, HTML semântico)

### Design Tokens

Cores, espaçamentos, tipografia e outros valores estão centralizados em variáveis SCSS para manter consistência visual.

### BEM

Todos os componentes seguem a convenção BEM (Block Element Modifier):

```scss
.pokemon-card {
  // block
  &__image {
    // element
    // estilos
  }
  &--type-grass {
    // modifier
    // estilos
  }
}
```

## Como usar

1. Clone o repositório e entre na pasta:

```bash
git clone <repo-url>
cd Pokedex
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Scripts

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção (gera pasta `www/`)
- `npm run preview` - Preview do build de produção

## Detalhes de Implementação

### Busca

A busca é disparada ao pressionar Enter. Busca por substring no nome do Pokémon e mantém paginação nos resultados. O estado da busca fica sincronizado com a URL.

### Paginação

A paginação exibe números de página com ellipsis quando necessário. Os botões anterior/próximo ficam desabilitados nas extremidades. Ao mudar de página, o scroll volta automaticamente para o topo.

### Performance

Implementei cache em memória para evitar requisições duplicadas. Uso AbortController para cancelar requisições obsoletas quando o usuário faz uma nova busca ou muda de página rapidamente. Request tokens garantem que apenas a resposta mais recente seja processada.

### Estado na URL

O estado da aplicação (busca e página atual) fica sincronizado com query params na URL. Isso permite compartilhar links e usar os botões voltar/avançar do navegador.

## Responsividade

- Mobile (< 768px): 2 colunas
- Tablet (768px - 1024px): 4 colunas
- Desktop (> 1024px): 6 colunas

## Acessibilidade

A aplicação inclui:

- Atributos ARIA apropriados
- Navegação por teclado funcional
- Foco visível em elementos interativos
- HTML semântico (header, nav, section, etc)
- Textos alternativos em imagens


Este projeto foi desenvolvido como parte de um desafio técnico.
