import {
    addPackagesToDependencies,
    addPackagesToDevDependencies,
    createProcessor,
    insertImportToSourceFile,
    mergePackageJson,
    removeImportFromSourceFile,
    replaceVariable
} from "../utils";

export const updateForNode18 = createProcessor(async params => {
    const { context, files, project } = params;
    /**
     * In the index file:
     * Add new document client getter.
     * * import { getDocumentClient } from "@webiny/aws-sdk/client-dynamodb";
     * * const documentClient = getDocumentClient();
     *
     * instead of old new DocumentClient() usage.
     */
    const indexFile = files.byName("api/graphql/index");
    const indexSource = project.getSourceFile(indexFile.path);

    insertImportToSourceFile({
        source: indexSource,
        name: ["getDocumentClient"],
        moduleSpecifier: "@webiny/aws-sdk/client-dynamodb",
        after: "aws-sdk/clients/dynamodb"
    });

    removeImportFromSourceFile(indexSource, "aws-sdk/clients/dynamodb");

    replaceVariable({
        source: indexSource,
        target: "documentClient",
        newValue: "documentClient = getDocumentClient({region: process.env.AWS_REGION})",
        validate: declaration => {
            return declaration.getText().includes("getDocumentClient") === false;
        }
    });
    /**
     * In the security file:
     * { documentClient }: { documentClient: DocumentClient }
     *
     * with { documentClient }: { documentClient: DynamoDBDocument }
     */
    const securityFile = files.byName("api/graphql/security");
    const securitySource = project.getSourceFile(securityFile.path);

    insertImportToSourceFile({
        source: securitySource,
        name: ["DynamoDBDocument"],
        moduleSpecifier: "@webiny/aws-sdk/client-dynamodb",
        after: "aws-sdk/clients/dynamodb"
    });
    removeImportFromSourceFile(securitySource, "aws-sdk/clients/dynamodb");

    securitySource.replaceWithText(
        securitySource.getText().replace("DocumentClient", "DynamoDBDocument")
    );

    const securityPackageJson = files.byName("api/package.json");
    addPackagesToDependencies(context, securityPackageJson.path, {
        "@webiny/aws-sdk": context.version
    });
    /**
     * In the root package.json:
     * * update @types/node
     * * set minimum engine version to 18
     */
    const packageJson = files.byName("package.json");

    addPackagesToDevDependencies(context, packageJson.path, {
        "@types/node": "^18.0.0"
    });

    mergePackageJson(packageJson.path, {
        engines: {
            node: ">=18.0.0"
        }
    });

    await project.save();
});
