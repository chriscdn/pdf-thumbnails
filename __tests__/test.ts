import { Duration } from "@chriscdn/duration";
import temp from "temp";
import { PDFThumbnailFileCache } from "../src";
const pdfFilePath = "./__tests__/pdfs/lorem.pdf";

const cache = new PDFThumbnailFileCache({
    cachePath: await temp.mkdir("file-cache-test"),
    ttl: Duration.toMilliseconds({ seconds: 1 }),
    cleanupInterval: Duration.toMilliseconds({ seconds: 2 }),
    scaleTo: 100,
});

cache.destroy();

const filePath0 = await cache.getFile({ pdfFilePath, pageIndex: 1 });

console.log(filePath0);
