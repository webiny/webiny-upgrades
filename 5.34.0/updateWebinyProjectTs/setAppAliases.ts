import { Project } from "ts-morph";
import { Files } from "../../utils";
import { Context } from "../../types";

const tsMorph = require("ts-morph");

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

const APP_ALIASES = JSON.stringify({
    core: "apps/core",
    api: "apps/api",
    admin: "apps/admin",
    website: "apps/website"
});

export const setAppAliases = async ({ files, project }: Params) => {
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
        return tsMorph.Node.isPropertyAssignment(node) && node.getName() === "appAliases";
    });

    if (tsMorph.Node.isPropertyAssignment(existingIdProperty)) {
        existingIdProperty.setInitializer(APP_ALIASES);
    } else {
        // @ts-ignore `insertProperty` does work, despite the fact that TS is complaining.
        exportedObjectLiteral.insertProperty(0, `appAliases: ${APP_ALIASES}`);
    }
};
