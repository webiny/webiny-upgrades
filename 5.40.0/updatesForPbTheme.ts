import {
    copyPasteFiles,
    createProcessor,
    insertImportToSourceFile,
    moveFiles,
    removeImportFromSourceFile
} from "../utils";
import glob from "fast-glob";
import fs from "fs";
import path from "path";
import loadJson from "load-json-file";
import { PackageJson } from "../types";
import writeJson from "write-json-file";
import { replaceInPath } from "replace-in-path";

export const updatesForPbTheme = createProcessor(async params => {
    const { project, files, context } = params;

    // 1. Move all code in `extensions/theme` into `extensions/theme/src` folder.
    {
        fs.mkdirSync("extensions/theme/src", { recursive: true });
        const filePaths = await glob([
            "extensions/theme/**/*",
            "!extensions/theme/package.json",
            "!extensions/theme/tsconfig.json"
        ]);

        for (const filePath of filePaths) {
            await moveFiles([
                {
                    src: filePath,
                    dest: filePath.replace("extensions/theme/", "extensions/theme/src/")
                }
            ]);
        }
    }

    // 2. Create a backup of the existing `global.scss` file, and replace it with the new one.
    {
        const globalScssPath = "extensions/theme/src/global.scss";
        const globalScssBackupPath = "extensions/theme/src/global.backup.scss";
        await moveFiles([{ src: globalScssPath, dest: globalScssBackupPath }]);

        const src = path.join(__dirname, "updatesForPbTheme", "filesToCopy", "global.scss");
        const dest = path.join("extensions", "theme", "src", "global.scss");
        await copyPasteFiles([{ src, dest }]);
    }

    // 3. Update `package.json` and `tsconfig.json` files (take into consideration the new `src` folder).
    {
        const packageJsonPath = path.join("extensions", "theme", "package.json");
        const packageJson = await loadJson<PackageJson>(packageJsonPath);
        packageJson.main = "src/index.ts";
        await writeJson(packageJsonPath, packageJson);
    }

    {
        const packageJsonPath = path.join("extensions", "theme", "tsconfig.json");
        const tsConfigJson = await loadJson<Record<string, any>>(packageJsonPath);
        tsConfigJson.include = ["src"];
        await writeJson(packageJsonPath, tsConfigJson);
    }

    // 4. Import `global.scss` in `extensions/theme/src/index.ts`.
    {
        // Had to re-add the file because initially the file does not exist. It
        // only gets added during the project upgrade process.
        const indexFile = files.byName("extensions/theme/index");
        project.addSourceFileAtPath(indexFile.path);

        const source = project.getSourceFile(indexFile.path);

        insertImportToSourceFile({
            source,
            moduleSpecifier: "./global.scss",
            after: "@webiny/app-website"
        });
    }

    {
        // 5. Also remove imports of `global.scss` from `apps/admin` and `apps/website`.
        const adminAppFile = "apps/admin/src/App.scss";
        replaceInPath(adminAppFile, [
            {
                find: `// Import theme styles`,
                replaceWith: ""
            },
            {
                find: `@import "~theme/global.scss";`,
                replaceWith: ""
            }
        ]);

        const websiteIndexFile = files.byName("website/index");
        const source = project.getSourceFile(websiteIndexFile.path);

        removeImportFromSourceFile(source, `theme/global.scss`);
    }
    {
        // 6. Create new `App.scss` in `apps/website` and import it in `App.tsx`.
        const src = path.join(__dirname, "updatesForPbTheme", "filesToCopy", "App.scss");
        const dest = path.join("apps", "website", "src", "App.scss");
        await copyPasteFiles([{ src, dest }]);

        const websiteAppFile = files.byName("website/App");
        const source = project.getSourceFile(websiteAppFile.path);
        insertImportToSourceFile({
            source,
            moduleSpecifier: "./App.scss",
            after: "@webiny/app-website"
        });
    }
});
