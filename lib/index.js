// src/index.ts
import {
  FileCache
} from "@chriscdn/file-cache";

// src/pdf-thumbnail-generator.ts
import temp from "temp";
import { promisify } from "util";
import { exec as _exec } from "child_process";
import path from "path";
import fs from "fs/promises";
import { rimraf } from "rimraf";
var execPromise = promisify(_exec);
var ppmExtension = ".ppm";
var jpgExtension = ".jpg";
var numberToSuffix = (n, ext = "") => `${n.toString().padStart(7, "0")}${ext}`;
var _normalizePPMFileNames = async (folder, prefix) => {
  const files = await fs.readdir(folder);
  const filteredFiles = files.filter((file) => file.startsWith(prefix) && file.endsWith(ppmExtension)).sort((a, b) => a.localeCompare(b));
  return await Promise.all(
    filteredFiles.map(async (file, index) => {
      const newName = `${prefix}${numberToSuffix(index, ppmExtension)}`;
      const oldPath = path.join(folder, file);
      const newPath = path.join(folder, newName);
      if (file !== newName) {
        await fs.rename(oldPath, newPath);
      }
      return newPath;
    })
  );
};
var _changeFileExtension = (filePath, newExtension) => path.format({
  dir: path.dirname(filePath),
  name: path.basename(filePath, path.extname(filePath)),
  ext: newExtension
});
var pdfToThumbnails = async ({
  pdfFilePath,
  convert,
  pdftoppm,
  quality,
  scaleTo,
  scaleToX,
  scaleToY,
  range
}) => {
  const _thumbnailPath = await temp.mkdir("pdf-thumbnails");
  const suffix = path.basename(pdfFilePath);
  const suffix2 = `${suffix}-`;
  let filePaths = (await fs.readdir(_thumbnailPath)).filter(
    (file) => path.extname(file) === jpgExtension
  );
  if (filePaths.length === 0) {
    const ppmRoot = path.resolve(_thumbnailPath, suffix);
    await execPromise(
      `${pdftoppm}                 -f ${range[0]}                 -l ${range[1]}                 ${scaleTo ? `-scale-to ${scaleTo}` : ""}                 ${scaleToX ? `-scale-to-x ${scaleToX}` : ""}                 ${scaleToY ? `-scale-to-y ${scaleToY}` : ""}                 ${pdfFilePath}                 ${ppmRoot}                 `
    );
    const ppmPaths = await _normalizePPMFileNames(_thumbnailPath, suffix2);
    filePaths = await Promise.all(
      ppmPaths.map(async (ppmFilePath) => {
        const jpgFilePath = _changeFileExtension(ppmFilePath, jpgExtension);
        await execPromise(
          `${convert} -quality ${quality} ${ppmFilePath} ${jpgFilePath}`
        );
        rimraf(ppmFilePath).catch((_) => {
        });
        return jpgFilePath;
      })
    );
  }
  return filePaths;
};

// src/index.ts
import fs2 from "fs/promises";
import { PDFDocument } from "pdf-lib";
var pageCount = async (filePath) => {
  try {
    const data = await fs2.readFile(filePath);
    const pdfDoc = await PDFDocument.load(data);
    return pdfDoc.getPageCount();
  } catch (error) {
    console.error("Error reading PDF:", error);
    throw new Error("Failed to get page count");
  }
};
var PDFThumbnailFileCache = class extends FileCache {
  /**
   * Override the constructor to default the `ext` and `cb` parameters.
   *
   * @param args
   */
  constructor(args) {
    super({
      ...args,
      ext: () => ".jpg",
      cb: async (filePath, { pdfFilePath, pageIndex }) => {
        const pageNumber = pageIndex + 1;
        const options = {
          pdfFilePath,
          convert: args.convert ?? "convert",
          pdftoppm: args.pdftoppm ?? "pdftoppm",
          quality: args.quality ?? 70,
          scaleTo: args.scaleTo,
          scaleToX: args.scaleToX,
          scaleToY: args.scaleToY,
          range: [pageNumber, pageNumber]
        };
        console.log(JSON.stringify(options));
        const filePaths = await pdfToThumbnails(options);
        await fs2.copyFile(filePaths[0], filePath);
      }
    });
  }
  /**
   * The page count, or the number of pages returned by pdf2ppm.
   *
   * @param pdfFilePath
   * @returns
   */
  async pageCount(pdfFilePath) {
    return pageCount(pdfFilePath);
  }
};
export {
  PDFThumbnailFileCache
};
//# sourceMappingURL=index.js.map