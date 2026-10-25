/**
 * Share one or more Bible verses to other apps (Instagram, WhatsApp, Messages…).
 *
 * Tries, in order:
 *   1. Picture(s) of the verse (canyon photo + logo + text) via the system
 *      share sheet — best for social media, and "Save Image" saves to Photos.
 *   2. Just the text, via the share sheet.
 *   3. Copying the text to the clipboard (older devices / desktop browsers).
 */

const APP_STORE_URL = "https://apps.apple.com/us/app/centro-de-nueva-esperanza/id6782461201";

export interface VerseShareInput {
  /** Plain verse text (multiple verses already joined). */
  text: string;
  /** e.g. "Juan 3:16-18" */
  reference: string;
  /** Bible version id, e.g. "spnbes" */
  version: string;
}

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";

export function buildShareText({ text, reference, version }: VerseShareInput): string {
  return `“${text}”\n— ${reference} (${version.toUpperCase()})\n\nCentro de Nueva Esperanza\n${APP_STORE_URL}`;
}

/** One picture's worth of verses. */
export interface VerseImagePage {
  /** Verse text for this picture (verse numbers already inlined if any). */
  text: string;
  /** Reference for just these verses, e.g. "Juan 3:16-18". */
  reference: string;
}

/**
 * Share the verse picture(s) through the system share sheet. Only the images
 * are sent (no caption) so iOS offers "Save Image" to the Photos library;
 * Instagram/WhatsApp/etc. take the pictures as-is.
 */
export async function shareVerseImages(pages: VerseImagePage[], version: string): Promise<ShareResult> {
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  const fallbackText = pages
    .map((pg) => buildShareText({ text: pg.text, reference: pg.reference, version }))
    .join("\n\n");

  try {
    if (nav.share) {
      const files = (
        await Promise.all(pages.map((pg, i) => renderVerseImage(pg, version, i, pages.length).catch(() => null)))
      ).filter((f): f is File => !!f);
      if (files.length === pages.length && nav.canShare?.({ files })) {
        await nav.share({ files });
        return "shared";
      }
      await nav.share({ text: fallbackText });
      return "shared";
    }
  } catch (error) {
    if ((error as DOMException)?.name === "AbortError") return "cancelled";
    // fall through to clipboard
  }

  try {
    await navigator.clipboard.writeText(fallbackText);
    return "copied";
  } catch {
    return "failed";
  }
}

// ── Image card ──────────────────────────────────────────────────────────────

const W = 1080;
const H = 1350; // 4:5 — fits an Instagram post and sits well in a story

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function renderVerseImage({ text, reference }: VerseImagePage, version: string, index: number, total: number): Promise<File | null> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const [photo, logo] = await Promise.all([loadImage("/hero-home.jpg"), loadImage("/cne_logo_white.png")]);
  try {
    await (document as Document & { fonts?: FontFaceSet }).fonts?.load('500 48px "Playfair Display"');
  } catch {
    // fall back to Georgia
  }

  // Photo, cover-fitted and centered
  const scale = Math.max(W / photo.width, H / photo.height);
  const pw = photo.width * scale;
  const ph = photo.height * scale;
  ctx.drawImage(photo, (W - pw) / 2, (H - ph) / 2, pw, ph);

  // Soft darkening so white text reads on the sky
  const shade = ctx.createLinearGradient(0, 0, 0, H);
  shade.addColorStop(0, "rgba(15, 22, 35, 0.30)");
  shade.addColorStop(0.5, "rgba(15, 22, 35, 0.38)");
  shade.addColorStop(1, "rgba(15, 22, 35, 0.55)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, W, H);

  // Logo (its soft shadow is baked into the PNG, with padding around it)
  const logoW = 275;
  const logoH = (logo.height / logo.width) * logoW;
  ctx.drawImage(logo, (W - logoW) / 2, 85, logoW, logoH);

  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;

  // Verse — shrink the font until it fits the space
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const quoted = `“${text}”`;
  const maxWidth = 860;
  const boxTop = 85 + logoH + 50;
  const boxBottom = H - 240;
  let size = 64;
  let lines: string[] = [];
  let lineHeight = 0;
  for (; size >= 26; size -= 2) {
    ctx.font = `500 ${size}px "Playfair Display", Georgia, serif`;
    lines = wrapLines(ctx, quoted, maxWidth);
    lineHeight = size * 1.35;
    if (lines.length * lineHeight <= boxBottom - boxTop) break;
  }
  const blockH = lines.length * lineHeight;
  let y = boxTop + (boxBottom - boxTop - blockH) / 2;
  for (const line of lines) {
    ctx.fillText(line, W / 2, y);
    y += lineHeight;
  }

  // Reference
  ctx.font = `600 38px -apple-system, "SF Pro Text", Inter, sans-serif`;
  ctx.fillText(`${reference} · ${version.toUpperCase()}`, W / 2, H - 200);
  if (total > 1) {
    ctx.font = `500 26px -apple-system, "SF Pro Text", Inter, sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.fillText(`${index + 1} / ${total}`, W / 2, H - 150);
    ctx.fillStyle = "#FFFFFF";
  }

  // Footer
  ctx.font = `500 28px -apple-system, "SF Pro Text", Inter, sans-serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillText("Centro de Nueva Esperanza", W / 2, H - 100);

  // JPEG: a regular photo file, so "Save Image" puts it straight into Photos.
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  if (!blob) return null;
  const name = total > 1 ? `versiculo-${index + 1}.jpg` : "versiculo.jpg";
  return new File([blob], name, { type: "image/jpeg" });
}
