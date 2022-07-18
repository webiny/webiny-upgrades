import {
    removeImportFromSourceFile,
    insertImportToSourceFile,
    getCreateHandlerExpressions,
    createMorphProject,
    prettierFormat,
    yarnInstall,
    isPre529Project,
    addPluginToCreateHandler,
    addPackagesToDependencies
} from "../utils";
import { Context } from "../types";
import { SourceFile } from "ts-morph";

const getGraphQLPath = context => {
    if (isPre529Project(context)) {
        return "api/code/graphql";
    }
    return "apps/api/graphql";
};
const graphQLIndex = `src/index.ts`;
const getHeadlessCMSPath = context => {
    if (isPre529Project(context)) {
        return "api/code/headlessCMS";
    }
    return "apps/api/headlessCMS";
};
const headlessCMSIndex = `src/index.ts`;

const replaceGraphQLIndexPlugins = (source: SourceFile): void => {
    const { arrayExpression } = getCreateHandlerExpressions(source, "handler");
    let text = arrayExpression.getText();
    text = text.replaceAll("createAdminHeadlessCmsContext", "createHeadlessCmsContext");
    text = text.replaceAll("createAdminHeadlessCmsGraphQL", "createHeadlessCmsGraphQL");
    text = text.replaceAll(
        "modelFieldToGraphQLPlugins: headlessCmsModelFieldToGraphQLPlugins(),",
        ""
    );
    text = text.replaceAll(
        "modelFieldToGraphQLPlugins: headlessCmsModelFieldToGraphQLPlugins()",
        ""
    );

    arrayExpression.replaceWithText(text);
};

const replaceHeadlessCMSIndexPlugins = (source: SourceFile): void => {
    const { arrayExpression } = getCreateHandlerExpressions(source, "handler");
    let text = arrayExpression.getText();
    text = text.replaceAll("createContentHeadlessCmsContext", "createHeadlessCmsContext");
    text = text.replaceAll("createContentHeadlessCmsGraphQL", "createHeadlessCmsGraphQL");
    text = text.replaceAll(
        "modelFieldToGraphQLPlugins: headlessCmsModelFieldToGraphQLPlugins(),",
        ""
    );
    text = text.replaceAll(
        "modelFieldToGraphQLPlugins: headlessCmsModelFieldToGraphQLPlugins()",
        ""
    );

    arrayExpression.replaceWithText(text);
};

const addApwToGraphQL = (context: Context, source: SourceFile): void => {
    if (isPre529Project(context)) {
        return;
    }
    insertImportToSourceFile({
        source,
        name: ["createApwPageBuilderContext", "createApwGraphQL"],
        moduleSpecifier: "@webiny/api-apw"
    });
    insertImportToSourceFile({
        source,
        name: {
            createStorageOperations: "createApwSaStorageOperations"
        },
        moduleSpecifier: "@webiny/api-apw-scheduler-so-ddb"
    });
    addPluginToCreateHandler({
        source,
        handler: "handler",
        value: `
        createApwGraphQL(),
        createApwPageBuilderContext({
            storageOperations: createApwSaStorageOperations({ documentClient })
        })`,
        after: "createHeadlessCmsGraphQL"
    });

    addPackagesToDependencies(context, `${getGraphQLPath(context)}/package.json`, {
        "@webiny/api-apw": `${context.version}`,
        "@webiny/api-apw-scheduler-so-ddb": `${context.version}`
    });
};

const addApwToHeadlessCMS = (context: Context, source: SourceFile): void => {
    if (isPre529Project(context)) {
        return;
    }
    insertImportToSourceFile({
        source,
        name: ["createApwHeadlessCmsContext"],
        moduleSpecifier: "@webiny/api-apw"
    });
    insertImportToSourceFile({
        source,
        name: {
            createStorageOperations: "createApwSaStorageOperations"
        },
        moduleSpecifier: "@webiny/api-apw-scheduler-so-ddb"
    });
    addPluginToCreateHandler({
        source,
        handler: "handler",
        value: `
        createApwHeadlessCmsContext({
            storageOperations: createApwSaStorageOperations({ documentClient })
        })`,
        after: "createHeadlessCmsContext"
    });
    addPackagesToDependencies(context, `${getHeadlessCMSPath(context)}/package.json`, {
        "@webiny/api-apw": `${context.version}`,
        "@webiny/api-apw-scheduler-so-ddb": `${context.version}`
    });
};

const getAppsAdminPath = context => {
    if (isPre529Project(context)) {
        return `apps/admin/code`;
    }
    return `apps/admin`;
};

const appsAdminPlugins = {
    "@webiny/app-page-builder/editor/recoil/actions/plugins": "actionPlugins()",
    "@webiny/app-page-builder/editor/plugins/background": "contentBackground",
    "@webiny/app-page-builder/editor/plugins/blockEditing": "blockEditing",
    "@webiny/app-page-builder/editor/plugins/breadcrumbs": "breadcrumbs",
    "@webiny/app-page-builder/editor/plugins/defaultBar": "defaultBarPlugins",
    "@webiny/app-page-builder/editor/plugins/elementActions/help": "help",
    "@webiny/app-page-builder/editor/plugins/elementSettings/advanced": "advanced"
};

const removeAppsAdminPlugins = (source: SourceFile): void => {
    for (const target in appsAdminPlugins) {
        removeImportFromSourceFile(source, target);
    }
    let text = source.getText();
    for (const t in appsAdminPlugins) {
        const value = appsAdminPlugins[t];
        text = text.replaceAll(`${value},`, "");
        text = text.replaceAll(`${value}`, "");
    }
    source.replaceWithText(text);
};

export const upgradeProject = async (context: Context) => {
    const editorPluginsFile = `${getAppsAdminPath(
        context
    )}/src/plugins/pageBuilder/editorPlugins.ts`;
    const graphQLIndexFile = `${getGraphQLPath(context)}/${graphQLIndex}`;
    const headlessCMSIndexFile = `${getHeadlessCMSPath(context)}/${headlessCMSIndex}`;
    const files = [graphQLIndexFile, headlessCMSIndexFile, editorPluginsFile];
    const project = createMorphProject(files);

    /**
     * First we are going to remove old imports
     */
    for (const file of [graphQLIndexFile, headlessCMSIndexFile]) {
        const source = project.getSourceFile(file);

        removeImportFromSourceFile(source, "@webiny/api-headless-cms");
        removeImportFromSourceFile(
            source,
            "@webiny/api-headless-cms/content/plugins/graphqlFields"
        );
    }
    /**
     * And modify the usages of imports.
     * Fist in the GraphQL
     */
    const graphQLIndexSource = project.getSourceFile(graphQLIndexFile);
    replaceGraphQLIndexPlugins(graphQLIndexSource);

    /**
     * Then in the HeadlessCMS
     */
    const headlessCMSIndexSource = project.getSourceFile(headlessCMSIndexFile);
    replaceHeadlessCMSIndexPlugins(headlessCMSIndexSource);
    /**
     * And in the end we add the new imports
     */
    for (const file of [graphQLIndexFile, headlessCMSIndexFile]) {
        const source = project.getSourceFile(file);

        insertImportToSourceFile({
            source,
            name: ["createHeadlessCmsGraphQL", "createHeadlessCmsContext"],
            moduleSpecifier: "@webiny/api-headless-cms"
        });
    }
    /**
     * We are adding APW to the GraphQL and HeadlessCMS lambdas
     */
    addApwToGraphQL(context, graphQLIndexSource);
    addApwToHeadlessCMS(context, headlessCMSIndexSource);

    /**
     * We need to remove some imports and plugins from apps/admin
     */
    const editorPluginsSource = project.getSourceFile(editorPluginsFile);
    removeAppsAdminPlugins(editorPluginsSource);

    // Save file changes.
    await project.save();

    // Format updated files.
    await prettierFormat(files);

    // Install dependencies.
    await yarnInstall();
};
