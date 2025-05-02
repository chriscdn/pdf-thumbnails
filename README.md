# @chriscdn/pdf-thumbnails

This package generates and caches thumbnail images of a PDF file.

## Installation

Using npm:

```bash
npm install @chriscdn/pdf-thumbnails
```

Using yarn:

```bash
yarn add @chriscdn/pdf-thumbnails
```

## Dependencies

This package relies on two external utilities for operation:

- `pdftoppm` from `poppler-utils`
- `convert` from `ImageMagick`.

The process first converts a PDF page to `PPM` with `pdftoppm` before convering it to `JPG` with `convert`. After testing several methods, this approach seems to be the most efficient for generating high-quality thumbnails.

The package extends [@chriscdn/file-cache](https://www.npmjs.com/package/@chriscdn/file-cache) to manage the cache of JPGs.

## Usage

```ts
import { PDFThumbnailFileCache } from "@chriscdn/pdf-thumbnails";

// not required, but helps with duration calculations
import { Duration } from "@chriscdn/duration";

const options: PDFThumbnailFileCacheOptions = {
  // The path to the cache directory. Do not store anything else in this directory.
  cachePath: "/tmp/thumbnails/",

  // Optional, automatically create the cachePath if it doesn't exist.
  autoCreateCachePath: false,

  // Determines the time-to-live (TTL) of a cached file, in milliseconds,
  // based on when it was last accessed.
  ttl: Duration.toMilliseconds({ days: 7 }),

  // How often the cleanup task should run to purge expired cached files, in milliseconds.
  cleanupInterval: Duration.toMilliseconds({ hours: 4 }),

  // Optional, the image quality used by `convert`, which defaults to 70.
  quality: 70,

  // Optional, the path to pdftoppm. If omitted, it will look for `pdftoppm` in the system path.
  pdftoppm: "/usr/bin/pdftoppm",

  // Optional, the path to convert. If omitted, it will look for `convert` in the system path.
  convert: "/usr/bin/convert",
};

const thumbnailCache = new PDFThumbnailFileCache(options);
```

A thumbnail can be generated with:

```ts
const thumbnailFilePath = await thumbnailCache.getFile({
  pdfFilePath: "/some/pdf/file.pdf",
  pageIndex: 0, // 0-based
});

// This returns a file path to the `JPG` image. E.g.,
// /tmp/thumbnails/d/b/c/dbc7181baf54aa79b182142f12a8bee77068c74b.jpg
```

**NOTE:** The JPG file paths are determined by hashing the input parameters to `getFile`. To avoid caching conflicts, it's important to use a unique file path for different PDF files.

A `pageCount` method exists to retrieve the number of pages in a PDF:

```ts
const pageCount: number = await thumbnailCache.pageCount("/some/pdf/file.pdf");
```

## Cleanup

`PDFThumbnailFileCache` instances are intended to be instantiated as singletons, persisting throughout the lifecycle of your app. If you need to deallocate an instance, be sure to call the `destroy()` method to prevent a memory leak. This does not cleanup the cache directory.

## Tests

Run the tests using:

```bash
yarn test
```

## License

[MIT](LICENSE)
