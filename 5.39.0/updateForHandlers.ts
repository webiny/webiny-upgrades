import {
    createProcessor,
    getCreateHandlerExpressions,
    insertImportToSourceFile,
    removeImportFromSourceFile
} from "../utils";
import { Node } from "ts-morph";

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
    /**
     * Remove the createHandler({http: {debug}}) in favor of createHandler({debug}).
     */
    const { createHandlerExpression } = getCreateHandlerExpressions(source, "handler");
    if (createHandlerExpression) {
        const http = createHandlerExpression.getFirstDescendant(node => {
            return Node.isPropertyAssignment(node) && node.getName() === "http";
        });
        if (http) {
            http.replaceWithText("debug");
        }
    }
});
