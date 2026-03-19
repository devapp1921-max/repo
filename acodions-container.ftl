[#assign content = cmsfn.decode(content)]

[#-- content.border:
     show - pokaz (domyślnie); jak w figu cenówki / strony produktowe
     hide - nie dodawaj; jak w figu cenówki / cenówki z regulaminy i nagłówek z marginesy subtitle? - prośba o ustawienie własnej property :) 
--]

[#if content.border?has_content && content.border == "show"]
    [#assign borderClass = "accordion-container--border"]
[/#if]

<div class="p-accordions-container ${borderClass!}">

    [#-- content.headerVisibility:
         none - brak (domyślnie)
         big - jak w figu cenówki / cenówki z regulaminy (duży wielki tytuł z marginesy subtitle? - prośba o ustawienie własnej property)
         small - jak w figu inna sekcja
    --]

    [#-- KLASY (CMS -> HTML):
         paccordion-container__title--none | --hide | --small | --big
         paccordion-container__subtitle--none | --hide | --small | --big

        przykład:
        <span class="paccordion-container__title paccordion-container__title--big" role="heading" aria-level="1">Tytuł</span>
        <span class="paccordion-container__subtitle paccordion-container__subtitle--small" role="heading" aria-level="2">Podtytuł</span>

        tytul/podtytul:
        - Tytul nagłówek ustalany przez redaktora h1-h5, 
          jesli tytul to span, trzeba dodać role="heading" + aria-level chyba jakieś domyślne.
        - Podtytul jako span: jesli pod SEO, wtedy role="heading" + aria-level = titleLevel + 1.
          Jesli to tylko opis, zwykly span bez role/aria-level.

        akordeon:
        - Dla naglowkow akordeonu uzywamy <div class="paccordion__heading"> zamiast h2/h3.
        - W takim <div> DODAJEMY role="heading" + aria-level (np. 2, 3, 4, 5 w zaleznosci od poziomu).

        głowny div:
        - jeśli to samodzielna strona to możemy dodać role="main", ale może być tylko raz na stronie
        
    --]

    [#-- DODATKOWE ATRYBUTY / KLASY:
         data-open (na .paccordion__item) = domyślnie otwarty
         paccordion--framed (na .paccordion) = obramowanie kontenera (zgodne z content.border: show/hide)
         paccordion--nested (na .paccordion) = akordeon zagnieżdżony
         paccordion__item--l1/--l2/--l3/--l4 = poziom zagnieżdżenia
         paccordion__file-list--cols-1 / --cols-2 = układ listy plików
    --]

    [#-- SEO dla akordeonów FAQ:
        itemscope itemtype="https://schema.org/Question" itemprop="mainEntity" na .paccordion__item
        itemprop="name" na .paccordion__label
        itemscope itemtype="https://schema.org/Answer" itemprop="acceptedAnswer" na .paccordion__panel
        itemprop="text" na .paccordion__richtext lub .paccordion__file-list
    --]

    [#-- PRZYKŁADY:
         border:
         <div class="paccordion paccordion--framed">...</div>

        headerVisibility:
        <header class="paccordion-container__header">
          <span class="paccordion-container__title paccordion-container__title--big" role="heading" aria-level="1">Tytuł</span>
          <span class="paccordion-container__subtitle paccordion-container__subtitle--small" role="heading" aria-level="2">Podtytuł</span>
        </header>

         data-open:
         <div class="paccordion__item paccordion__item--l1" data-open>...</div>

         poziomy:
         <div class="paccordion__item paccordion__item--l2">...</div>

         file list:
         <ul class="paccordion__file-list paccordion__file-list--cols-2">
           <li class="paccordion__file-item"><a class="paccordion__file-link" href="#"><span class="paccordion__file-text">Plik</span></a></li>
         </ul>
    --]

    [#if content.headerVisibility?has_content && content.headerVisibility != "none"]
        <div class="p-accordions-container-header p-accordions-container-header-${content.headerVisibility}">
            <span class="paccordion-container__title" role="heading" aria-level="${content.titleLevel!1}">${content.title!}</span>
            [#if content.subtitle?has_content]
                <span class="paccordion-container__subtitle" role="heading" aria-level="${content.subtitleLevel!2}">${content.subtitle!}</span>
            [/#if]
        </div>
    [/#if]

    [#-- accordions list --]
    [@cms.area name="accordions-container"/]

</div>
