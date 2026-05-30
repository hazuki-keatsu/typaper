// @ts-nocheck
import { JSDOM } from "jsdom";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
let mermaid: any = null;
let initialized = false;

function setupDOM() {
  if (initialized) return;
  initialized = true;

  class PolyfilledCSSStyleSheet {
    _rules = [];
    get cssRules() {
      return this._rules;
    }
    insertRule(rule, index = 0) {
      this._rules.splice(index, 0, { cssText: rule });
      return index;
    }
  }
  (globalThis as any).CSSStyleSheet = PolyfilledCSSStyleSheet;

  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "http://localhost",
  });
  (globalThis as any).window = dom.window;
  (globalThis as any).DOMParser = dom.window.DOMParser;
  (globalThis as any).document = dom.window.document;

  function estimateTextSize(text) {
    let cjk = 0,
      ascii = 0;
    for (const c of text) {
      if (/[一-鿿　-〿＀-￯]/.test(c)) cjk++;
      else ascii++;
    }
    // Cap width to prevent CSS/long text from blowing up layout
    const width = Math.min(cjk * 16 + ascii * 8 + 12, 300);
    return { x: 0, y: -16, width: Math.max(width, 12), height: 20 };
  }
  (dom.window.SVGElement as any).prototype.getBBox = function () {
    const text = this.textContent || "";
    // Label text elements
    if (text && text.length > 0 && this.tagName !== "style") {
      if (text.startsWith("#") || text.startsWith(".") || text.includes("{")) {
        return { x: 0, y: -18, width: 1, height: 18 };
      }
      return estimateTextSize(text);
    }
    // Circle: use cx/cy/r attributes
    if (this.tagName === "circle") {
      const cx = parseFloat(this.getAttribute("cx") || "0");
      const cy = parseFloat(this.getAttribute("cy") || "0");
      const r = parseFloat(this.getAttribute("r") || "0");
      return { x: cx - r, y: cy - r, width: r * 2, height: r * 2 };
    }
    // Return {0,0,0,0} for other geometric elements
    return { x: 0, y: 0, width: 0, height: 0 };
  };

  // getBoundingClientRect: used by mermaid with htmlLabels for label sizing
  const origGetBoundingClientRect =
    dom.window.Element.prototype.getBoundingClientRect;
  dom.window.Element.prototype.getBoundingClientRect = function () {
    const text = this.textContent || "";
    if (
      text &&
      text.length > 0 &&
      !text.startsWith("#") &&
      !text.includes("{")
    ) {
      const size = estimateTextSize(text);
      return new dom.window.DOMRect(size.x, size.y, size.width, size.height);
    }
    return origGetBoundingClientRect.call(this);
  };
}

function getMermaid() {
  if (!mermaid) {
    setupDOM();
    mermaid = require("mermaid").default;
    mermaid.initialize({
      startOnLoad: false,
      htmlLabels: true,
      securityLevel: "loose",
      fontFamily:
        '"Noto Serif CJK SC", "Source Han Serif SC", "SimSun", "STSong", Georgia, "Times New Roman", serif',
    });
  }
  return mermaid;
}

function fixViewBox(svg: string): string {
  // Compute bounding box from actual node positions + circle radii
  // class="node " (with space) — individual nodes, NOT "nodes" container
  const nodes = svg.match(/<g class="node\s[^"]*"[^>]*>/g) || [];
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const nodeStr of nodes) {
    const tx = nodeStr.match(/translate\(([^,]+),\s*([^)]+)\)/);
    if (!tx) continue;
    const nx = parseFloat(tx[1]);
    const ny = parseFloat(tx[2]);

    const cr = nodeStr.match(/r\s*=\s*"([^"]+)"/);
    const rr = cr ? parseFloat(cr[1]) : 20;

    minX = Math.min(minX, nx - rr);
    minY = Math.min(minY, ny - rr);
    maxX = Math.max(maxX, nx + rr);
    maxY = Math.max(maxY, ny + rr);
  }

  // Include edge labels (they sit outside node bounds)
  const edgeLabels = svg.match(/<g class="edgeLabel"[^>]*>/g) || [];
  for (const el of edgeLabels) {
    const tx = el.match(/translate\(([^,]+),\s*([^)]+)\)/);
    if (!tx) continue;
    const ex = parseFloat(tx[1]);
    const ey = parseFloat(tx[2]);
    minX = Math.min(minX, ex - 30);
    minY = Math.min(minY, ey - 10);
    maxX = Math.max(maxX, ex + 30);
    maxY = Math.max(maxY, ey + 10);
  }

  if (!isFinite(minX)) return svg;

  const pad = 48;
  const vbWidth = maxX - minX + pad * 2;
  const vb = `${minX - pad} ${minY - pad} ${vbWidth} ${maxY - minY + pad * 2}`;
  return svg
    .replace(/viewBox="[^"]*"/, `viewBox="${vb}"`)
    .replace(/width="[^"]*"/, `width="${vbWidth}px"`)
    .replace(/style="max-width:\s*[^"]*"/, 'style="max-width:100%"')
    .replace(
      /font-family:[^;]+/g,
      'font-family:"Noto Serif CJK SC","Source Han Serif SC","SimSun","STSong",Georgia,"Times New Roman",serif'
    );
}

export default function remarkMermaid() {
  return async (tree: any) => {
    const mermaidNodes: { index: number; code: string }[] = [];

    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];
      if (node.type === "code" && node.lang === "mermaid" && node.value) {
        mermaidNodes.push({ index: i, code: node.value.trim() });
      }
    }

    if (mermaidNodes.length === 0) return;

    const m = getMermaid();
    const results: Record<number, string> = {};

    for (const { index, code } of mermaidNodes) {
      const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
      const { svg: light } = await m.render(id + "-light", code);
      m.initialize({
        startOnLoad: false,
        theme: "dark",
        fontFamily:
          '"Noto Serif CJK SC", "Source Han Serif SC", "SimSun", "STSong", Georgia, "Times New Roman", serif',
        htmlLabels: true,
        securityLevel: "loose",
      });
      const { svg: dark } = await m.render(id + "-dark", code);
      m.initialize({
        startOnLoad: false,
        theme: "default",
        fontFamily:
          '"Noto Serif CJK SC", "Source Han Serif SC", "SimSun", "STSong", Georgia, "Times New Roman", serif',
        htmlLabels: true,
        securityLevel: "loose",
      });

      const fixedLight = fixViewBox(light);
      const fixedDark = fixViewBox(dark);
      results[index] =
        `<div class="mermaid-diagram">` +
        `<div class="mermaid-light">${fixedLight}</div>` +
        `<div class="mermaid-dark">${fixedDark}</div>` +
        `</div>`;
    }

    for (let i = mermaidNodes.length - 1; i >= 0; i--) {
      const { index } = mermaidNodes[i];
      tree.children[index] = { type: "html", value: results[index] };
    }
  };
}
