import { Project } from "ts-morph";
import { Context } from "../types";
import {
    addPackagesToDependencies,
    addPluginToCreateHandler,
    createFilePath,
    findVersion,
    insertImportToSourceFile,
    Files
} from "../utils";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const updateGraphQL = async (params: Params): Promise<void> => {
    await updateIndexFile(params);
    await updateTypesFile(params);
};

const updateIndexFile = async (params: Params): Promise<void> => {
    const { context, project, files } = params;

    const indexFile = files.byName("graphql/index");
    const graphQLPackagePath = createFilePath(context, "${graphql}/package.json");
    const version = findVersion(graphQLPackagePath) || context.version;
    const source = project.getSourceFile(indexFile.path);

    if (!indexFile) {
        context.log.error(`Missing GraphQL index file. Skipping...`);
        return;
    }

    if (!source) {
        context.log.error(`Missing Source of GraphQL index file. Skipping...`);
        return;
    }
    if (source.getText().match("createACO") !== null) {
        context.log.info(`It seems GraphQL index file was already upgraded. Skipping...`);
        return;
    }

    /**
     * Add api-aco dependencies to package.json
     */
    addPackagesToDependencies(context, graphQLPackagePath, {
        "@webiny/api-aco": version
    });

    /**
     * Add api-aco handlers to GraphQL
     */
    insertImportToSourceFile({
        source,
        name: ["createACO"],
        moduleSpecifier: "@webiny/api-aco"
    });

    addPluginToCreateHandler({
        source,
        before: "scaffoldsPlugins",
        value: "createACO()"
    });
};

const updateTypesFile = (params: Params): Promise<void> => {
    const { context, project, files } = params;
    const typesFile = files.byName("graphql/types");
    const source = project.getSourceFile(typesFile.path);

    if (!typesFile) {
        context.log.error(`Missing GraphQL types file. Skipping...`);
        return;
    }

    if (!source) {
        context.log.error(`Missing Source of GraphQL types file. Skipping...`);
        return;
    }

    if (source.getText().match("ACOContext") !== null) {
        context.log.info(`It seems GraphQL types file was already upgraded. Skipping...`);
        return;
    }

    /**
     * Add folders-api package dependencies
     */
    insertImportToSourceFile({
        source,
        name: ["FoldersContext"],
        moduleSpecifier: "@webiny/api-aco/types"
    });

    /**
     * Add FoldersContext to types declaration
     */
    let text = source.getText();

    text = text.replace("FormBuilderContext,", "FormBuilderContext, FoldersContext,");
    text = text.replace("FormBuilderContext {", "FormBuilderContext, FoldersContext {");

    source.replaceWithText(text);
};
