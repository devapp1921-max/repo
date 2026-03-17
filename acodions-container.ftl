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
         <h1 class="paccordion-container__title paccordion-container__title--big">Tytuł</h1>
         <h2 class="paccordion-container__subtitle paccordion-container__subtitle--small">Podtytuł</h2>
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
         <div class="paccordion paccordion--framed" data-paccordion-group>...</div>

         headerVisibility:
         <header class="paccordion-container__header">
           <h1 class="paccordion-container__title paccordion-container__title--big">Tytuł</h1>
           <h2 class="paccordion-container__subtitle paccordion-container__subtitle--small">Podtytuł</h2>
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
            <h3>${content.title!}</h3>
            [#if content.subtitle?has_content]
                <span>${content.subtitle!}</span>
            [/#if]
        </div>
    [/#if]

    [#-- accordions list --]
    [@cms.area name="accordions-container"/]

</div>
