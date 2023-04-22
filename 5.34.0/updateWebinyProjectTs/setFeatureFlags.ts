import { Project } from "ts-morph";
import { Files } from "../../utils";
import { Context } from "../../types";

const tsMorph = require("ts-morph");

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

const FEATURE_FLAGS = [
    "{",
    "// Enforces usage of legacy PB page elements rendering engine.",
    "// To migrate to the latest one, please read:",
    "// https://www.webiny.com/docs/page-builder-rendering-upgrade",
    "pbLegacyRenderingEngine: true",
    "}"
].join("\n");

export const setFeatureFlags = async ({ files, project }: Params) => {
    const webinyProjectTsFile = files.byName("webiny.project.ts");

    project.addSourceFileAtPath(webinyProjectTsFile.path);

    const source = project.getSourceFile(webinyProjectTsFile.path);

    const defaultExport = source.getFirstDescendant(node => {
        if (tsMorph.Node.isExportAssignment(node) === false) {
            return false;
        }
        return node.getText().startsWith("export default ");
    });

    // Get ObjectLiteralExpression within the default export and assign the `id` property to it.
    const exportedObjectLiteral = defaultExport.getFirstDescendant(
        node => tsMorph.Node.isObjectLiteralExpression(node) === true
    );

    // @ts-ignore `insertProperty` does work, despite the fact that TS is complaining.
    const existingIdProperty = exportedObjectLiteral.getProperty(node => {
        return tsMorph.Node.isPropertyAssignment(node) && node.getName() === "featureFlags";
    });

    if (tsMorph.Node.isPropertyAssignment(existingIdProperty)) {
        existingIdProperty.setInitializer(FEATURE_FLAGS);
    } else {
        // @ts-ignore `insertProperty` does work, despite the fact that TS is complaining.
        exportedObjectLiteral.insertProperty(0, `featureFlags: ${FEATURE_FLAGS}`);
    }
};
