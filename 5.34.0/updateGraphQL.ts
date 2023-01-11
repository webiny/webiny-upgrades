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

    if (!indexFile) {
        context.log.error(`Missing GraphQL index file (%s).`, "skipping upgrade");
        return;
    }

    const source = project.getSourceFile(indexFile.path);

    if (!source) {
        context.log.error(`Missing Source of GraphQL index file (%s).`, "skipping upgrade");
        return;
    }
    if (source.getText().match("createACO") !== null) {
        context.log.info(
            `It seems the GraphQL index file has already been upgraded (%s).`,
            "skipping upgrade"
        );
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

    if (!typesFile) {
        context.log.error(`Missing GraphQL types file (%s).`, "skipping upgrade");
        return;
    }

    const source = project.getSourceFile(typesFile.path);

    if (!source) {
        context.log.error(`Missing Source of GraphQL types file (%s).`, "skipping upgrade");
        return;
    }

    if (source.getText().match("ACOContext") !== null) {
        context.log.info(`GraphQL types file has already been upgraded (%s).`, "skipping upgrade");
        return;
    }

    /**
     * Add folders-api package dependencies
     */
    insertImportToSourceFile({
        source,
        name: ["ACOContext"],
        moduleSpecifier: "@webiny/api-aco/types"
    });

    /**
     * Add ACOContext to types declaration
     */
    let text = source.getText();

    text = text.replace("FormBuilderContext,", "FormBuilderContext, ACOContext,");
    text = text.replace("FormBuilderContext {", "FormBuilderContext, ACOContext {");

    source.replaceWithText(text);
};
