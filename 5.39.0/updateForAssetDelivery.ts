import { insertImportToSourceFile, addPluginToCreateHandler, createProcessor } from "../utils";

export const updateForAssetDelivery = createProcessor(async params => {
    const { files, project } = params;

    const file = files.byName("api/graphql/index");
    const source = project.getSourceFile(file.path);

    insertImportToSourceFile({
        source,
        name: ["createAssetDelivery"],
        moduleSpecifier: "@webiny/api-file-manager-s3"
    });

    addPluginToCreateHandler({
        after: "createFileManagerGraphQL",
        source,
        value: `createAssetDelivery({ documentClient })`,
        validate: node => {
            return node.getElements().every(element => {
                return element.getText().match("createAssetDelivery") === null;
            });
        }
    });
});
