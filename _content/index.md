---
title: Becoming a Software Developer - A prequel to learn-to-code books in a rapidly changing world
topNav: false
image: cover.jpg
---
{%- include 'hero.njk' -%}
{%- include 'subscribe.njk' -%}
<div>
  <ul>
    {%- for post in collections.blog[0].items  -%}
    <li>
      {%- include 'tile.njk' -%}
    </li>
    {%- endfor -%}
  </ul>
  <a href="/blog/" class="bg-yellow-400 block shadow-2xl p-2 px-4">More blog post</a>
</div>
<div class="flex flex-wrap">
<div class="lg:w-1/2 xl:w-1/2 p-6">
{%- include 'months.njk' -%}
</div>
<div class="lg:w-1/2 xl:w-1/2 p-6">
{%- include 'tagcloud.njk' -%}
</div>
</div>