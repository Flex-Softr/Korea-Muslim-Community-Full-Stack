import fs from "fs";
import { PDFParse } from "pdf-parse";

function pageText(result, i) {
  return (result.pages[i]?.text || "")
    .replace(/-- \d+ of 51 --/g, "")
    .replace(/\u0000/g, "")
    .trim();
}

function softJoin(lines) {
  const paras = [];
  let buf = "";
  for (const line of lines) {
    const l = line.trim();
    if (!l) continue;
    if (!buf) {
      buf = l;
      continue;
    }
    // join line-broken words
    if (/[-–]$/.test(buf)) {
      buf = buf.replace(/[-–]$/, "") + l;
    } else if (/^[a-z(]/.test(l) || /[,;:)]$/.test(buf) || buf.endsWith("and") || buf.endsWith("the") || buf.endsWith("of") || buf.endsWith("to") || buf.endsWith("a") || buf.endsWith("in") || buf.endsWith("for") || buf.endsWith("or") || buf.endsWith("by") || buf.endsWith("with")) {
      buf += " " + l;
    } else if (/^(Article|Chapter|Appendix|Preamble|Name|Explanation|Fundamental|Objectives|Means|Membership|Organizational|Central|Branch|Women|Duties|Qualifications|Procedure|Oath|Baitul|Removal|Interpretation|Amendment|A\.|B\.|I |Whereas|Therefore)/i.test(l)) {
      paras.push(buf);
      buf = l;
    } else {
      buf += " " + l;
    }
  }
  if (buf) paras.push(buf);
  return paras;
}

function splitSections(joinedText) {
  // Major TOC for sidebar matching the design
  const sectionDefs = [
    { id: "preamble", titleEn: "Preamble", titleBn: "ভূমিকা", titleKo: "전문", pattern: /^Preamble\b/i },
    { id: "chapter-1", titleEn: "Chapter One", titleBn: "প্রথম অধ্যায়", titleKo: "제1장", pattern: /^Chapter One\b/i },
    { id: "chapter-2", titleEn: "Chapter Two", titleBn: "দ্বিতীয় অধ্যায়", titleKo: "제2장", pattern: /^Chapter Two\b/i },
    { id: "chapter-3", titleEn: "Chapter Three", titleBn: "তৃতীয় অধ্যায়", titleKo: "제3장", pattern: /^Chapter Three\b/i },
    { id: "chapter-4", titleEn: "Chapter Four", titleBn: "চতুর্থ অধ্যায়", titleKo: "제4장", pattern: /^Chapter Four\b/i },
    { id: "appendices", titleEn: "Appendices", titleBn: "পরিশিষ্ট", titleKo: "부록", pattern: /^Appendix/i },
  ];

  // Split on chapter / preamble / appendix boundaries
  const parts = [];
  const rx =
    /(^|\n)(Preamble|Chapter One|Chapter Two|Chapter Three|Chapter Four|Appendix-\d+|Appendix\s+\d+|Appendix(?!-))/gi;
  const indices = [];
  let m;
  const text = "\n" + joinedText;
  while ((m = rx.exec(text)) !== null) {
    indices.push({ index: m.index + m[1].length, label: m[2] });
  }
  if (!indices.length) {
    return [{ id: "all", titleEn: "Constitution", bodyEn: joinedText }];
  }
  for (let i = 0; i < indices.length; i++) {
    const start = indices[i].index;
    const end = i + 1 < indices.length ? indices[i + 1].index : text.length;
    const chunk = text.slice(start, end).trim();
    const label = indices[i].label;
    let sec = sectionDefs.find((s) => s.pattern.test(label));
    if (/^Appendix/i.test(label)) {
      sec = sectionDefs.find((s) => s.id === "appendices");
    }
    if (!sec) continue;
    const existing = parts.find((p) => p.id === sec.id);
    if (existing) {
      existing.bodyEn += "\n\n" + chunk;
    } else {
      parts.push({
        id: sec.id,
        titleEn: sec.titleEn,
        titleBn: sec.titleBn,
        titleKo: sec.titleKo,
        bodyEn: chunk,
      });
    }
  }
  return parts;
}

const parser = new PDFParse({
  data: fs.readFileSync("c:/Users/abirm09/Downloads/ConstitutionENG_KR.pdf"),
});
const result = await parser.getText();

// English from pages 15-30 (indices 14-29)
let engRaw = "";
for (let i = 14; i <= 29; i++) engRaw += pageText(result, i) + "\n";
const pre = engRaw.indexOf("Preamble");
engRaw = engRaw.slice(pre);
const engLines = engRaw.split("\n").map((l) => l.trim()).filter(Boolean);
const engParas = softJoin(engLines);
const engJoined = engParas.join("\n\n");
fs.writeFileSync("tmp-en-structured.txt", engJoined, "utf8");

const sections = splitSections(engJoined);
console.log(
  "sections",
  sections.map((s) => ({ id: s.id, len: s.bodyEn.length, start: s.bodyEn.slice(0, 60) })),
);

// Korean pure pages
let koRaw = "";
for (let i = 30; i < 51; i++) {
  const t = pageText(result, i);
  const hangul = (t.match(/[\uAC00-\uD7A3]/g) || []).length;
  const latin = (t.match(/[A-Za-z]/g) || []).length;
  if (hangul < 30) continue;
  // Keep hangul-heavy content; drop pure English runs
  const cleaned = t
    .split("\n")
    .filter((line) => {
      const h = (line.match(/[\uAC00-\uD7A3]/g) || []).length;
      const l = (line.match(/[A-Za-z]/g) || []).length;
      // keep if more hangul than latin, or short mixed
      return h > 0 && h >= l * 0.3;
    })
    .join("\n");
  if (cleaned.trim()) koRaw += cleaned + "\n\n";
}
fs.writeFileSync("tmp-ko-structured.txt", koRaw, "utf8");
console.log("ko len", koRaw.length, "start", koRaw.slice(0, 300));

// Export section bodies for hand-coding
fs.writeFileSync(
  "tmp-sections.json",
  JSON.stringify(
    sections.map((s) => ({
      id: s.id,
      titleEn: s.titleEn,
      titleBn: s.titleBn,
      titleKo: s.titleKo,
      bodyEn: s.bodyEn,
    })),
    null,
    2,
  ),
  "utf8",
);
console.log("Wrote tmp-sections.json");
