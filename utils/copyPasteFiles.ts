import util from "util";
import ncpBase from "ncp";
import fs from "fs";
import path from "path";

const ncp = util.promisify(ncpBase.ncp);

export const copyPasteFiles = async (
    files: Array<{ src: string; dest: string }>,
    options?: { deleteSrc: boolean }
) => {
    for (const file of files) {
        if (!fs.existsSync(file.src)) {
            throw new Error(`File "${file.src}" does not exist.`);
        }

        const destFolderPath = path.dirname(file.dest);
        if (!fs.existsSync(destFolderPath)) {
            fs.mkdirSync(destFolderPath, { recursive: true });
        }

        await ncp(file.src, file.dest);
        if (options?.deleteSrc) {
            fs.unlinkSync(file.src);
        }
    }
};
