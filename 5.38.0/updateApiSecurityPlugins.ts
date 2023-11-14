import path from "path";
import { ObjectLiteralExpression, SyntaxKind } from "ts-morph";
import {
    addPackagesToDependencies,
    createProcessor,
    insertImportToSourceFile,
    removeImportFromSourceFile
} from "../utils";

export const updateApiSecurityPlugins = createProcessor(async params => {
    const { project, files, context } = params;

    // Update theme package's package.json.
    const apiPackageJsonPath = path.join(
        context.project.root,
        "apps",
        "api",
        "graphql",
        "package.json"
    );

    const securityFile = files.byName("api/graphql/security");
    const source = project.getSourceFile(securityFile.path);

    context.log.info(`Adding new Security plugins (%s)...`, securityFile.path);

    const packageJson = await import(apiPackageJsonPath);
    if (packageJson.dependencies["@webiny/api-admin-users"]) {
        context.log.info(
            "Looks like you already have the latest Security plugins set up. Skipping..."
        );
        return;
    }

    removeImportFromSourceFile(source, "@webiny/api-admin-users-cognito");
    removeImportFromSourceFile(source, "@webiny/api-admin-users-cognito/syncWithCognito");
    removeImportFromSourceFile(source, "@webiny/api-admin-users-cognito-so-ddb");

    insertImportToSourceFile({
        source,
        name: ["syncWithCognito"],
        moduleSpecifier: "@webiny/api-security-cognito",
        after: "@webiny/api-security-cognito"
    });

    insertImportToSourceFile({
        source,
        name: "createAdminUsersApp",
        moduleSpecifier: "@webiny/api-admin-users"
    });

    insertImportToSourceFile({
        source,
        name: {
            createStorageOperations: "createAdminUsersStorageOperations"
        },
        moduleSpecifier: "@webiny/api-admin-users-so-ddb"
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

    addPackagesToDependencies(context, apiPackageJsonPath, {
        "@webiny/api-admin-users-cognito": null,
        "@webiny/api-admin-users-cognito-so-ddb": null,
        "@webiny/api-admin-users": context.version,
        "@webiny/api-admin-users-so-ddb": context.version
    });

    context.log.info("New Security plugins added.");
});
