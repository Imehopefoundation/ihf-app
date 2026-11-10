/**
 * "IHF Letter" PDF — addressed to the public school and the parent/guardian.
 *
 * CLAUDE.md: "Generated PDFs (IHF Letter): escape and length-limit all inserted
 * data; no HTML-to-PDF with unsanitised input." We build the PDF
 * programmatically with pdf-lib (no HTML, no template engine), and every
 * inserted value is passed through `clean()` — stripped of control/non-Latin-1
 * characters and length-limited — before it is drawn.
 *
 * Server-only.
 */
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

if (typeof window !== "undefined") {
  throw new Error("PDF generation is server-only.");
}

export interface IhfLetterInput {
  applicationRef: string;
  childName: string;
  guardianName: string;
  schoolName: string;
  programme: string;
  date?: Date;
}

/**
 * Remove control characters and anything the standard PDF font cannot encode
 * (keep printable Latin-1), collapse whitespace, and hard-limit the length.
 */
export function clean(value: string, max: number): string {
  return (value ?? "")
    .normalize("NFKD")
    // drop control chars and anything outside printable Latin-1
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function wrap(text: string, font: import("pdf-lib").PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function generateIhfLetter(input: IhfLetterInput): Promise<Uint8Array> {
  const ref = clean(input.applicationRef, 40);
  const child = clean(input.childName, 120);
  const guardian = clean(input.guardianName, 120);
  const school = clean(input.schoolName, 160);
  const programme = clean(input.programme, 80);
  const date = (input.date ?? new Date()).toISOString().slice(0, 10);

  const doc = await PDFDocument.create();
  doc.setTitle("IHF Letter");
  doc.setProducer("IHF");
  doc.setCreator("IHF");
  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 56;
  const width = page.getWidth() - margin * 2;
  let y = page.getHeight() - margin;
  const ink = rgb(0.2, 0.2, 0.2);

  const line = (text: string, f = font, size = 11, gap = 16) => {
    page.drawText(text, { x: margin, y, size, font: f, color: ink });
    y -= gap;
  };
  const paragraph = (text: string, size = 11) => {
    for (const l of wrap(text, font, size, width)) line(l, font, size, 15);
  };

  line("IME HOPE FOUNDATION", bold, 16, 22);
  line("A God-centred charity serving communities across Africa.", font, 9, 24);
  line(`Date: ${date}`, font, 10, 14);
  line(`Reference: ${ref}`, font, 10, 24);

  line(`To: The Head Teacher, ${school}`, bold, 11, 16);
  line(`And to the parent/guardian: ${guardian}`, bold, 11, 24);

  paragraph(
    `This letter confirms that ${child} is engaged with IME HOPE FOUNDATION through our ${programme} programme. We write with the knowledge and consent of the parent or guardian.`,
  );
  y -= 6;
  paragraph(
    "IHF provides faith-rooted mentorship and skills development. We would be grateful for the school's support and understanding as the above member takes part in our programme.",
  );
  y -= 6;
  paragraph("With thanks and every good wish,");
  y -= 10;
  line("IME HOPE FOUNDATION", bold, 11, 14);

  return doc.save();
}
