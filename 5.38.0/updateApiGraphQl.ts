import path from "path";
import {
    addPackagesToDependencies,
    addPluginToCreateHandler,
    createProcessor,
    insertImportToSourceFile
} from "../utils";

export const updateApiGraphQl = createProcessor(async params => {
    const { project, files, context } = params;

    const indexFile = files.byName("api/graphql/index");
    const source = project.getSourceFile(indexFile.path);

    context.log.info(`Adding new GraphQL API / Audit Logs plugins (%s)...`, indexFile.path);

    // Update theme package's package.json.
    const apiPackageJsonPath = path.join(
        context.project.root,
        "apps",
        "api",
        "graphql",
        "package.json"
    );

    const packageJson = await import(apiPackageJsonPath);
    if (packageJson.dependencies["@webiny/api-audit-logs"]) {
        context.log.warning(
            "Looks like you already have the latest GraphQL API / Audit Logs plugins set up. Skipping..."
        );
        return;
    }

    insertImportToSourceFile({
        source,
        name: ["createAuditLogs"],
        moduleSpecifier: "@webiny/api-audit-logs",
        after: "@webiny/api-headless-cms"
    });

    addPluginToCreateHandler({
        source,
        value: "createAuditLogs()",
        validate: node => {
            return node.getElements().every(element => {
                return element.getText().match("createAuditLogs") === null;
            });
        }
    });

    addPackagesToDependencies(context, apiPackageJsonPath, {
        "@webiny/api-audit-logs": context.version
    });

    context.log.success("New GraphQL API / Audit Logs plugins added.");
});
