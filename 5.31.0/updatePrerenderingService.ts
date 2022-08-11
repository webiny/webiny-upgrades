import { Files } from "./classes/Files";
import { Project } from "ts-morph";
import { Context } from "../types";
import {
    insertImportToSourceFile,
    removeImportFromSourceFile,
    upgradeCreateHandlerToPlugins
} from "../utils";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const updatePrerenderingService = async (params: Params): Promise<void> => {
    await updateFlush(params);
    await updateQueueAdd(params);
    await updateQueueProcess(params);
    await updateRender(params);
};

const updateFlush = async (params: Params): Promise<void> => {
    const { context, project, files } = params;
    const indexFile = files.byName("ps/flush");
    if (!indexFile) {
        context.log.error(`Missing Prerendering Service Flush index file. Skipping...`);
        return;
    }
    const source = project.getSourceFile(indexFile.path);
    if (!source) {
        context.log.error(`Missing Source of Prerendering Service Flush index file. Skipping...`);
        return;
    }
    if (source.getText().match("createEventBridgeHandler") !== null) {
        context.log.info(
            `It seems Prerendering Service Flush index file was already upgraded. Skipping...`
        );
        return;
    }

    upgradeCreateHandlerToPlugins(source, "handler", {
        debug: false
    });

    removeImportFromSourceFile(source, "@webiny/handler-aws");

    insertImportToSourceFile({
        source,
        name: {
            createEventBridgeHandler: "createHandler"
        },
        moduleSpecifier: "@webiny/handler-aws"
    });
};

const updateQueueAdd = async (params: Params): Promise<void> => {
    const { context, project, files } = params;
    const indexFile = files.byName("ps/queue/add");
    if (!indexFile) {
        context.log.error(`Missing Prerendering Service Queue Add index file. Skipping...`);
        return;
    }
    const source = project.getSourceFile(indexFile.path);
    if (!source) {
        context.log.error(
            `Missing Source of Prerendering Service Queue Add index file. Skipping...`
        );
        return;
    }
    if (source.getText().match("createRawHandler") !== null) {
        context.log.info(
            `It seems Prerendering Service Queue Add index file was already upgraded. Skipping...`
        );
        return;
    }
    upgradeCreateHandlerToPlugins(source, "handler", {
        debug: false
    });

    removeImportFromSourceFile(source, "@webiny/handler-aws");

    insertImportToSourceFile({
        source,
        name: {
            createRawHandler: "createHandler"
        },
        moduleSpecifier: "@webiny/handler-aws"
    });
};

const updateQueueProcess = async (params: Params): Promise<void> => {
    const { context, project, files } = params;
    const indexFile = files.byName("ps/queue/process");
    if (!indexFile) {
        context.log.error(`Missing Prerendering Service Queue Process index file. Skipping...`);
        return;
    }
    const source = project.getSourceFile(indexFile.path);
    if (!source) {
        context.log.error(
            `Missing Source of Prerendering Service Queue Process index file. Skipping...`
        );
        return;
    }
    if (source.getText().match("createRawHandler") !== null) {
        context.log.info(
            `It seems Prerendering Service Queue Process index file was already upgraded. Skipping...`
        );
        return;
    }
    upgradeCreateHandlerToPlugins(source, "handler", {
        debug: false
    });

    removeImportFromSourceFile(source, "@webiny/handler-aws");

    insertImportToSourceFile({
        source,
        name: {
            createRawHandler: "createHandler"
        },
        moduleSpecifier: "@webiny/handler-aws"
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

    source.replaceWithText(text);
};

const updateRender = async (params: Params): Promise<void> => {
    const { context, project, files } = params;
    const indexFile = files.byName("ps/render");
    if (!indexFile) {
        context.log.error(`Missing Prerendering Service Render index file. Skipping...`);
        return;
    }
    const source = project.getSourceFile(indexFile.path);
    if (!source) {
        context.log.error(`Missing Source of Prerendering Service Render index file. Skipping...`);
        return;
    }
    if (source.getText().match("createRawHandler") !== null) {
        context.log.info(
            `It seems Prerendering Service Render index file was already upgraded. Skipping...`
        );
        return;
    }
    upgradeCreateHandlerToPlugins(source, "handler", {
        debug: false
    });

    removeImportFromSourceFile(source, "@webiny/handler-aws");

    insertImportToSourceFile({
        source,
        name: {
            createRawHandler: "createHandler"
        },
        moduleSpecifier: "@webiny/handler-aws"
    });
};
