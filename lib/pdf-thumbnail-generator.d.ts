import { FilePath } from "@chriscdn/file-cache";
declare const pdfToThumbnails: ({ pdfFilePath, convert, pdftoppm, quality, scaleTo, scaleToX, scaleToY, range, }: {
    pdfFilePath: FilePath;
    convert: FilePath;
    pdftoppm: FilePath;
    quality: number;
    scaleTo?: number;
    scaleToX?: number;
    scaleToY?: number;
    range: [number, number];
}) => Promise<string[]>;
export { pdfToThumbnails };
