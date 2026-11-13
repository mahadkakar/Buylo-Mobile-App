// Generates the public Privacy Policy / Terms pages (for GitHub Pages) from the
// same JSON the in-app screens render, so the two can't drift apart.
// Usage: node scripts/build-legal-site.js [outDir]   (default: docs/)
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const config = JSON.parse(fs.readFileSync(path.join(root, "src/legal/config.json"), "utf8"));
if (process.env.LEGAL_SUPPORT_EMAIL) config.supportEmail = process.env.LEGAL_SUPPORT_EMAIL;

if (!config.supportEmail) {
  console.error("Set supportEmail in src/legal/config.json before publishing (or run with LEGAL_SUPPORT_EMAIL=you@example.com).");
  process.exit(1);
}

const outDir = path.resolve(process.argv[2] || path.join(root, "docs"));
const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fill = (s) => escapeHtml(s.replace(/\{\{(\w+)\}\}/g, (_, k) => String(config[k] ?? "")));
const linkEmail = (html) => html.split(escapeHtml(config.supportEmail)).join(`<a href="mailto:${escapeHtml(config.supportEmail)}">${escapeHtml(config.supportEmail)}</a>`);

const page = (title, body) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} - ${escapeHtml(config.appName)}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #1A1B26; background: #F7F7FB; margin: 0; line-height: 1.6; }
  main { max-width: 720px; margin: 0 auto; padding: 32px 20px 64px; }
  h1 { font-size: 28px; margin: 0 0 8px; }
  h2 { font-size: 18px; margin: 32px 0 4px; }
  p, li { color: #3B3D4E; font-size: 15.5px; }
  a { color: #4F46E5; }
  nav a { margin-right: 16px; }
</style>
</head>
<body><main>
<nav><a href="index.html">${escapeHtml(config.appName)}</a><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms of Service</a></nav>
${body}
</main></body></html>
`;

function render(doc) {
  const sections = doc.sections
    .map((s) => {
      const paras = (s.paragraphs || []).map((p) => `<p>${linkEmail(fill(p))}</p>`).join("\n");
      const bullets = s.bullets ? `<ul>\n${s.bullets.map((b) => `<li>${linkEmail(fill(b))}</li>`).join("\n")}\n</ul>` : "";
      return `<h2>${fill(s.heading)}</h2>\n${paras}\n${bullets}`;
    })
    .join("\n");
  return page(doc.title, `<h1>${escapeHtml(doc.title)}</h1>\n<p>${linkEmail(fill(doc.intro))}</p>\n${sections}`);
}

const privacy = JSON.parse(fs.readFileSync(path.join(root, "src/legal/privacy.json"), "utf8"));
const terms = JSON.parse(fs.readFileSync(path.join(root, "src/legal/terms.json"), "utf8"));
const index = page(
  config.appName,
  `<h1>${escapeHtml(config.appName)}</h1>\n<p>Compare grocery prices at stores near you.</p>\n<p><a href="privacy.html">Privacy Policy</a> &middot; <a href="terms.html">Terms of Service</a></p>\n<p>Contact: ${linkEmail(escapeHtml(config.supportEmail))}</p>`
);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "privacy.html"), render(privacy));
fs.writeFileSync(path.join(outDir, "terms.html"), render(terms));
fs.writeFileSync(path.join(outDir, "index.html"), index);
console.log(`Wrote privacy.html, terms.html, index.html to ${outDir}`);
