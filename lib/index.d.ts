import { FileCache, FileCacheOptions, type FilePath } from "@chriscdn/file-cache";
type PDFArgs = {
    pdfFilePath: FilePath;
    pageIndex: number;
};
export type PDFThumbnailFileCacheOptions = Omit<FileCacheOptions<PDFArgs>, "cb" | "ext"> & {
    quality?: number;
    pdftoppm?: FilePath;
    convert?: FilePath;
};
/**
 * Extend FileCache with a few default options.
 */
declare class PDFThumbnailFileCache extends FileCache<PDFArgs> {
    private _quality;
    private _pdftoppm;
    private _convert;
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
