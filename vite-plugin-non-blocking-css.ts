import type { Plugin } from 'vite';

export function nonBlockingCss(): Plugin {
  return {
    name: 'non-blocking-css',
    enforce: 'post',
    transformIndexHtml(html) {
      // Add preload for CSS files to make them non-render-blocking
      return html.replace(
        /<link\s+rel="stylesheet"\s+href="([^"]+\.css)"\s*\/?>/gi,
        (match, href) => {
          // Add both preload and the actual stylesheet with media print trick
          return `<link rel="preload" as="style" href="${href}" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="${href}"></noscript>`;
        }
      );
    }
  };
}
