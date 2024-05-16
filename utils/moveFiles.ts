import { copyPasteFiles } from "./copyPasteFiles";

export const moveFiles = async (files: Array<{ src: string; dest: string }>) => {
    for (const file of files) {
        await copyPasteFiles([{ src: file.src, dest: file.dest }], { deleteSrc: true });
    }
};
