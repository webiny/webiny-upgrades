import {
    addPackagesToDependencies,
    createProcessor,
    removeImportFromSourceFile,
    removePluginFromCreateHandler
} from "../utils";

export const removeHandlerLogs = createProcessor(async params => {
    const { context, files, project } = params;

    const graphQlIndex = files.byName("api/graphql/index");
    const graphQlPackageJson = files.byName("api/package.json");

    const source = project.getSourceFile(graphQlIndex.path);
    /**
     * Remove everything related to handler-logs
     */
    removeImportFromSourceFile(source, "@webiny/handler-logs");
    removePluginFromCreateHandler(source, "handler", "logsPlugins()");
    addPackagesToDependencies(context, graphQlPackageJson.path, {
        "@webiny/handler-logs": null
    });
});
