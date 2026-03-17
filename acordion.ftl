[#assign content = cmsfn.decode(content)]

[#-- ATRYBUTY / KLASY:
     data-open (na .paccordion__item) = domyślnie otwarty
     paccordion__item--l1/--l2/--l3/--l4 = poziom zagnieżdżenia
     paccordion__file-list--cols-1 / --cols-2 = układ listy plików
     paccordion--framed (na .paccordion) = obramowanie kontenera (zgodne z content.border: show/hide)
--]

[#-- PRZYKŁADY:
     data-open:
     <div class="paccordion__item paccordion__item--l1" data-open>...</div>

     poziomy:
     <div class="paccordion__item paccordion__item--l3">...</div>

     file list:
     <ul class="paccordion__file-list paccordion__file-list--cols-1">
       <li class="paccordion__file-item"><a class="paccordion__file-link" href="#"><span class="paccordion__file-text">Plik</span></a></li>
     </ul>
--]

[#-- SEO dla akordeonów FAQ:
     itemscope itemtype="https://schema.org/Question" itemprop="mainEntity" na .paccordion__item
     itemprop="name" na .paccordion__label
     itemscope itemtype="https://schema.org/Answer" itemprop="acceptedAnswer" na .paccordion__panel
     itemprop="text" na .paccordion__richtext lub .paccordion__file-list
--]

[#if content.defaultOpened?has_content && content.defaultOpened]
    [#assign openClass = " opened"]
[/#if]

<div class="p-accordion-item ${openClass!}" id="${content.anchorId?c}">
    <span>${content.accordionTitle!}</span>
    <div class="p-accordion-content">
        [#-- tu będzie kolejny zagnieżdżony shortcode lub inne komponenty (sekcje tekstowe, pliki do pobrania) --]
        [@cms.area name="accordion-content"/]
    </div>
</div>
