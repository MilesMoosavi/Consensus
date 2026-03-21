import { marked } from "marked";
import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * Renders content with Markdown and LaTeX formatting
 * @param {string} content - The text content to be formatted
 * @returns {string} HTML-formatted content
 */
export const renderFormattedContent = (content) => {
  if (typeof content !== "string") {
    return ""; // Or some fallback for non-string content
  }
  let processedInput = content;

  // Step 1: Render LaTeX from the raw input
  // Handle block formulas first
  processedInput = processedInput.replace(/\$\$(.*?)\$\$/gs, (match, p1) => {
    try {
      return `<div style='text-align: center;'>${katex.renderToString(
        p1.trim(),
        { throwOnError: false, displayMode: true, trust: true }
      )}</div>`;
    } catch (e) {
      return `<div style='color: red;'>Error rendering block formula: ${match} (${e.message})</div>`;
    }
  });

  // Handle inline formulas
  processedInput = processedInput.replace(/\$(.*?)\$/g, (match, p1) => {
    if (match.startsWith("$$") || match.endsWith("$$")) {
      return match;
    }
    try {
      return katex.renderToString(p1.trim(), {
        throwOnError: false,
        trust: true,
      });
    } catch (e) {
      return `<span style='color: red;'>Error rendering inline formula: ${match} (${e.message})</span>`;
    }
  });

  // Step 2: Render Markdown from the processed input (which now has HTML for LaTeX)
  // Make sure to sanitize if the content can come from untrusted sources.
  // For this internal tool, we might skip heavy sanitization if performance is key and content is trusted.
  const finalHtml = marked.parse(processedInput);
  return finalHtml;
};
