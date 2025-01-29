import { addPackagesToDevDependencies, createProcessor, yarnInstall } from "../utils";
import { readPackageVersionsFromReferencesFile } from "../utils/syncDependencies/referencesFile";

export const addDevDependencies = createProcessor(async ({ context }) => {
    const packages = await readPackageVersionsFromReferencesFile({
        context,
        packages: {
            "@babel/cli": "7.26.4",
            "@babel/code-frame": "7.26.2",
            "@babel/compat-data": "7.26.3",
            "@babel/core": "7.26.0",
            "@babel/helper-define-polyfill-provider": "0.6.3",
            "@babel/helper-environment-visitor": "7.24.7",
            "@babel/parser": "7.26.3",
            "@babel/plugin-proposal-class-properties": "7.18.6",
            "@babel/plugin-proposal-object-rest-spread": "7.20.7",
            "@babel/plugin-proposal-throw-expressions": "7.25.9",
            "@babel/plugin-syntax-object-rest-spread": "7.8.3",
            "@babel/plugin-transform-modules-commonjs": "7.26.3",
            "@babel/plugin-transform-runtime": "7.25.9",
            "@babel/preset-env": "7.26.0",
            "@babel/preset-react": "7.26.3",
            "@babel/preset-typescript": "7.26.0",
            "@babel/register": "7.25.9",
            "@babel/runtime": "7.26.0",
            "@babel/template": "7.25.9",
            "@babel/traverse": "7.26.4",
            "@babel/types": "7.26.3"
        }
    });

    const targetPath = context.project.getPackageJsonPath();

    context.log.info("Adding dev dependencies...");
    /**
     * We want to add packages to dev dependencies.
     */
    addPackagesToDevDependencies(context, targetPath, packages);

    await yarnInstall({
        quiet: true
    });

    context.log.info("...done.");
});
