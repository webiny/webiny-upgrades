import {
    addPackagesToDependencies,
    addPluginToCreateHandler,
    createProcessor,
    extendInterface,
    insertImportToSourceFile
} from "../utils";
import path from "path";

export const updateForRecordLocking = createProcessor(async params => {
    const { context, project, files } = params;

    const file = files.byName("api/graphql/index");
    const source = project.getSourceFile(file.path);

    context.log.info(`Adding new GraphQL API / Record Locking plugins (%s)...`, file.path);

    insertImportToSourceFile({
        source,
        name: ["createRecordLocking"],
        moduleSpecifier: "@webiny/api-record-locking",
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
        "@webiny/api-record-locking": context.version
    });

    addPluginToCreateHandler({
        source,
        value: "createRecordLocking()",
        after: "createHeadlessCmsGraphQL",
        validate: node => {
            return node.getElements().every(element => {
                return element.getText().match("createRecordLocking") === null;
            });
        }
    });

    // Update GraphQL types.ts file adding "WebsocketsContext".
    const graphQlTypesFile = files.byName("api/graphql/types");
    const graphQlTypesSource = project.getSourceFile(graphQlTypesFile.path);

    insertImportToSourceFile({
        source: graphQlTypesSource,
        name: {
            Context: "RecordLockingContext"
        },
        moduleSpecifier: "@webiny/api-record-locking/types",
        after: "@webiny/api-headless-cms-tasks"
    });

    extendInterface({
        source: graphQlTypesSource,
        target: "Context",
        add: "RecordLockingContext"
    });
});
