import { addPackagesToResolutions, copyPasteFiles, createProcessor, yarnUp } from "../utils";
import path from "path";

export const updateForReact = createProcessor(async ({ context }) => {
    /**
     * First we need to update the main package.json file.
     */
    const mainPackageJsonPath = path.join(context.project.root, "package.json");

    context.log.info(`Updating React version...`);

    addPackagesToResolutions({
        context,
        targetPath: mainPackageJsonPath,
        packages: {
            "@emotion/react": "11.10.8",
            "@types/react": "18.2.79",
            "@types/react-dom": "18.2.25",
            "codex-tooltip": null,
            react: "18.2.0",
            "react-dom": "18.2.0"
        }
    });

    /**
     * Next, we need to up the versions of the react, react-dom and type packages.
     */
    await yarnUp({
        "@emotion/react": "11.10.8",
        "@types/react": "18.2.79",
        "@types/react-dom": "18.2.25",
        react: "18.2.0",
        "react-dom": "18.2.0"
    });

    /**
     * Update React app mounting.
     */
    context.log.info("Updating React application mounting...");

    const adminIndexPath = "apps/admin/src/index.tsx";
    context.log.info("Replacing the existing %s file with a new one...", adminIndexPath);
    const adminSrc = path.join(__dirname, "updatesForReact", "filesToCopy", "adminIndex.tsx");
    await copyPasteFiles([{ src: adminSrc, dest: adminIndexPath }]);

    const websiteIndexPath = "apps/website/src/index.tsx";
    context.log.info("Replacing the existing %s file with a new one...", websiteIndexPath);
    const websiteSrc = path.join(__dirname, "updatesForReact", "filesToCopy", "websiteIndex.tsx");
    await copyPasteFiles([{ src: websiteSrc, dest: websiteIndexPath }]);
});
