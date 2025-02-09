import { MarkedOptions, Parser, Tokens, marked } from "marked";
import { cleanUrl, escape } from "./helpers.ts";
import { other } from "./rules.ts";

function getPrefixSuffix(s1, s2) {
  const start = s1.indexOf(s2);
  if (start === -1) {
    console.error(`s1: ${s1}`);
    console.error(`s2: ${s2}`);
    throw new Error("s2 is not a substring of s1");
  }

  const end = start + s2.length;
  const prefix = s1.substring(0, start);
  const suffix = s1.substring(end);

  return { prefix, suffix };
}

function getDisplayTextWithWrappedMarkdown(raw, displayText, rawText) {

  const {prefix, suffix} = getPrefixSuffix(raw, rawText || displayText);

  return `<span class="md">${prefix}</span>${displayText}<span class="md">${suffix}</span>`;
}


export class SynapseRenderer extends marked.Renderer {
  constructor(options?: MarkedOptions) {
    super(options);
  }

  space(): string {
    return "";
  }

  code({ text, lang, escaped, raw }: Tokens.Code): string {
    const langString = lang?.match(other.notSpaceStart)?.[0] || "";
    const code = `${text.replace(other.endingNewline, "")}\n`;

    return `<pre data-markdown="${raw}"><code class="mdhtml ${langString && escape(langString)}">${getDisplayTextWithWrappedMarkdown(raw, (escaped ? code : escape(code, true)), text)}</code></pre>\n`;
  }

  blockquote({ tokens, raw }: Tokens.Blockquote): string {
    return `<blockquote class="mdhtml" data-markdown="${raw}">\n${this.parser.parse(tokens)}</blockquote>\n`;
  }

  html({ text }: Tokens.HTML | Tokens.Tag): string {
    return text;
  }

  heading({ tokens, depth, raw }: Tokens.Heading): string {

    const displayText = `${this.parser.parseInline(tokens)}`;
    
    const rawText = `${tokens.map(tok => tok.raw).join('')}`;

    return `<h${depth} class="mdhtml" data-markdown="${raw}">${getDisplayTextWithWrappedMarkdown(raw, displayText, rawText)}</h${depth}>\n`
  }

  hr(): string {
    return "<hr class=\"mdhtml\">\n";
  }

  list({ ordered, start, items, raw }: Tokens.List): string {
    const type = ordered ? "ol" : "ul";
    const startAttr = ordered && start !== 1 ? ` start="${start}"` : "";
    const body = items.map(item => this.listitem(item)).join("");
    return `<${type} class="mdhtml" data-markdown="${raw}"${startAttr}>\n${body}</${type}>\n`;
  }

  listitem(item: Tokens.ListItem): string {
    const checkbox = item.task ? this.checkbox({ checked: !!item.checked }) : "";
    if (item.loose && item.tokens[0]?.type === "paragraph") {
      item.tokens[0].text = checkbox + " " + item.tokens[0].text;
    }
    return `<li class="mdhtml" data-markdown="${item.raw}">${checkbox}${this.parser.parse(item.tokens, !!item.loose)}</li>\n`;
  }

  checkbox({ checked }: Tokens.Checkbox): string {
    return `<input class="mdhtml" data-markdown="${checked}" ${checked ? "checked" : ""} disabled type="checkbox">`;
  }

  paragraph({ tokens, raw }: Tokens.Paragraph): string {
    return `<p class="mdhtml" data-markdown="${raw}">${this.parser.parseInline(tokens)}</p>\n`;
  }

  table({ header, rows, raw }: Tokens.Table): string {
    const renderRow = (row: Tokens.TableRow) => `<tr class="mdhtml" data-markdown="${raw}">${row.text}</tr>\n`;
    const headerHTML = `<thead class="mdhtml" data-markdown="${raw}">${renderRow({ text: header.map(this.tablecell.bind(this)).join("") })}</thead>\n`;
    const bodyHTML = rows.length ? `<tbody class="mdhtml" data-markdown="${raw}">${rows.map(row => renderRow({ text: row.map(this.tablecell.bind(this)).join("") })).join("")}</tbody>` : "";
    return `<table class="mdhtml" data-markdown="${raw}">\n${headerHTML}${bodyHTML}</table>\n`;
  }

  tablecell({ tokens, header, align, raw }: Tokens.TableCell): string {
    return `<${header ? "th" : "td"} class="mdhtml" data-markdown="${raw}"${align ? ` align="${align}"` : ""}>${this.parser.parseInline(tokens)}</${header ? "th" : "td"}>\n`;
  }

  strong({ tokens, raw }: Tokens.Strong): string {
    const displayText = this.parser.parseInline(tokens);
    const rawText = `${tokens.map(tok => tok.raw).join('')}`;


    return `<strong class="mdhtml" data-markdown="${raw}">${getDisplayTextWithWrappedMarkdown(raw, displayText, rawText)}</strong>`;
  }

  em({ tokens, raw }: Tokens.Em): string {
    const displayText = this.parser.parseInline(tokens);
    const rawText = `${tokens.map(tok => tok.raw).join('')}`;

    return `<em class="mdhtml" data-markdown="${raw}">${getDisplayTextWithWrappedMarkdown(raw, displayText, rawText)}</em>`;
  }

  codespan({ text, raw }: Tokens.Codespan): string {
    const displayText = escape(text, true)
    // const rawText = `${tokens.map(tok => tok.raw).join('')}`;

    return `<code class="mdhtml" data-markdown="${raw}">${getDisplayTextWithWrappedMarkdown(raw, displayText, text)}</code>`;
  }

  br(): string {
    return "<br class=\"mdhtml\">";
  }

  del({ tokens, raw }: Tokens.Del): string {
    const displayText = this.parser.parseInline(tokens);
    const rawText = `${tokens.map(tok => tok.raw).join('')}`;

    return `<del class="mdhtml" data-markdown="${raw}">${getDisplayTextWithWrappedMarkdown(raw, displayText, rawText)}</del>`;
  }

  link({ href, title, tokens, raw }: Tokens.Link): string {
    const cleanHref = cleanUrl(href);
    if (!cleanHref) return this.parser.parseInline(tokens);
    return `<a class="mdhtml" data-markdown="${raw}" href="${cleanHref}"${title ? ` title="${escape(title)}"` : ""}>${this.parser.parseInline(tokens)}</a>`;
  }

  image({ href, title, text, raw }: Tokens.Image): string {
    const cleanHref = cleanUrl(href);
    if (!cleanHref) return escape(text);
    return `<img class="mdhtml" data-markdown="${raw}" src="${cleanHref}" alt="${text}"${title ? ` title="${escape(title)}"` : ""}>`;
  }

  text(token: Tokens.Text | Tokens.Escape): string {
    return "tokens" in token && token.tokens
      ? this.parser.parseInline(token.tokens)
      : 'escaped' in token && token.escaped ? token.text : escape(token.text);
  }
}