import { Project } from "ts-morph";
import { Context, IFiles } from "../types";
import { insertImportToSourceFile, isPre529Project, removeImportFromSourceFile } from "../utils";

interface Params {
    files: IFiles;
    project: Project;
    context: Context;
}

export const updatePageBuilder = async (params: Params): Promise<void> => {
    if (isPre529Project(params.context) === false) {
        return;
    }
    await updateExportPagesCombine(params);
    await updateExportPagesProcess(params);
    await updateImportPagesCreate(params);
    await updateImportPagesProcess(params);
    await updateSettings(params);
};

const updateExportPagesCombine = async (params: Params): Promise<void> => {
    const { context, project, files } = params;
    const indexFile = files.byName("pb/exportPages/combine");
    if (!indexFile) {
        context.log.error(`Missing Page Builder Export Pages Combine index file. Skipping...`);
        return;
    }
    const source = project.getSourceFile(indexFile.path);
    if (!source) {
        context.log.error(
            `Missing Source of Page Builder Export Pages Combine index file. Skipping...`
        );
        return;
    }
    if (source.getText().match("createRawHandler") !== null) {
        context.log.info(
            `It seems Page Builder Export Pages Combine index file was already upgraded. Skipping...`
        );
        return;
    }
    removeImportFromSourceFile(source, "@webiny/handler-aws");

    insertImportToSourceFile({
        source,
        name: {
            createRawHandler: "createHandler"
        },
        moduleSpecifier: "@webiny/handler-aws"
    });
};

const updateExportPagesProcess = async (params: Params): Promise<void> => {
    const { context, project, files } = params;
    const indexFile = files.byName("pb/exportPages/process");
    if (!indexFile) {
        context.log.error(`Missing Page Builder Export Pages Process index file. Skipping...`);
        return;
    }
    const source = project.getSourceFile(indexFile.path);
    if (!source) {
        context.log.error(
            `Missing Source of Page Builder Export Pages Process index file. Skipping...`
        );
        return;
    }
    if (source.getText().match("createRawHandler") !== null) {
        context.log.info(
            `It seems Page Builder Export Pages Process index file was already upgraded. Skipping...`
        );
        return;
    }
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
        "process: process.env.AWS_LAMBDA_FUNCTION_NAME",
        "process: String(process.env.AWS_LAMBDA_FUNCTION_NAME)"
    );
    text = text.replace(
        "combine: process.env.EXPORT_PAGE_COMBINE_HANDLER",
        "combine: String(process.env.EXPORT_PAGE_COMBINE_HANDLER)"
    );

    source.replaceWithText(text);
};

const updateImportPagesCreate = async (params: Params): Promise<void> => {
    const { context, project, files } = params;
    const indexFile = files.byName("pb/importPages/create");
    if (!indexFile) {
        context.log.error(`Missing Page Builder Import Pages Create index file. Skipping...`);
        return;
    }
    const source = project.getSourceFile(indexFile.path);
    if (!source) {
        context.log.error(
            `Missing Source of Page Builder Import Pages Create index file. Skipping...`
        );
        return;
    }
    if (source.getText().match("createRawHandler") !== null) {
        context.log.info(
            `It seems Page Builder Import Pages Create index file was already upgraded. Skipping...`
        );
        return;
    }
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
        "process: process.env.IMPORT_PAGE_QUEUE_PROCESS_HANDLER",
        "process: String(process.env.IMPORT_PAGE_QUEUE_PROCESS_HANDLER)"
    );

    source.replaceWithText(text);
};

const updateImportPagesProcess = async (params: Params): Promise<void> => {
    const { context, project, files } = params;
    const indexFile = files.byName("pb/importPages/process");
    if (!indexFile) {
        context.log.error(`Missing Page Builder Import Pages Process index file. Skipping...`);
        return;
    }
    const source = project.getSourceFile(indexFile.path);
    if (!source) {
        context.log.error(
            `Missing Source of Page Builder Import Pages Process index file. Skipping...`
        );
        return;
    }
    if (source.getText().match("createRawHandler") !== null) {
        context.log.info(
            `It seems Page Builder Import Pages Process index file was already upgraded. Skipping...`
        );
        return;
    }
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
        "process: process.env.AWS_LAMBDA_FUNCTION_NAME",
        "process: String(process.env.AWS_LAMBDA_FUNCTION_NAME)"
    );

    source.replaceWithText(text);
};

const updateSettings = async (params: Params): Promise<void> => {
    const { context, project, files } = params;
    const indexFile = files.byName("pb/updateSettings");
    if (!indexFile) {
        context.log.error(`Missing Page Builder Update Settings index file. Skipping...`);
        return;
    }
    const source = project.getSourceFile(indexFile.path);
    if (!source) {
        context.log.error(`Missing Source of Page Builder Update Settings index file. Skipping...`);
        return;
    }
    if (source.getText().match("createRawHandler") !== null) {
        context.log.info(
            `It seems Page Builder Update Settings index file was already upgraded. Skipping...`
        );
        return;
    }
    removeImportFromSourceFile(source, "@webiny/handler-aws");

    insertImportToSourceFile({
        source,
        name: {
            createRawHandler: "createHandler"
        },
        moduleSpecifier: "@webiny/handler-aws"
    });
};
