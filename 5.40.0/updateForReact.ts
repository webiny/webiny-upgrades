import { addPackagesToResolutions, createProcessor, yarnUp } from "../utils";
import path from "path";

export const updateForReact = createProcessor(async params => {
    const { context } = params;
    /**
     * First we need to update the main package.json file.
     */
    const mainPackageJsonPath = path.join(context.project.root, "package.json");

    addPackagesToResolutions({
        context,
        targetPath: mainPackageJsonPath,
        packages: {
            "@types/react": "18.3.1",
            "@types/react-dom": "18.3.0",
            react: "18.3.1",
            "react-dom": "18.3.1",
            "@emotion/react": "11.10.8"
        }
    });
    /**
     * Next, we need to up the versions of the react, react-dom and type packages.
     */
    await yarnUp({
        react: "18.3.1",
        "react-dom": "18.3.1",
        "@types/react": "18.3.1",
        "@types/react-dom": "18.3.0",
        "@emotion/react": "11.10.8"
    });
});
