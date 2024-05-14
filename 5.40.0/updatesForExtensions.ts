import path from "path";
import fs from "fs";
import {
    addPluginToCreateHandler,
    createProcessor,
    insertImportToSourceFile,
    removeWorkspaceFromRootPackageJson,
    copyPaste,
    addWorkspaceToRootPackageJson,
    addPackagesToDependencies
} from "../utils";
import { JsxElement, Node } from "ts-morph";

export const updatesForExtensions = createProcessor(async params => {
    const { project, files, context } = params;

    // 1. Create `apps/api/graphql/src/extensions.ts` and import it in `apps/api/graphql/src/index.ts`.
    {
        const indexFile = files.byName("api/graphql/index");
        const source = project.getSourceFile(indexFile.path);

        const src = path.join(__dirname, "updatesForExtensions", "filesToCopy", "extensions.ts");
        const dest = path.join(path.dirname(indexFile.path), "extensions.ts");

        if (fs.existsSync(dest)) {
            context.log.warning(
                `Skipping creation of %s file and importing it in %s, already exists.`,
                "apps/api/graphql/src/extensions.ts",
                indexFile.path
            );
        } else {
            context.log.info(
                `Creating %s file and importing it in %s...`,
                "apps/api/graphql/src/extensions.ts",
                indexFile.path
            );

            await copyPaste(src, dest);

            insertImportToSourceFile({
                source,
                name: ["extensions"],
                moduleSpecifier: "./extensions",
                after: "./plugins/scaffolds"
            });

            addPluginToCreateHandler({
                source,
                value: "extensions()",
                after: "scaffoldsPlugins",
                validate: node => {
                    return node.getElements().every(element => {
                        return element.getText().match("extensions") === null;
                    });
                }
            });
        }
    }

    // 2. Create `apps/admin/src/Extensions.tsx` and import it in `apps/admin/src/App.tsx`.
    {
        const indexFile = files.byName("admin/App");
        const source = project.getSourceFile(indexFile.path);

        const src = path.join(__dirname, "updatesForExtensions", "filesToCopy", "Extensions.tsx");
        const dest = path.join(path.dirname(indexFile.path), "Extensions.tsx");

        if (fs.existsSync(dest)) {
            context.log.warning(
                `Skipping creation of %s file and importing it in %s, already exists.`,
                "apps/admin/src/Extensions.tsx",
                indexFile.path
            );
        } else {
            context.log.info(
                `Creating %s file and importing it in %s...`,
                "apps/admin/src/Extensions.tsx",
                indexFile.path
            );

            await copyPaste(src, dest);

            insertImportToSourceFile({
                source,
                name: ["Extensions"],
                moduleSpecifier: "./Extensions",
                after: "@webiny/app-serverless-cms"
            });

            // Inject the `Extensions` component within the `Admin` component.
            const adminJsxElement = source.getFirstDescendant(node => {
                if (!Node.isJsxElement(node)) {
                    return false;
                }

                return node.getText().startsWith("<Admin>");
            }) as JsxElement;

            const adminJsxElementChildrenText = adminJsxElement
                .getFullText()
                .replace("<Admin>", "")
                .replace("</Admin>", "")
                .trim();

            adminJsxElement.replaceWithText(
                `<Admin><Extensions/>${adminJsxElementChildrenText}</Admin>`
            );
        }
    }

    // 3. Create `extensions` folder and a `README.md` file in it.
    {
        const src = path.join(__dirname, "updatesForExtensions", "filesToCopy", "extensions");
        const dest = "extensions";

        if (fs.existsSync(dest)) {
            context.log.warning("Skipping creation of %s folder, already exists.", dest);
        } else {
            context.log.info("Creating %s folder...", dest);
            await copyPaste(src, dest);
        }
    }

    // 4. Move `apps/theme` to `extensions` folder.
    {
        const src = path.join("apps", "theme");
        const dest = path.join("extensions", "theme");

        if (fs.existsSync(dest)) {
            context.log.warning("Skipping moving %s folder to %s, already done.", src, dest);
        } else {
            context.log.info("Moving %s folder to %s...", src, dest);
            await copyPaste(src, dest);
            fs.rmSync(src, { recursive: true });

            await removeWorkspaceFromRootPackageJson(["apps/theme"]);
            await addWorkspaceToRootPackageJson(["extensions/theme"]);
        }
    }

    // 5. Add new `cliScaffoldExtensions` collection of plugins into `webiny.project.ts`.
    {
        const file = files.byName("webiny.project.ts");
        const source = project.getSourceFile(file.path);

        const existingCliScaffoldCallExpression = source.getFirstDescendant(node => {
            return node.getText() === "cliScaffoldExtensions()";
        });

        if (existingCliScaffoldCallExpression) {
            context.log.warning(
                "Could not add %s (imported via %s) in %s. Already exists.",
                "cliScaffoldExtensions()",
                'import cliScaffoldExtensions from "@webiny/cli-plugin-scaffold-extensions";',
                file.path
            );
        } else {
            context.log.info(
                "Adding %s (imported via %s) in %s...",
                "cliScaffoldExtensions()",
                'import cliScaffoldExtensions from "@webiny/cli-plugin-scaffold-extensions";',
                file.path
            );

            addPackagesToDependencies(context, "package.json", {
                "@webiny/cli-plugin-scaffold-extensions": context.version
            });

            insertImportToSourceFile({
                source,
                name: "cliScaffoldExtensions",
                moduleSpecifier: "@webiny/cli-plugin-scaffold-extensions",
                after: "cliScaffold"
            });

            const cliScaffoldCallExpression = source.getFirstDescendant(node => {
                return node.getText() === "cliScaffold()";
            });

            if (cliScaffoldCallExpression) {
                cliScaffoldCallExpression.replaceWithText("cliScaffold(),cliScaffoldExtensions()");
            } else {
                context.log.warning(
                    "Could not add %s (imported via %s) in %s",
                    "cliScaffoldExtensions()",
                    'import cliScaffoldExtensions from "@webiny/cli-plugin-scaffold-extensions";',
                    file.path
                );
            }
        }
    }
});
