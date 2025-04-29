import { describe, expect, it } from "vitest";
import { PDFThumbnailFileCache } from "../src";
import { Duration } from "@chriscdn/duration";
import temp from "temp";

const pdfFilePath = "./__tests__/pdfs/lorem.pdf";
const pause = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cache = new PDFThumbnailFileCache({
    cachePath: await temp.mkdir("file-cache-test"),
    ttl: Duration.toMilliseconds({ seconds: 1 }),
    cleanupInterval: Duration.toMilliseconds({ seconds: 2 }),
});

// describe("Cache Expiration", async () => {
//     const cache = new PDFThumbnailFileCache({
//         cachePath: await temp.mkdir("file-cache-test"),
//         ttl: Duration.toMilliseconds({ seconds: 1 }),
//         cleanupInterval: Duration.toMilliseconds({ seconds: 2 }),
//     });

//     const [file0, file4] = await Promise.all([
//         cache.getFile({ pdfFilePath, pageNumber: 0 }),
//         cache.getFile({ pdfFilePath, pageNumber: 2 }),
//     ]);
// });

describe("Page Count", () => {
    it("pageCount", async () => {
        expect(await cache.pageCount(pdfFilePath)).toBe(4);
    });
});

describe("Thumbs", async () => {
    const filePath0 = await cache.getFile({ pdfFilePath, pageIndex: 1 });
    console.log(filePath0);

    it("pageCount", async () => {
        expect(await cache.pageCount(pdfFilePath)).toBe(4);
    });
});
