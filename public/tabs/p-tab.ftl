[#assign content = cmsfn.decode(content)]
[#assign panelId = content.anchor!content.@id]
[#assign tabId = "tab-" + panelId]

<div class="ptabs__panel" id="${panelId}" role="tabpanel" aria-labelledby="${tabId}" tabindex="-1">
    [@cms.area name="content"/]
</div>
