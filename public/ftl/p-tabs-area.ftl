[#assign areaContent = cmsfn.decode(content)]
[#assign tabs = components![]]
[#assign tabsTitleId = ctx.attributes.tabsTitleId!""]
[#assign tabsAriaLabel = ctx.attributes.tabsAriaLabel!"Taby"]

[#function tabBaseId tab index]
    [#assign decodedTab = cmsfn.decode(tab)]
    [#assign raw = (decodedTab.anchor!(tab.@id!"tab-" + index))?lower_case]
    [#return raw?replace("[^a-z0-9\\-_]", "-", "r")]
[/#function]

[#assign iconClass = "ptabs--no-icons"]
[#list tabs as tab]
    [#if tab.icon?has_content]
        [#assign iconClass = "ptabs--icons"]
        [#break]
    [/#if]
[/#list]

<div class="ptabs ${iconClass} ptabs--desktop-carousel" data-ptabs>
    <div class="ptabs__list"
         role="tablist"
    [#if tabsTitleId?has_content]
    aria-labelledby="${tabsTitleId}"
    [#else]
    aria-label="${tabsAriaLabel}"
    [/#if]>
    [#list tabs as tab]
        [#assign decodedTab = cmsfn.decode(tab)]
        [#assign idx = tab?index + 1]
        [#assign baseId = tabBaseId(tab, idx)]

        [#if tab.icon??]
            [#assign iconSrc = damfn.getAssetLink(tab.icon)!]
        [#else]
            [#assign iconSrc = ""]
        [/#if]

        <button class="ptabs__tab"
                role="tab"
                id="${baseId}-tab"
                aria-controls="${baseId}-panel"
                aria-selected="${(tab?index == 0)?string('true', 'false')}"
                tabindex="${(tab?index == 0)?string('0', '-1')}">
            [#if iconSrc?has_content]
                <span class="ptabs__icon" aria-hidden="true">
                    <img src="${iconSrc}" alt="" />
                </span>
            [/#if]
            <span class="ptabs__label">${decodedTab.title!('Tab ' + idx)}</span>
        </button>
    [/#list]
    </div>

    [#list tabs as tab]
        [#assign idx = tab?index + 1]
        [#assign baseId = tabBaseId(tab, idx)]

        <div class="ptabs__panel"
             role="tabpanel"
             id="${baseId}-panel"
             aria-labelledby="${baseId}-tab"
             tabindex="-1"
                [#if tab?index != 0]hidden[/#if]>
                [@cms.component content=tab /]
        </div>
    [/#list]
</div>