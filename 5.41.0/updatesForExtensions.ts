import path from "path";
import fs from "fs";
import {
    addPackagesToDependencies,
    copyPasteFiles,
    createProcessor,
    insertImportToSourceFile
} from "../utils";
import { JsxElement, Node } from "ts-morph";

export const updatesForExtensions = createProcessor(async params => {
    const { project, files, context } = params;

    // 1. Create `apps/website/src/Extensions.tsx` and import it in `apps/website/src/App.tsx`.
    {
        const indexFile = files.byName("website/App");
        const source = project.getSourceFile(indexFile.path);

        const src = path.join(__dirname, "updatesForExtensions", "filesToCopy", "Extensions.tsx");
        const dest = path.join(path.dirname(indexFile.path), "Extensions.tsx");

        if (fs.existsSync(dest)) {
            context.log.warning(
                `Skipping creation of %s file and importing it in %s, already exists.`,
                "apps/website/src/Extensions.tsx",
                indexFile.path
            );
        } else {
            context.log.info(
                `Creating %s file and importing it in %s...`,
                "apps/website/src/Extensions.tsx",
                indexFile.path
            );

            await copyPasteFiles([{ src, dest }]);

            insertImportToSourceFile({
                source,
                name: ["Extensions"],
                moduleSpecifier: "./Extensions",
                after: "@webiny/app-website"
            });

            // Inject the `Extensions` component within the `Website` component.
            let selfClosing = false;
            const websiteJsxElement = source.getFirstDescendant(node => {
                if (!Node.isJsxSelfClosingElement(node) && !Node.isJsxElement(node)) {
                    return false;
                }

                const isWebsiteJsxElement = node.getText().startsWith("<Website");
                if (!isWebsiteJsxElement) {
                    return false;
                }

                selfClosing = Node.isJsxSelfClosingElement(node);
                return true;
            }) as JsxElement;

            if (selfClosing) {
                websiteJsxElement.replaceWithText(`<Website><Extensions/></Website>`);
            } else {
                const websiteJsxElementChildrenText = websiteJsxElement
                    .getFullText()
                    .replace("<Website>", "")
                    .replace("</Website>", "")
                    .trim();

                websiteJsxElement.replaceWithText(
                    `<Website><Extensions/>${websiteJsxElementChildrenText}</Website>`
                );
            }
        }
    }

    // 2. Add new `cliExtensions` collection of plugins into `webiny.project.ts`.
    {
        const file = files.byName("webiny.project.ts");
        const source = project.getSourceFile(file.path);

        const existingCliScaffoldCallExpression = source.getFirstDescendant(node => {
            return node.getText() === "cliExtensions()";
        });

        if (existingCliScaffoldCallExpression) {
            context.log.warning(
                "Could not add %s (imported via %s) in %s. Already exists.",
                "cliExtensions()",
                'import cliExtensions from "@webiny/cli-plugin-extensions";',
                file.path
            );
        } else {
            context.log.info(
                "Adding %s (imported via %s) in %s...",
                "cliExtensions()",
                'import cliExtensions from "@webiny/cli-plugin-extensions";',
                file.path
            );

            addPackagesToDependencies(context, "package.json", {
                "@webiny/cli-plugin-extensions": context.version
            });

            insertImportToSourceFile({
                source,
                name: "cliExtensions",
                moduleSpecifier: "@webiny/cli-plugin-extensions",
                after: "cliScaffold"
            });

            const cliScaffoldCallExpression = source.getFirstDescendant(node => {
                return node.getText() === "cliScaffold()";
            });

            if (cliScaffoldCallExpression) {
                cliScaffoldCallExpression.replaceWithText("cliScaffold(),cliExtensions()");
            } else {
                context.log.warning(
                    "Could not add %s (imported via %s) in %s",
                    "cliExtensions()",
                    'import cliExtensions from "@webiny/cli-plugin-extensions";',
                    file.path
                );
            }
        }
    }
});
