import katex from "katex";

/**
 * Renders formatted content with LaTeX and Markdown support for Storybook
 * @param {string} content - The content to render
 * @returns {string} HTML representation of the rendered content
 */
export const renderFormattedContent = (content) => {
  if (!content || typeof content !== "string") {
    return "";
  }

  let processedInput = content;

  // First, handle the \boxed{\text{...}} pattern which appears in your examples
  processedInput = processedInput.replace(
    /\\boxed{\\text{(.*?)}}/g,
    (match, innerText) => {
      try {
        // Create the LaTeX expression for a boxed text
        const latexExp = `\\boxed{\\text{${innerText}}}`;
        return katex.renderToString(latexExp, {
          throwOnError: false,
          displayMode: true,
        });
      } catch (e) {
        console.error("KaTeX boxed text rendering error:", e);
        return `<div style="border: 1px solid #333; padding: 8px; display: inline-block; margin: 5px 0;">${innerText}</div>`;
      }
    }
  );

  // Handle general \boxed{...} without \text
  processedInput = processedInput.replace(
    /\\boxed{([^{}]+?)}/g,
    (match, innerContent) => {
      try {
        const latexExp = `\\boxed{${innerContent}}`;
        return katex.renderToString(latexExp, {
          throwOnError: false,
          displayMode: true,
        });
      } catch (e) {
        console.error("KaTeX boxed rendering error:", e);
        return `<div style="border: 1px solid #333; padding: 8px; display: inline-block; margin: 5px 0;">${innerContent}</div>`;
      }
    }
  );

  // Process block LaTeX ($$...$$)
  processedInput = processedInput.replace(
    /\$\$([\s\S]*?)\$\$/g,
    (match, latex) => {
      try {
        return katex.renderToString(latex.trim(), {
          throwOnError: false,
          displayMode: true,
        });
      } catch (e) {
        console.error("KaTeX block rendering error:", e);
        return `<span style="color: red;">LaTeX Error: ${e.message}</span>`;
      }
    }
  );

  // Process inline LaTeX ($...$)
  processedInput = processedInput.replace(/\$([^$]+?)\$/g, (match, latex) => {
    // Skip if it looks like currency
    if (/^\s*\d+(\.\d+)?\s*$/.test(latex.trim())) {
      return match;
    }

    try {
      return katex.renderToString(latex.trim(), {
        throwOnError: false,
        displayMode: false,
      });
    } catch (e) {
      console.error("KaTeX inline rendering error:", e);
      return `<span style="color: red;">LaTeX Error: ${e.message}</span>`;
    }
  });

  // Keep the existing markdown formatting
  processedInput = processedInput
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic text
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Headers
    .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
    .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
    .replace(/^### (.*?)$/gm, "<h3>$1</h3>")
    // Code blocks
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    // Inline code
    .replace(/`(.*?)`/g, "<code>$1</code>")
    // Line breaks
    .replace(/\n/g, "<br />");

  return processedInput;
};
