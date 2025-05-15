import { addPluginToCreateHandler, createProcessor, removePluginFromCreateHandler } from "../utils";

export const updateCreateAco = createProcessor(async params => {
    const { context, files, project } = params;

    const graphQlIndex = files.byName("api/graphql/index");

    if (!graphQlIndex) {
        context.log.error(`Missing GraphQL index file (%s).`, "skipping upgrade");
        return;
    }

    const source = project.getSourceFile(graphQlIndex.path);

    removePluginFromCreateHandler(source, "handler", /^createAco\(\)$/);

    addPluginToCreateHandler({
        source,
        value: `createAco({
                documentClient
            })`,
        before: "createAcoPageBuilderContext()"
    });
});
