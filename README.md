# Innowacje (static)

Założenia:
- Tylko HTML + SCSS (BEM) + JS.
- Komponent akordeonu ma nazwę `paccordion` (unikamy słowa "accordion").
- Implementacja zgodna z WAI-ARIA APG (bez ról `tablist/tab/tabpanel`).

Strony:
- `public/index.html`
- `public/strona-2.html`

Pliki:
- SCSS źródłowy: `src/scss/styles.scss`
- CSS dla przeglądarki: `public/assets/css/styles.css`
- JS komponentu: `public/assets/js/paccordion.js`

Kotwice:
- Każdy element, do którego chcesz linkować, ma `id`.
- Wejście na `.../#jakies-id` przewija do elementu i automatycznie otwiera wszystkie nadrzędne sekcje `paccordion`, żeby target był widoczny.
- Jeśli `paccordion__item` nie ma `id`, JS wygeneruje deterministyczny slug z tekstu nagłówka (label) i zapewni unikalność przez sufiksy `-2`, `-3`, itd.
- Domyślnie rozwinięte sekcje: dodaj `data-open` na `paccordion__item`. Jeśli to element zagnieżdżony, JS automatycznie otworzy wszystkich rodziców.

Kompilacja SCSS (przykład):
```bash
npx sass --watch src/scss/styles.scss public/assets/css/styles.css
```
