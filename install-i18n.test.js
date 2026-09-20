/* Node tests: install-guide i18n coverage, payout-link verification markers, PWA assets.
   Run: node install-i18n.test.js
   Convention: window-free; loads i18n.js by injecting a fake window. */
"use strict";
const fs = require("fs");
const path = require("path");
const here = __dirname;

let pass = 0, fail = 0;
function ok(cond, name) { if (cond) { pass++; } else { fail++; console.log("FAIL:", name); } }

/* ---- load i18n.js ---- */
const src = fs.readFileSync(path.join(here, "i18n.js"), "utf8");
const window = {};
new Function("window", src)(window);
const I18N = window.NN_I18N;
ok(I18N && typeof I18N === "object", "NN_I18N loads");

const locales = Object.keys(I18N);
ok(locales.length === 41, `41 locales present (got ${locales.length})`);

const KEYS = ["title", "android", "ios1", "ios2", "ios3", "note"];
// Never claim native store availability. The note may honestly say "no
// app-store download needed" — that is a negation, not an availability claim.
// Only POSITIVE claims ("available on the App Store", "get it on Google
// Play") are failures.
const NO_GAMBLE = [/gambl/i, /\bcash\b/i, /\bmoney\b/i, /wagering/i];
const STORE_CLAIM = /(available on|get (it|this)|download (it|this)|find (it|this)).*(app.?store|google.?play)/i;

for (const loc of locales) {
  const inst = I18N[loc] && I18N[loc].install;
  ok(inst && typeof inst === "object", `${loc}: install block exists`);
  if (!inst) continue;
  for (const k of KEYS) {
    ok(typeof inst[k] === "string" && inst[k].trim().length > 0, `${loc}: install.${k} non-empty`);
    if (typeof inst[k] === "string") {
      for (const re of NO_GAMBLE) {
        ok(!re.test(inst[k]), `${loc}: install.${k} carries no gambling claims`);
      }
      ok(!STORE_CLAIM.test(inst[k]), `${loc}: install.${k} claims no native store availability`);
    }
  }
}

/* ---- payout links: verified entries, no invented Tidal ---- */
const cfgSrc = fs.readFileSync(path.join(here, "config.js"), "utf8");
ok(cfgSrc.includes("https://www.youtube.com/watch?v=3L5eUDui-00"), "YouTube payout link present (verified 2026-09-20)");
ok(/tidal/i.test(cfgSrc) === false, "no Tidal entry without a verified direct URL (never guess)");
const platforms = ["Spotify", "Apple Music", "Amazon Music", "Deezer", "YouTube", "All platforms"];
for (const p of platforms) {
  ok(cfgSrc.includes(`"${p}"`) || cfgSrc.includes(`platform: "${p}"`), `jackpotLinks includes ${p}`);
}

/* ---- manifest icon coverage ---- */
const man = JSON.parse(fs.readFileSync(path.join(here, "manifest.webmanifest"), "utf8"));
const sizes = man.icons.map(i => i.sizes).sort();
for (const s of ["180x180", "192x192", "512x512"]) ok(sizes.includes(s), `manifest lists ${s} icon`);
ok(man.icons.some(i => i.purpose === "maskable"), "manifest lists a maskable icon");
ok(man.display === "standalone" && man.scope === "." && man.start_url === ".", "manifest installability fields sane");

/* ---- icon files exist ---- */
for (const f of ["icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png"]) {
  ok(fs.existsSync(path.join(here, f)), `${f} exists`);
}

/* ---- VERSION / CHANGELOG in sync with build ---- */
const ver = JSON.parse(fs.readFileSync(path.join(here, "VERSION.json"), "utf8"));
ok(/^nn777-v\d+$/.test(ver.build), `VERSION.json build tag shape (${ver.build})`);
const idx = fs.readFileSync(path.join(here, "index.html"), "utf8");
ok(idx.includes(`window.NN_BUILD = "${ver.build}"`), `index.html NN_BUILD matches VERSION.json (${ver.build})`);
const sw = fs.readFileSync(path.join(here, "sw.js"), "utf8");
ok(sw.includes(`"${ver.build}"`), `sw.js cache tag matches VERSION.json (${ver.build})`);
const cl = fs.readFileSync(path.join(here, "CHANGELOG.md"), "utf8");
ok(cl.includes(ver.build), "CHANGELOG.md mentions current build");
ok(idx.includes('rel="apple-touch-icon" href="icons/icon-180.png"'), "apple-touch-icon points at the 180px icon");

console.log(`install-i18n: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
