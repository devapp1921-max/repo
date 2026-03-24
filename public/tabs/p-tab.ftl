[#assign content = cmsfn.decode(content)]

[#assign tabId = content.anchor!content.@id]

<div class="ptab" id="${tabId}">
    <div class="ptab-name">${content.title!}</div>
    [@cms.area name="content"/]
</div>