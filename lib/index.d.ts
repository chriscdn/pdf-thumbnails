import { FileCache, FileCacheOptions, type FilePath } from "@chriscdn/file-cache";
type PDFArgs = {
    pdfFilePath: FilePath;
    pageIndex: number;
};
export type PDFThumbnailFileCacheOptions = Omit<FileCacheOptions<PDFArgs>, "cb" | "ext"> & {
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
declare class PDFThumbnailFileCache extends FileCache<PDFArgs> {
    /**
     * Override the constructor to default the `ext` and `cb` parameters.
     *
     * @param args
     */
    constructor(args: PDFThumbnailFileCacheOptions);
    /**
     * The page count, or the number of pages returned by pdf2ppm.
     *
     * @param pdfFilePath
     * @returns
     */
    pageCount(pdfFilePath: FilePath): Promise<number>;
}
export { PDFThumbnailFileCache };
