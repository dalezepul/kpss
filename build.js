// sorular/*.json + src.html -> index.html (tek dosya, çevrimdışı)
const fs = require("fs"), path = require("path");
const dir = path.join(__dirname, "sorular");
const DERSLER = ["turkce", "matematik", "tarih", "cografya", "vatandaslik", "guncel"];
const tum = [], hatalar = [];
for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".json")).sort()) {
  JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")).forEach((q, i) => {
    const ok = DERSLER.includes(q.d) && typeof q.q === "string" && Array.isArray(q.o) && q.o.length === 5 &&
      Number.isInteger(q.a) && q.a >= 0 && q.a < 5 && new Set(q.o).size === 5;
    if (!ok) return hatalar.push(`${f}#${i}`);
    // sayısal şıklar küçükten büyüğe (site bunları karıştırmaz)
    const sayi = q.o.map(x => /^-?\d+([.,]\d+)?$/.test(x.trim()) ? parseFloat(x.replace(",", ".")) : NaN);
    if (sayi.every(Number.isFinite)) {
      const dogru = q.o[q.a];
      q.o = q.o.map((x, j) => [x, sayi[j]]).sort((a, b) => a[1] - b[1]).map(x => x[0]);
      q.a = q.o.indexOf(dogru);
    }
    tum.push({d: q.d, k: q.k || "", q: q.q, o: q.o, a: q.a, c: q.c || "", ...(q.src ? {src: q.src} : {})});
  });
}
const tekrar = tum.length - new Set(tum.map(q => q.q)).size;
const json = JSON.stringify(tum).replace(/</g, "\\u003c");
const html = fs.readFileSync(path.join(__dirname, "src.html"), "utf8").replace("__SORULAR__", () => json);
fs.writeFileSync(path.join(__dirname, "index.html"), html);
const say = {}; tum.forEach(q => say[q.d] = (say[q.d] || 0) + 1);
console.log("toplam", tum.length, say, "tekrar", tekrar, hatalar.length ? "HATALI: " + hatalar.join(", ") : "hata yok");
