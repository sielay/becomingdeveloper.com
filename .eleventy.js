// based on https://www.webstoemp.com/blog/basic-custom-taxonomies-with-eleventy/

const pluginSass = require("eleventy-plugin-sass");
const blog = require("eleventy-plugin-blog");
const readingTime = require("eleventy-plugin-reading-time");
const embedYouTube = require("eleventy-plugin-youtube-embed");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const excerpt = require("eleventy-plugin-excerpt");
const postcss = require("gulp-postcss");
const clean = require("postcss-clean");
const tailwindcss = require("tailwindcss");
const embedInstagram = require("eleventy-plugin-embed-instagram");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginEmbedTweet = require("eleventy-plugin-embed-tweet");
const shortcodes = require("./_content/_includes/shortcodes");
const markdownIt = require("markdown-it");
const { kebabCase } = require("lodash");
const stripHtml = require("string-strip-html");

module.exports = function (eleventyConfig) {
  const markdownItOptions = {
    html: true,
  };
  const markdownLib = markdownIt(markdownItOptions).use(
    require("markdown-it-anchor"),
    {
      permalink: true,
    }
  );
  eleventyConfig.setLibrary("md", markdownLib);
  shortcodes(eleventyConfig);

  eleventyConfig.addPlugin(pluginSass, {
    watch: ["./*.scss", "!node_modules/**", "!_site"],
    sourcemaps: true,
    additionalSteps: [() => postcss([tailwindcss("./tailwind.config.js"), clean()])],
  });

  eleventyConfig.addPlugin(readingTime);
  eleventyConfig.addPlugin(excerpt);
  eleventyConfig.addPlugin(embedInstagram);
  eleventyConfig.addPlugin(embedYouTube);
  eleventyConfig.addPlugin(pluginEmbedTweet);
  eleventyConfig.addPlugin(blog, {
    input: "./_content",
    blogPostTemplate: "blogpost.njk",
    itemsPerPage: 20,
    blogPaths: ["./_content/blog/**/*.md"],
    defaultCategory: 'learn'
  });
  blog.generateBooleanCollection(eleventyConfig, "topNav", "topNav", {
    all: ["./_content/*.md"],
  });
  eleventyConfig.addPlugin(pluginRss);
  //eleventyConfig.addPlugin(cacheBuster({}));
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPassthroughCopy("_content/**/*.jpg");
  eleventyConfig.addPassthroughCopy("_content/**/*.png");
  eleventyConfig.addPassthroughCopy("_content/**/*.svg");
  eleventyConfig.addFilter("data", (list, key) => {
    return key;
  });

  // filters
  eleventyConfig.addFilter("kebab", kebabCase);
  eleventyConfig.addFilter("text_length", ({templateContent}) => {
    return stripHtml(templateContent).length;
  });
  eleventyConfig.addFilter("safejson_each", (data, field) => {
    try {
      return Object.values(data).map((value) =>
        field ? value[field] : Object.keys(value)
      );
    } catch (error) {
      return `${data}`;
    }
  });
  eleventyConfig.addFilter("collections_flat", (data) => {
    try {
      return Object.values(data).reduce(
        (previous, current) => [...previous, Array.isArray(current) ? current : []],
        []
      );
    } catch (error) {
      console.error(error);
      return null;
    }
  });
  eleventyConfig.addFilter("sort_by", (data, field) => {
    return Array.isArray(data)
      ? data.sort((a, b) => {
          const A = a[field].replace(/[^a-zA-Z0-9]+/g, "");
          const B = b[field].replace(/[^a-zA-Z0-9]+/g, "");
          if (A === B) return 0;
          return A > B ? 1 : -1;
        })
      : data;
  });

  return {
    markdownTemplateEngine: "njk",
    writeTagsToCollections: "shags",
    dir: {
      input: "./_content",
    },
  };
};
