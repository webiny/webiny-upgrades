import {
    addPackagesToDependencies,
    addPluginToCreateHandler,
    createProcessor,
    insertImportToSourceFile
} from "../utils";
import path from "path";

export const updateForLockingMechanism = createProcessor(async params => {
    const { context, project, files } = params;

    const file = files.byName("api/graphql/index");
    const source = project.getSourceFile(file.path);

    insertImportToSourceFile({
        source,
        name: ["createLockingMechanism"],
        moduleSpecifier: "@webiny/api-locking-mechanism",
        after: "@webiny/api-headless-cms"
    });

    const apiPackageJsonPath = path.join(
        context.project.root,
        "apps",
        "api",
        "graphql",
        "package.json"
    );

    addPackagesToDependencies(context, apiPackageJsonPath, {
        "@webiny/api-locking-mechanism": context.version
    });

    addPluginToCreateHandler({
        source,
        value: "createLockingMechanism()",
        after: "createHeadlessCmsGraphQL",
        validate: node => {
            return node.getElements().every(element => {
                return element.getText().match("createLockingMechanism") === null;
            });
        }
    });
});
