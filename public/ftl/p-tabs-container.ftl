[#assign content = cmsfn.decode(content)]
[#assign tabsTitleId = "ptabs-title-" + (content.@id!'tabs')]

<section class="ptabs-container">
    [#if content.header?has_content]
        <div class="ptabs-container__title"
             id="${tabsTitleId}"
             role="heading"
             aria-level="2">
            ${content.header}
        </div>
    [/#if]

    [@cms.area
        name="tabs"
        contextAttributes={
            "tabsTitleId": tabsTitleId,
            "tabsAriaLabel": content.header!"Taby"
        }
    /]
</section>