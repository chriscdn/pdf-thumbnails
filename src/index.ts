import {
    FileCache,
    FileCacheOptions,
    type FilePath,
} from "@chriscdn/file-cache";
import { pdfToThumbnails } from "./pdf-thumbnail-generator.js";
import { promises as fs } from "fs";
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

export type PDFThumbnailFileCacheOptions =
    & Omit<
        FileCacheOptions<PDFArgs>,
        "cb" | "ext"
    >
    & {
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

                console.log({
                    pdfFilePath,
                    quality: args.quality ?? 70,
                    pdftoppm: args.pdftoppm ?? "pdftoppm",
                    convert: args.convert ?? "convert",
                    range: [pageNumber, pageNumber],
                    scaleTo: args.scaleTo,
                    scaleToX: args.scaleToX,
                    scaleToY: args.scaleToY,
                });

                // All PDF pages as an array of file paths. These are sorted by page order.
                const filePaths = await pdfToThumbnails(
                    {
                        pdfFilePath,
                        quality: args.quality ?? 70,
                        pdftoppm: args.pdftoppm ?? "pdftoppm",
                        convert: args.convert ?? "convert",
                        range: [pageNumber, pageNumber],
                        scaleTo: args.scaleTo,
                        scaleToX: args.scaleToX,
                        scaleToY: args.scaleToY,
                    },
                );

                await fs.copyFile(filePaths[0], filePath);

                /*
                // this was an attempt to batch process all items in a pdf.. but
                // single is faster

                await Promise.all(filePaths.map(async (filePath, index) => {
                    const targetCacheFilePath = await cache .resolveFilePath({
                    pdfFilePath, pageNumber: index,
                        });

                    await fs.mkdir(path.dirname(targetCacheFilePath), {
                        recursive: true,
                    });

                    // do not rename since they may exist on different volumes
                    await fs.copyFile(filePath, targetCacheFilePath);
                }));
                */
            },
        });

        // this._quality = args.quality ?? 70;
        // this._pdftoppm = args.pdftoppm ?? "pdftoppm";
        // this._convert = args.convert ?? "convert";
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

export { PDFThumbnailFileCache };
