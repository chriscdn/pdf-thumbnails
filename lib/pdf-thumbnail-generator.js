import temp from "temp";
import { promisify } from "util";
import { exec as _exec } from "child_process";
import path from "path";
import { promises as fs } from "fs";
import { rimraf } from "rimraf";
const execPromise = promisify(_exec);
const ppmExtension = ".ppm";
const jpgExtension = ".jpg";
const numberToSuffix = (n, ext = "") => `${n.toString().padStart(7, "0")}${ext}`;
const _normalizePPMFileNames = async (folder, prefix) => {
    const files = await fs.readdir(folder);
    const filteredFiles = files.filter((file) => file.startsWith(prefix) && file.endsWith(ppmExtension))
        .sort((a, b) => a.localeCompare(b));
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
const _changeFileExtension = (filePath, newExtension) => {
    return path.format({
        dir: path.dirname(filePath),
        name: path.basename(filePath, path.extname(filePath)),
        ext: newExtension,
    });
};
const pdfToThumbnails = async ({ pdfFilePath, convert, pdftoppm, quality, scaleTo, scaleToX, scaleToY, range, }) => {
    const _thumbnailPath = await temp.mkdir("pdf-thumbnails");
    const suffix = path.basename(pdfFilePath);
    const suffix2 = `${suffix}-`;
    let filePaths = (await fs.readdir(_thumbnailPath)).filter((file) => path.extname(file) === jpgExtension);
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
        filePaths = await Promise.all(ppmPaths.map(async (ppmFilePath) => {
            // should always be .ppm -> .jpg
            const jpgFilePath = _changeFileExtension(ppmFilePath, jpgExtension);
            await execPromise(`${convert} -quality ${quality} ${ppmFilePath} ${jpgFilePath}`);
            // fire and forget, delete and fail silently
            rimraf(ppmFilePath).catch((_) => { });
            return jpgFilePath;
        }));
    }
    return filePaths;
};
export { pdfToThumbnails };
//# sourceMappingURL=pdf-thumbnail-generator.js.map