import { Context } from "../types";
import { FileDefinition } from "../utils";
import fs from "fs-extra";

export const backupAndReplace = (context: Context, file: FileDefinition, source: string) => {
    const backupPath = `${file.path}.backup`;
    fs.copyFileSync(file.path, backupPath);
    fs.copyFileSync(source, file.path);
    context.log.info(`Replaced %s (backup created at %s).`, file.path, backupPath);
};
