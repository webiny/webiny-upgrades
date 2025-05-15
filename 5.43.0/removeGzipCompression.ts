import { createProcessor, removePluginFromCreateHandler } from "../utils/index.js";

export const removeGzipCompression = createProcessor(async ({ context, files, project }) => {
    const file = files.byName("api/graphql/index");
    if (!file) {
        context.log.error(`File "api/graphql/index" not found.`);
        return;
    }
    const source = project.getSourceFile(file.path);
    if (!source) {
        context.log.error(`File "${file.path}" not found.`);
        return;
    }

    removePluginFromCreateHandler(source, "handler", "createGzipCompression()");

    const text = source.getText().replace("createGzipCompression", "");

    source.replaceWithText(text);
});
