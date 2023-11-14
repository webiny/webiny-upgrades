import path from "path";
import {
    addPackagesToDependencies,
    addPluginToCreateHandler,
    createProcessor,
    insertImportToSourceFile
} from "../utils";

export const updateApiGraphQl = createProcessor(async params => {
    const { project, files, context } = params;

    // Update theme package's package.json.
    const apiPackageJsonPath = path.join(
        context.project.root,
        "apps",
        "api",
        "graphql",
        "package.json"
    );

    addPackagesToDependencies(context, apiPackageJsonPath, {
        "@webiny/api-audit-logs": context.version
    });

    const indexFile = files.byName("api/graphql/index");
    const source = project.getSourceFile(indexFile.path);

    insertImportToSourceFile({
        source,
        name: ["createAuditLogs"],
        moduleSpecifier: "@webiny/api-audit-logs",
        after: "@webiny/api-headless-cms"
    });

    addPluginToCreateHandler({
        source,
        after: "createHeadlessCmsContext",
        value: "createAuditLogs()",
        validate: node => {
            return node.getElements().every(element => {
                return element.getText().match("createAuditLogs") === null;
            });
        }
    });
});