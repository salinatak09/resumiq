import "server-only";

export async function extractPdfText(
  data: Uint8Array
) {
  if (!data || data.length === 0) {
    throw new Error("PDF Data is empty");
  }  
  
  // pdfjs-dist expects browser DOM globals.
  // if (typeof globalThis.DOMMatrix === "undefined") {
  //   const { DOMMatrix } = await import("@napi-rs/canvas");
  //   // @ts-expect-error DOMMatrix is provided by the canvas implementation
  //   globalThis.DOMMatrix = DOMMatrix;
  // }

  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({data});

  try {
    const result = await parser.getText();

    const text = result.text
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text) {
      throw new Error(
        "No text could be extracted from the PDF. " +
        "The PDF may be scanned or image-based."
      );
    }

    return text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to extract text from PDF");
  } finally {
    await parser.destroy();
  }
}
