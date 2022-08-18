import fs from "fs";
import path from "path";
import { Context } from "../types";
/**
 * Check if the project is created on 5.29.0 or later.
 * Or it is an old type of project.
 */
export const isPre529Project = (context: Context): boolean => {
    return fs.existsSync(path.join(context.project.root, "api"));
};
export const getIsPre529Project = isPre529Project;
