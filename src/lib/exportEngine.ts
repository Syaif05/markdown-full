export async function exportToPng(element: HTMLElement, filename = "document.png") {
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(element, {
    scale: 2, // High resolution
    useCORS: true,
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--bg-2").trim() || "#ffffff"
  });
  
  canvas.toBlob((blob) => {
    if (blob) downloadFile(blob, filename);
  }, "image/png");
}

export async function exportToPdf(element: HTMLElement, filename = "document.pdf") {
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");
  
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--bg-2").trim() || "#ffffff"
  });
  
  const imgData = canvas.toDataURL("image/png");
  
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });
  
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
}

export function exportToHtml(htmlContent: string, filename = "document.html") {
  let styles = "";
  try {
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        if (sheet.href && !sheet.href.includes(window.location.host)) continue;
        for (const rule of Array.from(sheet.cssRules)) {
          styles += rule.cssText + "\n";
        }
      } catch (e) {
        // Ignore cross-origin issues
      }
    }
  } catch (e) {}
  
  const isDark = document.documentElement.classList.contains("dark");
  const themeClass = isDark ? "dark" : "";

  const fullHtml = `<!DOCTYPE html>
<html lang="en" class="${themeClass}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Markdown</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <style>
    /* Fallback basic variables if CSS extraction fails */
    :root { --font-sans: 'Inter', sans-serif; --font-display: 'Plus Jakarta Sans', sans-serif; }
    body {
      background-color: var(--bg-2, #fff);
      color: var(--text-1, #111);
      font-family: var(--font-sans);
      padding: 3rem 2rem;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.6;
    }
    /* Injected Next.js app styles */
    ${styles}
  </style>
</head>
<body style="background: var(--bg-2)">
  <div class="md-preview mx-auto">
    ${htmlContent}
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
  downloadFile(blob, filename);
}

function downloadFile(blob: Blob | string, filename: string) {
  const url = typeof blob === "string" ? blob : URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (typeof blob !== "string") URL.revokeObjectURL(url);
}
