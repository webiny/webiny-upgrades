import { Files } from "./classes/Files";
import { Project } from "ts-morph";
import { Context } from "../types";
import {
    addPluginToCreateHandler,
    getIsElasticsearchProject,
    insertImportToSourceFile,
    removeImportFromSourceFile,
    removePluginFromCreateHandler,
    isPre529Project
} from "../utils";
import { getGraphQLPath } from "./utils/paths";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const updateDynamoDbToElasticsearch = async (params: Params) => {
    const { context, project, files } = params;
    const apiGraphQLPath = getGraphQLPath(context);
    if (getIsElasticsearchProject(context, apiGraphQLPath) === false) {
        return;
    } else if (isPre529Project(context) === false) {
        return;
    }
    const indexFile = files.byName("ddb-es/index");
    if (!indexFile) {
        context.log.error(`Missing DynamoDB to Elasticsearch index file. Skipping...`);
        return;
    }
    const source = project.getSourceFile(indexFile.path);
    if (!source) {
        context.log.error(`Missing Source of DynamoDB to Elasticsearch index file. Skipping...`);
        return;
    }
    if (source.getText().match("createDynamoDBHandler") !== null) {
        context.log.info(
            `It seems DynamoDB to Elasticsearch index file was already upgraded. Skipping...`
        );
        return;
    }
    /**
     * Remove existing imports
     */
    removeImportFromSourceFile(source, "@webiny/handler-aws");
    removeImportFromSourceFile(source, "@webiny/api-dynamodb-to-elasticsearch/handler");
    removePluginFromCreateHandler(source, "handler", new RegExp(/dynamoDBToElastic\(\)/));
    /**
     * Then insert new imports
     */
    insertImportToSourceFile({
        source,
        name: {
            createDynamoDBHandler: "createHandler"
        },
        moduleSpecifier: "@webiny/handler-aws"
    });
    insertImportToSourceFile({
        source,
        name: ["createEventHandler"],
        moduleSpecifier: "@webiny/api-dynamodb-to-elasticsearch"
    });

    addPluginToCreateHandler({
        source,
        value: "createEventHandler()"
    });
};
