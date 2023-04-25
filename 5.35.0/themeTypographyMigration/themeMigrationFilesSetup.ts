import { Context } from "../../types";
import { createFilePath, FileDefinition } from "../../utils";

import { ThemeFileMigrationDefinition } from "./migrationTypes";

const glob = require("fast-glob");

const themeLayoutUpgradeDefinition = (context: Context): ThemeFileMigrationDefinition[] => {
    const files = glob.sync(["apps/theme/**/*.{ts,tsx}"]);

    return files.map(item => {
        return {
            file: new FileDefinition({
                path: createFilePath(context, "${root}" + "/" + item),
                tag: "theme",
                name: item
            })
        };
    });
};

export const themeMigrationFilesSetup = (context: Context): ThemeFileMigrationDefinition[] => {
    return [...themeLayoutUpgradeDefinition(context)];
};
