#!/usr/bin/env node

const prompts = require("prompts");
const path = require("path");
const mkdirp = require("mkdirp");
const { kebabCase } = require("lodash");
const { promises: fs } = require("fs");
const tags = require("./_content/_data/tags.json");
const categories = require("./_content/_data/categories.json");

const yamelize = (array) =>
  array.length === 0
    ? "[]"
    : `
${array.map((value) => ` - ${JSON.stringify(value)}`).join("\n")}\n`;

const getPath = (category, date, title) =>
  `${date.toISOString().substr(0, 10)}-${kebabCase(
    [...category, title].join(" ")
  )}`;

const getContent = ({ title, date, tags, category }) =>
  `---
title: ${JSON.stringify(title)}
date: ${date.toISOString()}
tags: ${yamelize(tags.filter(Boolean))}
categories: ${yamelize(category)}
---
`;

const getChoice = async (message, topLevel, flat, max) => {
  const response = [];
  let level = topLevel;
  let keys = Object.keys(level);
  while (keys !== null && (!max || response.length < max)) {
    console.log("keys", keys);
    console.log("response", response);
    console.log("max", max);
    console.log("flat", flat);

    let { value } = await prompts({
      type: "select",
      name: "value",
      message,
      choices: [
        (response.length > 0 && !flat) || !max
          ? {
              title: "[Confirm]",
              value: 1,
            }
          : false,
        ...keys.map((key) => ({
          value: key,
          title: key,
        })),
        {
          title: "[Other]",
          value: "",
        },
        {
          title: "[Abort]",
          value: -1,
        },
      ].filter(Boolean),
    });
    if (value === -1) {
      process.exit(-1);
    }
    if (value === 1) {
      keys = null;
    } else {
      if (value === "") {
        const entry = await prompts({
          type: "text",
          name: "value",
          message,
        });
        value = entry.value;
        level[value] = {};
      }
      response.push(value);
      if (!flat) {
        level = level[value] || {};
        keys = Object.keys(level);
      }
    }
  }
  return response;
};

const getCategory = async () =>
  await getChoice("Category?", categories, true, 1);
const getTags = async () => await getChoice("Tags?", tags, true);

(async () => {
  const prompts = require("prompts");
  const { title } = await prompts([
    {
      type: "text",
      name: "title",
      message: "Title?",
    },
  ]);
  const category = await getCategory();
  const tags = await getTags();

  const { text } = await prompts({
    type: "text",
    name: "text",
    message: "Content?",
  });

  const date = new Date();

  const content =
    getContent({
      title,
      date,
      tags,
      category,
    }) + text;

  const dirname = path.resolve(
    __dirname,
    "_content/blog/",
    getPath(category, date, title)
  );
  const filename = path.resolve(dirname, "index.md");
  await mkdirp(dirname);
  await fs.writeFile(filename, content, "utf8");
  await fs.writeFile(
    path.resolve(__dirname, "_content", "_data", "tags.json"),
    JSON.stringify(tags, null, 4),
    "utf8"
  );
})();
