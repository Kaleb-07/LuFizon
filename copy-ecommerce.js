import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = __dirname;
const destDir = "C:\\Users\\hp\\Documents\\Antigravity\\LuFi_Shop\\Frontend";

const itemsToCopy = [
  // Core e-commerce structures
  "src/components/ecommerce",
  "src/components/ui",
  "src/components/LanguageSwitcher.jsx",
  "src/pages/ecommerce",
  "src/lib",
  "src/hooks",
  "src/utils",
  "src/css/additional-styles",
  "src/i18n.js",
  "src/locales",
  "src/charts",

  // E-commerce specific contexts
  "src/contexts/AuthContext.tsx",
  "src/contexts/CartContext.tsx",
  "src/contexts/LanguageContext.tsx",

  // Base configuration and global styles so the project remains valid
  "package.json",
  "tailwind.config.js",
  "postcss.config.js",
  "vite.config.js",
  "index.html",
  "src/css/style.css",
  "src/charts/ChartjsConfig.jsx" // In case imported globally
];

// Ensure destination exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

console.log("Starting to copy eCommerce files to LuFi_Shop...\n");

itemsToCopy.forEach(item => {
  const srcPath = path.join(sourceDir, item);
  const destPath = path.join(destDir, item);

  if (fs.existsSync(srcPath)) {
    console.log(`Copying ${item}...`);
    fs.cpSync(srcPath, destPath, { recursive: true });
  } else {
    console.log(`[Skipped] ${item} - Not found`);
  }
});

console.log("\n✅ Success! All eCommerce files have been copied to the new folder.");
console.log("Path: " + destDir);

// Auto-fix the Vite port to 5174 so it doesn't conflict with the original app on 5173
const viteConfigPath = path.join(destDir, "vite.config.js");
if (fs.existsSync(viteConfigPath)) {
  let viteConfig = fs.readFileSync(viteConfigPath, "utf8");
  viteConfig = viteConfig.replace(/port:\s*5173/, "port: 5174");
  fs.writeFileSync(viteConfigPath, viteConfig);
  console.log("✅ vite.config.js patched: port set to 5174");
}

