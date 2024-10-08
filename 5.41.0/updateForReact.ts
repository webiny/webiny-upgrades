import { addPackagesToResolutions, createProcessor, yarnUp } from "../utils";

export const updateForReact = createProcessor(async ({ context }) => {
    /**
     * First we need to update the main package.json file.
     */
    const mainPackageJsonPath = context.project.getPackageJsonPath();

    context.log.info(`Updating React version...`);

    addPackagesToResolutions({
        context,
        targetPath: mainPackageJsonPath,
        packages: {
            "@types/react": "18.3.5",
            "@types/react-dom": "18.3.0",
            react: "18.3.1",
            "react-dom": "18.3.1"
        }
    });

    /**
     * Next, we need to up the versions of the react, react-dom and type packages.
     */
    await yarnUp({
        "@types/react": "18.3.5",
        "@types/react-dom": "18.3.0",
        react: "18.3.1",
        "react-dom": "18.3.1"
    });
});
