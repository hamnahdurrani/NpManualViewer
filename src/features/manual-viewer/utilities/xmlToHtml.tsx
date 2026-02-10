import "./xmlToHtml.css";

// ---------- Types ----------
export type ManualContext = {
  imageBaseURL?: string;
};

// ---------- Escaping helpers ----------
const escText = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escAttr = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const isAbsoluteUrl = (s: string) =>
  /^https?:\/\//i.test(s) || /^data:/i.test(s) || /^blob:/i.test(s);

const joinUrl = (base: string, path: string) => {
  if (!base) return path;
  if (!path) return base;
  const b = base.endsWith("/") ? base : base + "/";
  const p = path.startsWith("/") ? path.slice(1) : path;
  return b + p;
};

// ---------- Inline rendering ----------
function inlineChildrenToHtml(node: Node, ctx: ManualContext): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escText(node.textContent ?? "");
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const el = node as Element;
  const tag = el.tagName.toLowerCase();

  if (tag === "sentence") {
    return Array.from(el.childNodes)
      .map((n) => inlineChildrenToHtml(n, ctx))
      .join(" ");
  }

  if (tag === "b" || tag === "strong") {
    return `<strong class="manual-strong">${Array.from(el.childNodes)
      .map((n) => inlineChildrenToHtml(n, ctx))
      .join("")}</strong>`;
  }

  if (tag === "i" || tag === "em") {
    return `<em class="manual-em">${Array.from(el.childNodes)
      .map((n) => inlineChildrenToHtml(n, ctx))
      .join("")}</em>`;
  }

  if (tag === "u") {
    return `<span class="manual-underline">${Array.from(el.childNodes)
      .map((n) => inlineChildrenToHtml(n, ctx))
      .join("")}</span>`;
  }

  if (tag === "sup") {
    return `<sup>${Array.from(el.childNodes).map((n) => inlineChildrenToHtml(n, ctx)).join("")}</sup>`;
  }

  if (tag === "sub") {
    return `<sub>${Array.from(el.childNodes).map((n) => inlineChildrenToHtml(n, ctx)).join("")}</sub>`;
  }

  if (tag === "br") {
    return "<br class='manual-br' />";
  }

  // Link
  if (tag === "url") {
    const href = (el.textContent ?? "").trim();
    const safe = escAttr(href);
    const label = escText(href);
    return href ? `<a href="${safe}" target="_blank" rel="noreferrer">${label}</a>` : "";
  }
  if (tag === "e-mail") {
    const email = (el.textContent ?? "").trim();
    const safe = escAttr(email);
    return email ? `<a href="mailto:${safe}">${escText(email)}</a>` : "";
  }

  if (tag === "graphic") {
    return graphicToHtml(el, ctx);
  }

  return Array.from(el.childNodes)
    .map((n) => inlineChildrenToHtml(n, ctx))
    .join("");
}

// ---------- Block rendering ----------
function paragraphToHtml(el: Element, ctx: ManualContext): string {
  const inner = Array.from(el.childNodes)
    .map((n) => inlineChildrenToHtml(n, ctx))
    .join(" ");
  const cleaned = inner.trim();
  if (!cleaned) return "";
  return `<p class="manual-paragraph">${cleaned}</p>`;
}

function listToHtml(el: Element, ctx: ManualContext): string {
  const tag = el.tagName.toLowerCase();

  if (tag === "unordered-list" || tag === "ordered-list") {
    const itemsEl = el.querySelector(":scope > items");
    const itemEls = itemsEl ? Array.from(itemsEl.querySelectorAll(":scope > item")) : [];
    if (!itemEls.length) return "";

    const lis = itemEls
      .map((item) => {
        const html = Array.from(item.children).map((c) => elementToHtml(c, ctx)).join(" ").trim();
        return `<li class="manual-list-item">${html}</li>`;
      })
      .join("");

    const listClass = tag === "unordered-list" ? "manual-unordered-list" : "manual-ordered-list";
    const listTag = tag === "unordered-list" ? "ul" : "ol";
    return `<${listTag} class="manual-list ${listClass}">${lis}</${listTag}>`;
  }

  const items = Array.from(el.children).filter((c) => c.tagName.toLowerCase() === "item");
  if (!items.length) {
    return `<div class="manual-list">${Array.from(el.childNodes)
      .map((n) => inlineChildrenToHtml(n, ctx))
      .join(" ")}</div>`;
  }

  const lis = items
    .map((it) => {
      const html = Array.from(it.childNodes).map((n) => inlineChildrenToHtml(n, ctx)).join(" ");
      return `<li>${html}</li>`;
    })
    .join("");

  return `<ul class="manual-ul">${lis}</ul>`;
}

function tableToHtml(el: Element, ctx: ManualContext): string {
  const headerEl = Array.from(el.children).find((c) => c.tagName.toLowerCase() === "header") as Element | undefined;
  const rowEls = Array.from(el.children).filter((c) => c.tagName.toLowerCase() === "row") as Element[];

  const headerCells = headerEl
    ? Array.from(headerEl.getElementsByTagName("cell")).map((cell) => {
        const cellHtml = Array.from(cell.childNodes).map((n) => inlineChildrenToHtml(n, ctx)).join(" ");
        return `<th class="manual-table-header">${cellHtml}</th>`;
      })
    : [];

  const bodyRows = rowEls
    .map((row) => {
      const cells = Array.from(row.getElementsByTagName("cell")).map((cell) => {
        const cellHtml = Array.from(cell.childNodes).map((n) => inlineChildrenToHtml(n, ctx)).join(" ");
        const colspan = cell.getAttribute("colspan") ?? "1";
        const rowspan = cell.getAttribute("rowspan") ?? "1";
        return `<td class="manual-table-cell" colspan="${colspan}" rowspan="${rowspan}">${cellHtml}</td>`;
      });
      return `<tr class="manual-table-row">${cells.join("")}</tr>`;
    })
    .join("");

  const thead = headerCells.length ? `<thead><tr class="manual-table-row">${headerCells.join("")}</tr></thead>` : "";
  const tbody = `<tbody>${bodyRows}</tbody>`;

  return `<table class="manual-table">${thead}${tbody}</table>`;
}

function graphicToHtml(el: Element, ctx: ManualContext): string {
  // Full URL = manual.imageBaseURL + graphic.filename
  const filenameAttr = (el.getAttribute("filename") ?? "").trim();
  const filenameChild = (el.getElementsByTagName("filename")[0]?.textContent ?? "").trim();
  const filename = filenameAttr || filenameChild;

  if (!filename) return "";

  const base = ctx.imageBaseURL ?? "";
  const src = isAbsoluteUrl(filename) ? filename : joinUrl(base, filename);

  const alt = (el.getAttribute("alt") ?? "").trim();
  const altSafe = escAttr(alt || filename);

  return `<img class="manual-image" src="${escAttr(src)}" alt="${altSafe}" />`;
}

function addressToHtml(el: Element, ctx: ManualContext): string {
  const lines = Array.from(el.children)
    .map((c) => {
      const k = c.tagName.toLowerCase();

      if (k === "e-mail") {
        const email = (c.textContent ?? "").trim();
        return email
          ? `<div class="manual-address-line"><a href="mailto:${escAttr(email)}">${escText(email)}</a></div>`
          : "";
      }

      const v = (c.textContent ?? "").trim();
      if (!v) return "";
      return `<div class="manual-address-line"><span class="manual-address-key">${escText(k)}:</span> ${escText(
        v
      )}</div>`;
    })
    .filter(Boolean)
    .join("");

  return lines ? `<div class="manual-address">${lines}</div>` : "";
}

// Helper function to convert block-level elements (used in list items)
function elementToHtml(el: Element, ctx: ManualContext): string {
  const tag = el.tagName.toLowerCase();
  if (
    tag === "title" ||
    tag === "sub-section-title" ||
    tag === "sub-group-title"
  ) {
    return "";
  }

  if (tag === "paragraph") return paragraphToHtml(el, ctx);
  if (tag === "table") return tableToHtml(el, ctx);
  if (tag === "list" || tag === "unordered-list" || tag === "ordered-list") return listToHtml(el, ctx);
  if (tag === "graphic") return graphicToHtml(el, ctx);
  if (tag === "address") return addressToHtml(el, ctx);

  if (tag === "caution") {
    const inner = Array.from(el.childNodes).map((n) => inlineChildrenToHtml(n, ctx)).join(" ").trim();
    return inner ? `<div class="caution">&#9888; CAUTION: ${inner}</div>` : "";
  }
  if (tag === "warning") {
    const inner = Array.from(el.childNodes).map((n) => inlineChildrenToHtml(n, ctx)).join(" ").trim();
    return inner ? `<div class="warning">&#9888; WARNING: ${inner}</div>` : "";
  }
  if (tag === "danger") {
    const inner = Array.from(el.childNodes).map((n) => inlineChildrenToHtml(n, ctx)).join(" ").trim();
    return inner ? `<div class="warning">&#9888; DANGER: ${inner}</div>` : "";
  }
  if (tag === "note") {
    const inner = Array.from(el.childNodes).map((n) => inlineChildrenToHtml(n, ctx)).join(" ").trim();
    return inner ? `<div class="note">&#128161; NOTE: ${inner}</div>` : "";
  }

  if (tag === "question") {
    const inner = Array.from(el.childNodes).map((n) => inlineChildrenToHtml(n, ctx)).join(" ").trim();
    return inner ? `<p><b>${inner}</b></p>` : "";
  }

  const inner = Array.from(el.childNodes).map((n) => inlineChildrenToHtml(n, ctx)).join(" ").trim();
  return inner ? `<div class="manual-block">${inner}</div>` : "";
}

export function xmlToHtml(element: Element, imageBaseURL: string = ""): string {
  const ctx: ManualContext = { imageBaseURL };
  const children = Array.from(element.children);

  const blocks: string[] = [];

  for (const child of children) {
    const t = child.tagName.toLowerCase();

    // ---- TITLE SUPPRESSION (top-level) ----
    if (
      t === "title" ||
      t === "section-title" ||
      t === "chapter-title" ||
      t === "sub-section-title" ||
      t === "sub-group-title"
    ) {
      continue;
    }

    if (t === "paragraph") blocks.push(paragraphToHtml(child, ctx));
    else if (t === "table") blocks.push(tableToHtml(child, ctx));
    else if (t === "list" || t === "unordered-list" || t === "ordered-list") blocks.push(listToHtml(child, ctx));
    else if (t === "graphic") blocks.push(graphicToHtml(child, ctx));
    else if (t === "address") blocks.push(addressToHtml(child, ctx));
    else if (t === "caution") {
      const inner = Array.from(child.childNodes).map((n) => inlineChildrenToHtml(n, ctx)).join(" ").trim();
      if (inner) blocks.push(`<div class="caution">&#9888; CAUTION: ${inner}</div>`);
    } else if (t === "warning") {
      const inner = Array.from(child.childNodes).map((n) => inlineChildrenToHtml(n, ctx)).join(" ").trim();
      if (inner) blocks.push(`<div class="warning">&#9888; WARNING: ${inner}</div>`);
    } else if (t === "danger") {
      const inner = Array.from(child.childNodes).map((n) => inlineChildrenToHtml(n, ctx)).join(" ").trim();
      if (inner) blocks.push(`<div class="warning">&#9888; DANGER: ${inner}</div>`);
    } else if (t === "note") {
      const inner = Array.from(child.childNodes).map((n) => inlineChildrenToHtml(n, ctx)).join(" ").trim();
      if (inner) blocks.push(`<div class="note">&#128161; NOTE: ${inner}</div>`);
    } else if (t === "question") {
      const inner = Array.from(child.childNodes).map((n) => inlineChildrenToHtml(n, ctx)).join(" ").trim();
      if (inner) blocks.push(`<p><b>${inner}</b></p>`);
    } else {
      const inner = Array.from(child.childNodes).map((n) => inlineChildrenToHtml(n, ctx)).join(" ").trim();
      if (inner) blocks.push(`<div class="manual-block">${inner}</div>`);
    }
  }

  const html = blocks.filter(Boolean).join("");
  return `<div class="manual-content">${html}</div>`;
}
