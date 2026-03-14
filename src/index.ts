import {
  FileCache,
  FileCacheOptions,
  type FilePath,
} from "@chriscdn/file-cache";
import { pdfToThumbnails } from "./pdf-thumbnail-generator.js";
import fs from "fs/promises";
import { PDFDocument } from "pdf-lib";

const pageCount = async (filePath: FilePath): Promise<number> => {
  try {
    // Read the PDF file as a buffer
    const data = await fs.readFile(filePath);

    // Load the PDF document asynchronously
    const pdfDoc = await PDFDocument.load(data);

    // Get the page count
    return pdfDoc.getPageCount();
  } catch (error) {
    console.error("Error reading PDF:", error);
    throw new Error("Failed to get page count");
  }
};

type PDFArgs = {
  pdfFilePath: FilePath;
  pageIndex: number; // 0-based
};

type PDFThumbnailFileCacheOptions = Omit<
  FileCacheOptions<PDFArgs>,
  "cb" | "ext"
> & {
  quality?: number;
  pdftoppm?: FilePath;
  convert?: FilePath;
  scaleTo?: number;
  scaleToX?: number;
  scaleToY?: number;
};

/**
 * Extend FileCache with a few default options.
 */
class PDFThumbnailFileCache extends FileCache<PDFArgs> {
  /**
   * Override the constructor to default the `ext` and `cb` parameters.
   *
   * @param args
   */
  constructor(args: PDFThumbnailFileCacheOptions) {
    super({
      ...args,
      ext: () => ".jpg",
      cb: async (filePath, { pdfFilePath, pageIndex }) => {
        const pageNumber = pageIndex + 1;

        const options: Parameters<typeof pdfToThumbnails>[0] = {
          pdfFilePath,
          convert: args.convert ?? "convert",
          pdftoppm: args.pdftoppm ?? "pdftoppm",
          quality: args.quality ?? 70,
          scaleTo: args.scaleTo,
          scaleToX: args.scaleToX,
          scaleToY: args.scaleToY,
          range: [pageNumber, pageNumber],
        };

        console.log(JSON.stringify(options));

        // All PDF pages as an array of file paths. These are sorted by page order.

        const filePaths = await pdfToThumbnails(options);

        // index zero because of the range above
        await fs.copyFile(filePaths[0]!, filePath);
      },
    });
  }

  /**
   * The page count, or the number of pages returned by pdf2ppm.
   *
   * @param pdfFilePath
   * @returns
   */
  async pageCount(pdfFilePath: FilePath) {
    return pageCount(pdfFilePath);
  }
}

export { PDFThumbnailFileCache, type PDFThumbnailFileCacheOptions };
