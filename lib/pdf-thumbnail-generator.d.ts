import { FilePath } from "@chriscdn/file-cache";
declare const pdfToThumbnails: ({ pdfFilePath, convert, pdftoppm, quality, range }: {
    pdfFilePath: FilePath;
    convert: FilePath;
    pdftoppm: FilePath;
    quality: number;
    range: [number, number];
}) => Promise<string[]>;
export { pdfToThumbnails };
