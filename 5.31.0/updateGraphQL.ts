import { Files } from "./classes/Files";
import { Project } from "ts-morph";
import { Context } from "../types";
import {
    addPackagesToDependencies,
    addPluginToCreateHandler,
    findVersion,
    insertImportToSourceFile,
    removeImportFromSourceFile
} from "../utils";
import { createFilePath } from "./utils/paths";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const updateGraphQL = async ({ context, project, files }: Params): Promise<void> => {
    const indexFile = files.byName("graphql");
    if (!indexFile) {
        context.log.error(`Missing GraphQL index file. Skipping...`);
        return;
    }
    const source = project.getSourceFile(indexFile.path);
    if (!source) {
        context.log.error(`Missing Source of GraphQL index file. Skipping...`);
        return;
    }
    if (source.getText().match("createApiGatewayHandler") !== null) {
        context.log.info(`It seems GraphQL index file was already upgraded. Skipping...`);
        return;
    }
    /**
     * We need to fix the handler first.
     */
    removeImportFromSourceFile(source, "@webiny/handler-aws");

    insertImportToSourceFile({
        source,
        name: {
            createApiGatewayHandler: "createHandler"
        },
        moduleSpecifier: "@webiny/handler-aws"
    });
    /**
     * Then we need to add the APW
     */
    const graphQLPath = createFilePath(context, "${graphql}/package.json");
    const version = findVersion(graphQLPath) || context.version;

    addPackagesToDependencies(context, graphQLPath, {
        "@webiny/api-apw": version,
        "@webiny/api-apw-scheduler-so-ddb": version
    });

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
        after: "createHeadlessCmsContext",
        value: "createApwGraphQL()"
    });
    addPluginToCreateHandler({
        source,
        after: "createApwGraphQL",
        value: "createApwPageBuilderContext({storageOperations: createApwSaStorageOperations({ documentClient })})"
    });

    /**
     * There is a possibility that some process.env variables are not set as strings, so lets add those.
     * We will do that with plain string replace
     */
    let text = source.getText();

    text = text.replace(
        "render: process.env.PRERENDERING_RENDER_HANDLER",
        "render: String(process.env.PRERENDERING_RENDER_HANDLER)"
    );
    text = text.replace(
        "flush: process.env.PRERENDERING_FLUSH_HANDLER",
        "flush: String(process.env.PRERENDERING_FLUSH_HANDLER)"
    );
    text = text.replace(
        "add: process.env.PRERENDERING_QUEUE_ADD_HANDLER",
        "add: String(process.env.PRERENDERING_QUEUE_ADD_HANDLER)"
    );
    text = text.replace(
        "process: process.env.PRERENDERING_QUEUE_PROCESS_HANDLER",
        "process: String(process.env.PRERENDERING_QUEUE_PROCESS_HANDLER)"
    );

    source.replaceWithText(text);
};
