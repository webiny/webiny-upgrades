import path from "path";
import { addPackagesToDependencies, createProcessor, insertImportToSourceFile } from "../../utils";
import { SyntaxKind } from "ts-morph";

const createAdminUsersAppPluginsCode = `/**
     * Create Admin Users app.
     */
    createAdminUsersApp({
        storageOperations: createAdminUsersStorageOperations({ documentClient })
    }),`;

export const updateOktaAuth0 = createProcessor(async params => {
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
        context.log.warning(
            "Looks like you already have the latest Security plugins set up. Skipping..."
        );
        return;
    }

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

    const [defaultExport] = source.getDescendantsOfKind(SyntaxKind.ExportAssignment);
    if (defaultExport) {
        const [returningPluginsArray] = defaultExport.getDescendantsOfKind(
            SyntaxKind.ArrayLiteralExpression
        );
        returningPluginsArray.addElement(createAdminUsersAppPluginsCode);
    }

    addPackagesToDependencies(context, apiPackageJsonPath, {
        "@webiny/api-admin-users": context.version,
        "@webiny/api-admin-users-so-ddb": context.version
    });

    context.log.success("New Security plugins added.");
});
