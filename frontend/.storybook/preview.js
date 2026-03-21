// filepath: c:\Users\the10\OneDrive\Documents\GitHub\Consensus\frontend\.storybook\preview.js
// import React from "react"; // Commented out
import "../src/index.css";
import "../src/App.css";
import "katex/dist/katex.min.css"; // <-- ADD THIS LINE

// This is the theme provider decorator from your previous file
// const withThemeProvider = (Story, context) => { // Commented out
//   return <Story />;
// };

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light", // Let's default to light mode to address unexpected dark mode
      values: [
        { name: "light", value: "#f5f5f5" }, // Or your app's light background color
        { name: "dark", value: "#121212" }, // Or your app's dark background color
      ],
    },
  },
  // decorators: [withThemeProvider], // Commented out
};

export default preview;