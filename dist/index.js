"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  StickyDiagnosticOverlay: () => StickyDiagnosticOverlay,
  analyzeStickyElement: () => analyzeStickyElement
});
module.exports = __toCommonJS(index_exports);

// src/core/analyze-sticky-element.ts
function analyzeStickyElement(element) {
  if (!element) return { isSticky: false, issues: ["Element not found in the DOM."] };
  const issues = [];
  const styles = window.getComputedStyle(element);
  if (styles.position !== "sticky") issues.push(`Element is missing 'position: sticky'. Current position is '${styles.position}'.`);
  if (styles.display === "inline") issues.push(`Element has 'display: inline'. Sticky positioning requires block, inline-block, flex, or grid.`);
  const hasInset = ["top", "bottom", "left", "right"].some((dir) => styles.getPropertyValue(dir) !== "auto");
  if (!hasInset) issues.push("Missing inset property. You must define top, bottom, left, or right (e.g., top: 0px).");
  let parent = element.parentElement;
  while (parent) {
    const parentStyles = window.getComputedStyle(parent);
    if ([parentStyles.overflow, parentStyles.overflowY, parentStyles.overflowX].some((v) => v === "hidden" || v === "clip")) {
      const className = parent.className ? `.${String(parent.className).split(" ").join(".")}` : "";
      issues.push(`Ancestor <${parent.tagName.toLowerCase()}${className}> has overflow: hidden|clip. This usually breaks sticky positioning.`);
      break;
    }
    if (parentStyles.transform !== "none" || parentStyles.perspective !== "none" || parentStyles.filter !== "none") {
      issues.push(`Ancestor <${parent.tagName.toLowerCase()}> creates a containing block (transform/filter/perspective), breaking viewport-relative sticky behavior.`);
      break;
    }
    parent = parent.parentElement;
  }
  const directParent = element.parentElement;
  if (directParent) {
    const parentStyles = window.getComputedStyle(directParent);
    const parentRect = directParent.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const height = parentRect.height - (parseFloat(parentStyles.paddingTop) || 0) - (parseFloat(parentStyles.paddingBottom) || 0);
    const width = parentRect.width - (parseFloat(parentStyles.paddingLeft) || 0) - (parseFloat(parentStyles.paddingRight) || 0);
    const table = ["th", "td", "tr", "thead"].includes(element.tagName.toLowerCase());
    if (!table && styles.display !== "inline") {
      if (Math.round(height) <= Math.round(elementRect.height) && styles.top !== "auto") issues.push(`Parent container has no vertical scroll space. Available space (~${Math.round(height)}px) <= Element height (~${Math.round(elementRect.height)}px).`);
      if (Math.round(width) <= Math.round(elementRect.width) && styles.left !== "auto") issues.push(`Parent container has no horizontal scroll space. Available space (~${Math.round(width)}px) <= Element width (~${Math.round(elementRect.width)}px).`);
    }
    if (parentStyles.display.includes("flex") || parentStyles.display.includes("grid")) {
      const stretch = (styles.alignSelf === "auto" || styles.alignSelf === "stretch" || styles.alignSelf === "normal") && (parentStyles.alignItems === "normal" || parentStyles.alignItems === "stretch");
      if (stretch && parentStyles.flexDirection.includes("row") && (styles.top !== "auto" || styles.bottom !== "auto")) issues.push(`Element is stretching vertically to fill its Flex/Grid row, leaving no vertical room to scroll. Add 'align-self: flex-start'.`);
      if (stretch && parentStyles.flexDirection.includes("column") && (styles.left !== "auto" || styles.right !== "auto")) issues.push(`Element is stretching horizontally to fill its Flex/Grid column, leaving no horizontal room to scroll. Add 'align-self: flex-start'.`);
    }
  }
  return { isSticky: issues.length === 0, issues };
}

// src/react/sticky-diagnostic-overlay.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
function StickyDiagnosticOverlay({ target, title = "Sticky diagnosis", className = "", onDiagnosis }) {
  const [result, setResult] = (0, import_react.useState)(null);
  const resolve = (0, import_react.useCallback)(() => {
    const element = target && typeof target === "object" && "current" in target ? target.current : target;
    const next = analyzeStickyElement(element);
    setResult(next);
    onDiagnosis?.(next);
  }, [target, onDiagnosis]);
  (0, import_react.useEffect)(() => {
    resolve();
  }, [resolve]);
  if (!result) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { role: "status", "aria-live": "polite", className, children: "Analyzing sticky element\u2026" });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { "aria-label": title, className: `rounded-xl border bg-card p-4 text-card-foreground shadow-lg ${className}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground", children: "Live check" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "font-semibold", children: title })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `rounded-full px-2.5 py-1 text-xs font-semibold ${result.isSticky ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-destructive/15 text-destructive"}`, children: result.isSticky ? "PASS" : "FAIL" })
    ] }),
    result.isSticky ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mt-4 text-sm text-muted-foreground", children: "No sticky issues detected." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "mt-4 flex flex-col gap-2 text-sm text-destructive", children: result.issues.map((issue) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: "flex gap-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": "true", children: "\u2022" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: issue })
    ] }, issue)) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: resolve, className: "mt-4 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted", children: "Re-run analysis" })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StickyDiagnosticOverlay,
  analyzeStickyElement
});
//# sourceMappingURL=index.js.map