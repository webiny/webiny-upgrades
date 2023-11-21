import { createProcessor, insertImportToSourceFile, removeImportFromSourceFile } from "../utils";

export const updateForHandlers = createProcessor(async params => {
    const { files, project } = params;

    const file = files.byName("api/graphql/index");
    const source = project.getSourceFile(file.path);

    insertImportToSourceFile({
        source,
        name: ["createHandler"],
        moduleSpecifier: "@webiny/handler-aws",
        after: "@webiny/handler-aws/gateway"
    });

    removeImportFromSourceFile(source, "@webiny/handler-aws/gateway");
});
