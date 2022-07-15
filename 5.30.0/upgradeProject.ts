import {
    removeImportFromSourceFile,
    insertImportToSourceFile,
    getCreateHandlerExpressions,
    createMorphProject,
    prettierFormat,
    yarnInstall,
    getIsElasticsearchProject,
    addPluginToCreateHandler
} from "../utils";
import { Context } from "../types";
import { SourceFile } from "ts-morph";

const graphQLIndex = "apps/api/graphql/src/index.ts";
const headlessCMSIndex = "apps/api/headlessCMS/src/index.ts";
const files = [graphQLIndex, headlessCMSIndex];

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
    text = text.replaceAll("elasticsearchDataGzipCompression(),", "");
    text = text.replaceAll("elasticsearchDataGzipCompression()", "");

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
    text = text.replaceAll("elasticsearchDataGzipCompression(),", "");
    text = text.replaceAll("elasticsearchDataGzipCompression()", "");

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
        removeImportFromSourceFile(source, "@webiny/api-elasticsearch/plugins/GzipCompression");
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

    const isElasticsearch = getIsElasticsearchProject(context, "apps/api/graphql");
    /**
     * And in the end we add the new imports
     */
    for (const file of files) {
        const source = project.getSourceFile(file);

        insertImportToSourceFile({
            source,
            name: ["createHeadlessCmsGraphQL", "createHeadlessCmsContext"],
            moduleSpecifier: "@webiny/api-headless-cms"
        });
        if (!isElasticsearch) {
            continue;
        }
        insertImportToSourceFile({
            source,
            name: ["createGzipCompression"],
            moduleSpecifier: "@webiny/api-elasticsearch/plugins/GzipCompression"
        });
        addPluginToCreateHandler({
            source,
            handler: "handler",
            value: "createGzipCompression()"
        });
    }

    // Save file changes.
    await project.save();

    // Format updated files.
    await prettierFormat(files);

    // Install dependencies.
    await yarnInstall();
};
