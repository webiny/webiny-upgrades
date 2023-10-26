import { ObjectLiteralExpression, Project, SyntaxKind } from "ts-morph";
import { Files, insertImportToSourceFile, removeImportFromSourceFile } from "../utils";
import { Context } from "../types";
import { addPackagesToDependencies } from "../utils";
import path from "path";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const updateApiSecurityPlugins = async (params: Params) => {
    const { project, files, context } = params;

    // Update theme package's package.json.
    const apiPackageJsonPath = path.join(
        context.project.root,
        "apps",
        "api",
        "graphql",
        "package.json"
    );

    addPackagesToDependencies(context, apiPackageJsonPath, {
        "@webiny/api-admin-users-cognito": null,
        "@webiny/api-admin-users-cognito-so-ddb": null,
        "@webiny/api-admin-users": context.version,
        "@webiny/api-admin-users-so-ddb": context.version
    });

    const securityFile = files.byName("api/graphql/security");
    const source = project.getSourceFile(securityFile.path);

    context.log.info(`Adding new Security plugins in the API app plugins (%s)`, securityFile.path);

    removeImportFromSourceFile(source, "@webiny/api-admin-users-cognito");
    removeImportFromSourceFile(source, "@webiny/api-admin-users-cognito/syncWithCognito");
    removeImportFromSourceFile(source, "@webiny/api-admin-users-cognito-so-ddb");

    insertImportToSourceFile({
        source,
        name: "cognitoAuthentication, { syncWithCognito }",
        moduleSpecifier: "@webiny/api-security-cognito",
        after: "@webiny/api-security-cognito"
    });

    insertImportToSourceFile({
        source,
        name: "createAdminUsersApp",
        moduleSpecifier: "@webiny/api-admin-users",
    });

    insertImportToSourceFile({
        source,
        name: "{ createStorageOperations as createAdminUsersStorageOperations }",
        moduleSpecifier: "@webiny/api-admin-users-so-ddb",
    });

    const descendantIdentifiers = source.getDescendantsOfKind(SyntaxKind.Identifier);
    for (let i = 0; i < descendantIdentifiers.length; i++) {
        const descendantIdentifier = descendantIdentifiers[i];
        if (descendantIdentifier.getText() === "groupAuthorization") {
            descendantIdentifier.replaceWithText("tenantLinkAuthorization");
        }
        if (descendantIdentifier.getText() === "parentTenantGroupAuthorization") {
            descendantIdentifier.replaceWithText("tenantLinkAuthorization");
            descendantIdentifier.getParent().getFirstDescendant(node => {
                if (node.getKind() === SyntaxKind.ObjectLiteralExpression) {
                    const objectLiteralExpression = node as ObjectLiteralExpression;
                    objectLiteralExpression.addPropertyAssignment({
                        name: "parent",
                        initializer: "true"
                    });
                }
                return false;
            });
        }
    }

    context.log.info("New Security plugins added.");
};