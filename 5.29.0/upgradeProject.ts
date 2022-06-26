import {
    removeImportFromSourceFile,
    insertImportToSourceFile,
    getRequireFromSourceFile,
    getSourceFile,
    addPackagesToDependencies,
    createMorphProject,
    prettierFormat,
    yarnInstall
} from "../utils";
import fs from "fs-extra";
import path from "path";
import { Context } from "../types";

const tagResourcesFiles = [
    "api/pulumi/index.ts",
    "apps/admin/pulumi/index.ts",
    "apps/website/pulumi/index.ts"
];

const uploadFolderToS3Files = ["apps/admin/cli/deploy.ts", "apps/website/cli/deploy.ts"];
const renderWebsiteFile = "apps/website/cli/renderWebsite.ts";

const files = [...tagResourcesFiles, ...uploadFolderToS3Files, renderWebsiteFile];

export const upgradeProject = async (context: Context) => {
    const project = createMorphProject(files);

    // Update import path of `uploadFolderToS3Files` utility
    for (const file of uploadFolderToS3Files) {
        const source = getSourceFile(project, file);
        if (!source) {
            continue;
        }

        getRequireFromSourceFile(
            source,
            "@webiny/cli-plugin-deploy-pulumi/utils/aws/uploadFolderToS3",
            node =>
                node.replaceWithText(`const { uploadFolderToS3 } = require("@webiny/pulumi-aws")`)
        );

        getRequireFromSourceFile(
            source,
            "@webiny/cli-plugin-deploy-pulumi/utils/getStackOutput",
            node =>
                node.replaceWithText(
                    `const { getStackOutput } = require("@webiny/cli-plugin-deploy-pulumi/utils")`
                )
        );
    }

    // Update import path of `tagResourcesFiles` utility
    for (const file of tagResourcesFiles) {
        const source = getSourceFile(project, file);
        if (!source) {
            continue;
        }

        removeImportFromSourceFile(source, "@webiny/pulumi-sdk", { quiet: true });
        removeImportFromSourceFile(source, "@webiny/cli-plugin-deploy-pulumi/utils", {
            quiet: true
        });

        insertImportToSourceFile({
            source,
            name: ["tagResources"],
            moduleSpecifier: "@webiny/pulumi-aws"
        });
    }

    // Replace `renderWebsite` plugin.
    await fs.copy(path.join(__dirname, "renderWebsite.tpl.ts"), renderWebsiteFile);

    // Add `@webiny/pulumi-aws` dependency to the entire project.
    addPackagesToDependencies(context, "package.json", {
        "@webiny/pulumi-aws": context.version
    });

    // Save file changes.
    await project.save();

    // Format updated files.
    await prettierFormat(files);

    // Install dependencies.
    await yarnInstall();
};
