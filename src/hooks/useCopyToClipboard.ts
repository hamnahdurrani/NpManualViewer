import { useCallback, useState } from "react";
import DOMPurify from "dompurify";

type CopiedValue = string | null;
type CopyFn = (html: string) => Promise<boolean>;

/* ---------- helpers ---------- */
function htmlToText(html: string) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").trim();
}

function normalizeForClipboard(rawHtml: string) {
  const safe = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ["table", "thead", "tbody", "tfoot", "tr", "th", "td", "img"],
    ADD_ATTR: ["colspan", "rowspan", "src", "alt", "title", "width", "height", "style"],
  });

  const doc = new DOMParser().parseFromString(safe, "text/html");
  const body = doc.body;

  // Tables
  body.querySelectorAll("table").forEach((table) => {
    table.setAttribute("style", "border-collapse:collapse;width:100%;");

    if (!table.querySelector("tbody")) {
      const tbody = doc.createElement("tbody");
      Array.from(table.querySelectorAll(":scope > tr")).forEach((tr) => tbody.appendChild(tr));
      table.appendChild(tbody);
    }
  });

  body.querySelectorAll("th, td").forEach((cell) => {
    cell.setAttribute("style", "border:1px solid #ddd;padding:8px;vertical-align:top;");
  });

  // Images
  body.querySelectorAll("img").forEach((img) => {
    const desc = img.getAttribute("desc");
    if (!img.getAttribute("alt") && desc) {
      img.setAttribute("alt", desc);
    }

    const h = img.getAttribute("height");
    if (h?.endsWith("px")) img.setAttribute("height", h.replace("px", ""));

    const style = img.getAttribute("style") ?? "";
    if (!style.includes("display")) {
      img.setAttribute("style", `${style};display:block;`);
    }
  });

  // Flatten <p> inside <td>
  body.querySelectorAll("td > p:only-child").forEach((p) => {
    p.parentElement!.textContent = p.textContent ?? "";
  });

  return `
    <div data-chat-copy="true" style="font-family:system-ui,-apple-system;font-size:14px;line-height:1.6;">
      ${body.innerHTML.trim()}
    </div>
  `.trim();
}

/* ---------- hook ---------- */

export function useCopyToClipboard(): [CopiedValue, CopyFn] {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);

  const copy: CopyFn = useCallback(async (html) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return false;
    }

    try {
      const normalizedHtml = normalizeForClipboard(html);
      const plainText = htmlToText(normalizedHtml);

      if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([normalizedHtml], { type: "text/html" }),
            "text/plain": new Blob([plainText], { type: "text/plain" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }

      setCopiedText(plainText);
      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      setCopiedText(null);
      return false;
    }
  }, []);

  return [copiedText, copy];
}
