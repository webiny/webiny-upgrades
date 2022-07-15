import {
    removeImportFromSourceFile,
    insertImportToSourceFile,
    getRequireFromSourceFile,
    getSourceFile,
    addPackagesToDependencies,
    removePluginFromCreateHandler,
    getCreateHandlerExpressions,
    createMorphProject,
    prettierFormat,
    yarnInstall
} from "../utils";
import { Context } from "../types";
import { ArrayLiteralExpression, SourceFile } from "ts-morph";

const graphQLIndex = "apps/api/graphql/src/index.ts";
const headlessCMSIndex = "apps/api/headlessCMS/src/index.ts";
const files = [graphQLIndex, headlessCMSIndex];

const replaceGraphQLIndexPlugins = (source: SourceFile): void => {
    const { arrayExpression } = getCreateHandlerExpressions(source, "handler");
    let text = arrayExpression.getText();
    text = text.replace("createAdminHeadlessCmsContext", "createHeadlessCmsContext");
    text = text.replace("createAdminHeadlessCmsGraphQL", "createHeadlessCmsGraphQL");
    text = text.replace("modelFieldToGraphQLPlugins: headlessCmsModelFieldToGraphQLPlugins()", "");
    text = text.replace("modelFieldToGraphQLPlugins: headlessCmsModelFieldToGraphQLPlugins(),", "");

    arrayExpression.replaceWithText(text);
};

const replaceHeadlessCMSIndexPlugins = (source: SourceFile): void => {
    const { arrayExpression } = getCreateHandlerExpressions(source, "handler");
    let text = arrayExpression.getText();
    text = text.replace("createContentHeadlessCmsContext", "createHeadlessCmsContext");
    text = text.replace("createContentHeadlessCmsGraphQL", "createHeadlessCmsGraphQL");
    text = text.replace("modelFieldToGraphQLPlugins: headlessCmsModelFieldToGraphQLPlugins()", "");
    text = text.replace("modelFieldToGraphQLPlugins: headlessCmsModelFieldToGraphQLPlugins(),", "");

    arrayExpression.replaceWithText(text);
};

export const upgradeProject = async (context: Context) => {
    const project = createMorphProject(files);

    /**
     * First we are going to remove old imports
     */
    for (const file of files) {
        const source = project.getSourceFile(file);

        removeImportFromSourceFile(source, "@webiny/api-headless-cms");
        removeImportFromSourceFile(
            source,
            "@webiny/api-headless-cms/content/plugins/graphqlFields"
        );
    }
    /**
     * Then we add the new ones
     */
    for (const file of files) {
        const source = project.getSourceFile(file);

        insertImportToSourceFile({
            source,
            name: ["createHeadlessCmsGraphQL", "createHeadlessCmsContext"],
            moduleSpecifier: "@webiny/api-headless-cms"
        });
    }
    /**
     * And modify the usages of imports.
     * Fist in the GraphQL
     */
    const graphQLIndexSource = project.getSourceFile(graphQLIndex);
    replaceGraphQLIndexPlugins(graphQLIndexSource);

    /**
     * Then in the HeadlessCMS
     */
    const headlessCMSIndexSource = project.getSourceFile(headlessCMSIndex);
    replaceHeadlessCMSIndexPlugins(headlessCMSIndexSource);

    // Save file changes.
    await project.save();

    // Format updated files.
    await prettierFormat(files);

    // Install dependencies.
    await yarnInstall();
};
