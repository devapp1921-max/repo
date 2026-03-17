[#assign content = cmfn.decode(content)]
<div class="p-accordion" id="${content.anchorId}">
    <section class="p-accordion-section">
        <div class="p-accordion-header">
            <span class="p-accordion-header__title">${cmfn.decode(content.accordionTitle)}</span>
            <span class="p-accordion-arrow"></span>
        </div>

        <div class="p-accordion-content">
            [@cms.area name="accordion-content"/]
        </div>
    </section>
</div>
