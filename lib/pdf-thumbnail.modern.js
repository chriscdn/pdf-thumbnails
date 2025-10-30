import { FileCache } from '@chriscdn/file-cache';
import temp from 'temp';
import { promisify } from 'util';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { rimraf } from 'rimraf';
import { PDFDocument } from 'pdf-lib';

function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}

const execPromise = promisify(exec);
const ppmExtension = ".ppm";
const jpgExtension = ".jpg";
const numberToSuffix = (n, ext = "") => `${n.toString().padStart(7, "0")}${ext}`;
const _normalizePPMFileNames = async (folder, prefix) => {
  const files = await fs.readdir(folder);
  const filteredFiles = files.filter(file => file.startsWith(prefix) && file.endsWith(ppmExtension)).sort((a, b) => a.localeCompare(b));
  return await Promise.all(filteredFiles.map(async (file, index) => {
    const newName = `${prefix}${numberToSuffix(index, ppmExtension)}`;
    const oldPath = path.join(folder, file);
    const newPath = path.join(folder, newName);
    // Rename asynchronously only if the names are different
    if (file !== newName) {
      await fs.rename(oldPath, newPath);
    }
    return newPath;
  }));
};
const _changeFileExtension = (filePath, newExtension) => path.format({
  dir: path.dirname(filePath),
  name: path.basename(filePath, path.extname(filePath)),
  ext: newExtension
});
const pdfToThumbnails = async ({
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
  let filePaths = (await fs.readdir(_thumbnailPath)).filter(file => path.extname(file) === jpgExtension);
  if (filePaths.length === 0) {
    const ppmRoot = path.resolve(_thumbnailPath, suffix);
    await execPromise(`${pdftoppm} \
                -f ${range[0]} \
                -l ${range[1]} \
                ${scaleTo ? `-scale-to ${scaleTo}` : ""} \
                ${scaleToX ? `-scale-to-x ${scaleToX}` : ""} \
                ${scaleToY ? `-scale-to-y ${scaleToY}` : ""} \
                ${pdfFilePath} \
                ${ppmRoot} \
                `);
    const ppmPaths = await _normalizePPMFileNames(_thumbnailPath, suffix2);
    filePaths = await Promise.all(ppmPaths.map(async ppmFilePath => {
      // should always be .ppm -> .jpg
      const jpgFilePath = _changeFileExtension(ppmFilePath, jpgExtension);
      await execPromise(`${convert} -quality ${quality} ${ppmFilePath} ${jpgFilePath}`);
      // fire and forget, delete and fail silently
      rimraf(ppmFilePath).catch(_ => {});
      return jpgFilePath;
    }));
  }
  return filePaths;
};

const pageCount = async filePath => {
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
/**
 * Extend FileCache with a few default options.
 */
class PDFThumbnailFileCache extends FileCache {
  /**
   * Override the constructor to default the `ext` and `cb` parameters.
   *
   * @param args
   */
  constructor(args) {
    super(_extends({}, args, {
      ext: () => ".jpg",
      cb: async function (filePath, {
        pdfFilePath,
        pageIndex
      }) {
        var _args$quality, _args$pdftoppm, _args$convert, _args$quality2, _args$pdftoppm2, _args$convert2;
        const pageNumber = pageIndex + 1;
        console.log({
          pdfFilePath,
          quality: (_args$quality = args.quality) != null ? _args$quality : 70,
          pdftoppm: (_args$pdftoppm = args.pdftoppm) != null ? _args$pdftoppm : "pdftoppm",
          convert: (_args$convert = args.convert) != null ? _args$convert : "convert",
          range: [pageNumber, pageNumber],
          scaleTo: args.scaleTo,
          scaleToX: args.scaleToX,
          scaleToY: args.scaleToY
        });
        // All PDF pages as an array of file paths. These are sorted by page order.
        const filePaths = await pdfToThumbnails({
          pdfFilePath,
          quality: (_args$quality2 = args.quality) != null ? _args$quality2 : 70,
          pdftoppm: (_args$pdftoppm2 = args.pdftoppm) != null ? _args$pdftoppm2 : "pdftoppm",
          convert: (_args$convert2 = args.convert) != null ? _args$convert2 : "convert",
          range: [pageNumber, pageNumber],
          scaleTo: args.scaleTo,
          scaleToX: args.scaleToX,
          scaleToY: args.scaleToY
        });
        await fs.copyFile(filePaths[0], filePath);
      }
    }));
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
}

export { PDFThumbnailFileCache };
//# sourceMappingURL=pdf-thumbnail.modern.js.map
