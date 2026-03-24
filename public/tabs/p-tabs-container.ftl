[#assign content = cmsfn.decode(content)]
<section class="ptabs-container">
    [#if content.header?has_content]
        <h1>${content.header}</h1>
    [/#if]
    <div class="ptabs">
	    [@cms.area name="tabs"/]
	</div>
</section>