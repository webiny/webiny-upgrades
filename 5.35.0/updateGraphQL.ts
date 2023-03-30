import { Project } from "ts-morph";
import { Context } from "../types";
import {
    addPackagesToDependencies,
    addPluginToCreateHandler,
    createFilePath,
    Files,
    findVersion,
    getGraphQLPath,
    getIsElasticsearchProject,
    insertImportToSourceFile,
    removeImportFromSourceFile,
    removePluginFromCreateHandler
} from "../utils";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const updateGraphQL = async (params: Params): Promise<void> => {
    await updateIndexFile(params);
};

const updateIndexFile = async (params: Params): Promise<void> => {
    const { context, project, files } = params;

    const indexFile = files.byName("graphql/index");
    const graphQLPackagePath = createFilePath(context, "${graphql}/package.json");
    const version = findVersion(graphQLPackagePath) || context.version;

    if (!indexFile) {
        context.log.error(`Missing GraphQL index file (%s).`, "skipping upgrade");
        return;
    }

    const isElasticsearchProject = getIsElasticsearchProject(context, getGraphQLPath(context));

    const source = project.getSourceFile(indexFile.path);

    if (source.getText().match("createFileManagerContext") !== null) {
        context.log.info(
            `Looks like GraphQL index file has already been upgraded (%s).`,
            "skipping upgrade"
        );
        return;
    }

    removeImportFromSourceFile(source, "@webiny/api-file-manager/plugins");
    removeImportFromSourceFile(source, "@webiny/api-file-manager-ddb");
    removePluginFromCreateHandler(source, "handler", "fileManagerPlugins");
    removePluginFromCreateHandler(source, "handler", "fileManagerDynamoDbStorageOperation");

    insertImportToSourceFile({
        source,
        after: "@webiny/db-dynamodb/plugins",
        name: ["createFileManagerContext", "createFileManagerGraphQL"],
        moduleSpecifier: "@webiny/api-file-manager"
    });

    if (isElasticsearchProject) {
        insertImportToSourceFile({
            source,
            name: ["createFileManagerStorageOperations"],
            moduleSpecifier: "@webiny/api-file-manager-ddb-es",
            after: "@webiny/api-file-manager"
        });

        addPluginToCreateHandler({
            source,
            value: `createFileManagerContext({
                storageOperations: createFileManagerStorageOperations({ documentClient, elasticsearchClient })
            })`,
            before: "fileManagerS3()"
        });
    } else {
        insertImportToSourceFile({
            source,
            name: ["createFileManagerStorageOperations"],
            moduleSpecifier: "@webiny/api-file-manager-ddb",
            after: "@webiny/api-file-manager"
        });

        addPluginToCreateHandler({
            source,
            value: `createFileManagerContext({
                storageOperations: createFileManagerStorageOperations({ documentClient })
            })`,
            before: "fileManagerS3()"
        });
    }

    addPluginToCreateHandler({
        source,
        value: "createFileManagerGraphQL()",
        before: "fileManagerS3()"
    });

    /**
     * Add api-page-builder-aco dependencies to package.json
     */
    addPackagesToDependencies(context, graphQLPackagePath, {
        "@webiny/api-page-builder-aco": version
    });

    /**
     * Add api-page-builder-aco handlers to GraphQL
     */
    insertImportToSourceFile({
        source,
        name: ["createAcoPageBuilderContext"],
        moduleSpecifier: "@webiny/api-page-builder-aco"
    });

    addPluginToCreateHandler({
        source,
        before: "scaffoldsPlugins",
        value: "createAcoPageBuilderContext()"
    });
};
