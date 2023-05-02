import { Project } from "ts-morph";
import { Context } from "../types";
import {
    addPackagesToDependencies,
    addPluginToCreateHandler,
    createFilePath,
    Files,
    findVersion,
    insertImportToSourceFile
} from "../utils";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const updateGraphQL = async (params: Params): Promise<void> => {
    const { context, project, files } = params;

    const indexFile = files.byName("graphql/index");
    const graphQLPackagePath = createFilePath(context, "${graphql}/package.json");
    const version = findVersion(graphQLPackagePath) || context.version;

    if (!indexFile) {
        context.log.error(`Missing GraphQL index file (%s).`, "skipping upgrade");
        return;
    }

    const source = project.getSourceFile(indexFile.path);

    if (source.getText().match("createAcoFileManagerContext") !== null) {
        context.log.info(
            `Looks like GraphQL index file has already been upgraded (%s).`,
            "skipping upgrade"
        );
        return;
    }

    /**
     * Add api-file-manager-aco dependencies to package.json
     */
    addPackagesToDependencies(context, graphQLPackagePath, {
        "@webiny/api-file-manager-aco": version
    });

    /**
     * Add api-file-manager-aco handlers to GraphQL
     */
    insertImportToSourceFile({
        source,
        after: "@webiny/api-page-builder-aco",
        name: ["createAcoFileManagerContext"],
        moduleSpecifier: "@webiny/api-file-manager-aco"
    });

    addPluginToCreateHandler({
        source,
        before: "scaffoldsPlugins",
        value: "createAcoFileManagerContext()"
    });
};
