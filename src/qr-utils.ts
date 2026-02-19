import QRCode from "qrcode";

export type ContentType = "url" | "text" | "wifi" | "email" | "sms" | "vcard";

export type ExportFormat = "png" | "svg" | "jpg" | "webp";

export type QRFormData = Record<string, string>;

const QR_OPTIONS: QRCode.QRCodeRenderersOptions = {
  errorCorrectionLevel: "H",
  margin: 0,
  width: 256,
};

export function buildContent(type: ContentType, formData: QRFormData): string {
  switch (type) {
    case "url":
      return formData.url?.trim() || "https://example.com";

    case "text":
      return formData.text?.trim() || "Hello, world!";

    case "wifi": {
      const ssid = formData.wifiSsid || "";
      const pass = formData.wifiPass || "";
      const sec = formData.wifiSec || "WPA";
      return `WIFI:T:${sec};S:${ssid};P:${pass};;`;
    }

    case "email": {
      const to = formData.emailTo || "";
      const sub = encodeURIComponent(formData.emailSubject || "");
      const body = encodeURIComponent(formData.emailBody || "");
      return `mailto:${to}?subject=${sub}&body=${body}`;
    }

    case "sms": {
      const num = formData.smsNumber || "";
      const body = encodeURIComponent(formData.smsBody || "");
      return `sms:${num}${body ? "?body=" + body : ""}`;
    }

    case "vcard": {
      const f = formData.vcFirst || "";
      const l = formData.vcLast || "";
      const ph = formData.vcPhone || "";
      const em = formData.vcEmail || "";
      const org = formData.vcOrg || "";
      const url = formData.vcUrl || "";
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${f} ${l}\nN:${l};${f};;;\nTEL:${ph}\nEMAIL:${em}\nORG:${org}\nURL:${url}\nEND:VCARD`;
    }

    default:
      return "";
  }
}

export async function renderQR(
  container: HTMLElement,
  content: string,
  fg: string,
  bg: string,
): Promise<void> {
  container.innerHTML = "";
  const canvas = document.createElement("canvas");
  container.appendChild(canvas);
  await QRCode.toCanvas(canvas, content, {
    ...QR_OPTIONS,
    width: 256,
    color: { dark: fg, light: bg },
  });
}

export async function downloadQR(
  format: ExportFormat,
  content: string,
  size: number,
  fg: string,
  bg: string,
): Promise<void> {
  if (!content) return;

  const opts: QRCode.QRCodeRenderersOptions = {
    ...QR_OPTIONS,
    width: size,
    color: { dark: fg, light: bg },
  };

  if (format === "svg") {
    const svgString = await QRCode.toString(content, { ...opts, type: "svg" });
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = "qr-code.svg";
    a.href = url;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }

  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, content, opts);

  const mimeMap: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    webp: "image/webp",
  };
  const mime = mimeMap[format] || "image/png";

  let exportCanvas: HTMLCanvasElement = canvas;
  if (format === "jpg") {
    exportCanvas = document.createElement("canvas");
    exportCanvas.width = size;
    exportCanvas.height = size;
    const ctx = exportCanvas.getContext("2d")!;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(canvas, 0, 0);
  }

  const a = document.createElement("a");
  a.download = `qr-code.${format}`;
  a.href = exportCanvas.toDataURL(mime, 0.95);
  a.click();
}
