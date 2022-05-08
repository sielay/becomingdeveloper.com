---
title: Collections
---
<div class="w-full lg:max-w-full lg:flex shadow-lg mb-5">
<div class="bg-white w-full rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal">
<div class="mb-8">
<h2 class="text-xl">Collections (debugging 11ty)</h2>
<ul>
{% for collection in collections | keys %}
<li>
<h3 class="text-lg">{{ collection }}:</h3>
<ul class="mt-2 mb-4" style="border-bottom: 1px solid #EEE;">
{% for item in collections | field(collection) %}
<li><a href="{{ item.url }}">{{ item.url }}</a></li>
{% endfor %}
</ul>
</li>
{% endfor %}
</ul>
</div>
</div>
</div>