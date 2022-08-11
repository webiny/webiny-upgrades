import { Files } from "./classes/Files";
import { Project } from "ts-morph";
import { Context } from "../types";
import { insertImportToSourceFile, removeImportFromSourceFile } from "../utils";

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

    removeImportFromSourceFile(source, "@webiny/handler-aws");

    insertImportToSourceFile({
        source,
        name: {
            createApiGatewayHandler: "createHandler"
        },
        moduleSpecifier: "@webiny/handler-aws"
    });
};
