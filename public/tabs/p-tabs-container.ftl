[#assign content = cmsfn.decode(content)]
[#assign tabs = cmsfn.children(content, "tabs")![]]
[#assign headingId = "ptabs-title-" + (content.@id!"tabs")]
<section class="ptabs-container">
    [#if content.header?has_content]
        <h1 class="ptabs-container__title" id="${headingId}">${content.header}</h1>
    [/#if]
    <div class="ptabs" data-ptabs>
        <div class="ptabs__nav">
            <button class="ptabs__chevron ptabs__chevron--prev" type="button" aria-label="Poprzednia zakładka"></button>
            <div class="ptabs__viewport">
                <div class="ptabs__list" role="tablist"
                    [#if content.header?has_content]aria-labelledby="${headingId}"[#else]aria-label="Zakładki"[/#if]>
                    [#list tabs as tab]
                        [#assign tabContent = cmsfn.decode(tab)]
                        [#assign panelId = tabContent.anchor!tabContent.@id]
                        [#assign tabId = "tab-" + panelId]
                        [#assign tabLabel = tabContent.title!"Tab " + (tab?index + 1)]
                        <button class="ptabs__tab" type="button" role="tab" id="${tabId}" aria-controls="${panelId}" aria-selected="${tab?index == 0?string('true','false')}" tabindex="${tab?index == 0?string('0','-1')}">
                            <span class="ptabs__label">${tabLabel}</span>
                        </button>
                    [/#list]
                </div>
            </div>
            <button class="ptabs__chevron ptabs__chevron--next" type="button" aria-label="Następna zakładka"></button>
        </div>
        [@cms.area name="tabs"/]
    </div>
</section>
