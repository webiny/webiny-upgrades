const tsMorph = require("ts-morph");
const fs = require("fs-extra");
const { addPackagesToDependencies, log, removeImportFromSourceFile } = require("../utils");
const { Node } = tsMorph;

const getAppFile = file => {
    return `apps/admin/code/${file}`;
};

const files = {
    adminPackageJson: getAppFile("package.json"),
    adminPluginsIndex: getAppFile("src/plugins/index.ts"),
    adminAppTsx: getAppFile("src/App.tsx"),
    adminAppScss: getAppFile("src/App.scss")
};

const filesToDelete = [
    getAppFile("src/components"),
    getAppFile("src/plugins/admin.ts"),
    getAppFile("src/plugins/apolloLinks.ts"),
    getAppFile("src/plugins/base.ts"),
    getAppFile("src/plugins/i18n.ts"),
    getAppFile("src/plugins/i18nContent.ts"),
    getAppFile("src/plugins/routeNotFound.tsx"),
    getAppFile("src/plugins/security.ts")
];

const AppTsxContents = `
import React from "react";
import { Admin } from "@webiny/app-serverless-cms";
import { Cognito } from "@webiny/app-admin-users-cognito";
import "./App.scss";

export const App = () => {
    return (
        <Admin>
            <Cognito />
        </Admin>
    );
};
`;

const AppScssContents = `// Webiny theme variables
$webiny-theme-light-primary: #fa5723;
$webiny-theme-light-secondary: #00ccb0;
$webiny-theme-light-background: #f2f2f2;
$webiny-theme-light-surface: #fff;
$webiny-theme-light-on-primary: #ffffff;
$webiny-theme-light-on-secondary: #ffffff;
$webiny-theme-light-on-surface: #000000;
$webiny-theme-light-on-background: rgba(212, 212, 212, 0.5);
$webiny-theme-light-text-primary-on-background: rgba(0, 0, 0, 0.87);
$webiny-theme-light-text-secondary-on-background: rgba(0, 0, 0, 0.54);
$webiny-theme-light-text-hint-on-dark: rgba(255, 255, 255, 0.5);
$webiny-theme-light-caret-down: url("data:image/svg+xml,%3Csvg%20width%3D%2210px%22%20height%3D%225px%22%20viewBox%3D%227%2010%2010%205%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%0A%20%20%20%20%3Cpolygon%20id%3D%22Shape%22%20stroke%3D%22none%22%20fill%3D%22%23000000%22%20fill-rule%3D%22evenodd%22%20opacity%3D%220.54%22%20points%3D%227%2010%2012%2015%2017%2010%22%3E%3C%2Fpolygon%3E%0A%3C%2Fsvg%3E");
$webiny-theme-typography-font-family: "Source Sans Pro";

// Import theme styles
@import "~theme/styles.scss";

// Import main styles
@import "~@webiny/app-serverless-cms/styles.scss";`;

const dependencies = version => ({
    "@apollo/react-components": null,
    "@webiny/app": null,
    "@webiny/app-file-manager": null,
    "@webiny/app-file-manager-s3": null,
    "@webiny/app-form-builder": null,
    "@webiny/app-graphql-playground": null,
    "@webiny/app-headless-cms": null,
    "@webiny/app-i18n": null,
    "@webiny/app-i18n-content": null,
    "@webiny/app-page-builder": null,
    "@webiny/app-page-builder-elements": null,
    "@webiny/app-plugin-admin-welcome-screen": null,
    "@webiny/app-security": null,
    "@webiny/app-security-access-management": null,
    "@webiny/app-serverless-cms": version,
    "@webiny/app-tenancy": null,
    "@webiny/react-router": null,
    "@webiny/telemetry": null,
    "@webiny/ui": null,
    "apollo-cache": null,
    "apollo-client": null,
    "apollo-link": null,
    "apollo-link-batch-http": null,
    "apollo-utilities": null
});

const upgradeProject = async (context, project) => {
    // Ensure files are in the expected locations.
    const assert = [
        "apps/admin",
        files.adminAppTsx,
        files.adminPluginsIndex,
        files.adminPackageJson
    ];

    for (const file of assert) {
        if (!fs.pathExistsSync(file)) {
            log.error(`${log.info.highlight(file)} was not found! Skipping upgrade.`);
            return;
        }
    }

    log.info(`Replacing ${log.info.highlight(files.adminAppTsx)}...`);
    fs.writeFileSync(files.adminAppTsx, AppTsxContents);

    if (fs.pathExistsSync(files.adminAppScss)) {
        log.info(`Replacing ${log.info.highlight(files.adminAppScss)}...`);
        fs.writeFileSync(files.adminAppScss, AppScssContents);
    }

    log.info("Updating app dependencies...");
    addPackagesToDependencies(context, files.adminPackageJson, dependencies(context.version));

    for (const path of filesToDelete) {
        log.info(`Removing ${log.info.highlight(path)}...`);
        fs.removeSync(path);
    }

    /**
     * @param pluginsIndex {tsMorph.SourceFile}
     */
    const pluginsIndex = project.getSourceFile(files.adminPluginsIndex);
    const removeImports = [
        "@webiny/app-tenancy",
        "@webiny/app-plugin-admin-welcome-screen",
        "./routeNotFound",
        "./admin",
        "./apolloLinks",
        "./base",
        "./i18n",
        "./i18nContent",
        "./security"
    ];

    const removeIdentifiers = [
        "basePlugins",
        "apolloLinkPlugins",
        "adminPlugins",
        "welcomeScreenPlugins",
        "routeNotFound",
        "i18nPlugins",
        "i18nContentPlugins",
        "tenancyPlugins",
        "securityPlugins"
    ];

    removeImports.map(target => {
        removeImportFromSourceFile(pluginsIndex, target);
    });

    const pluginsRegister = pluginsIndex.getFirstDescendant(
        node => Node.isPropertyAccessExpression(node) && node.getText() === "plugins.register"
    );

    if (!pluginsRegister) {
        log.error(`"plugins.register([...])" expression was not found!`);
        return;
    }

    const pluginsArray = pluginsRegister
        .getParent()
        .getFirstDescendant(node => Node.isArrayLiteralExpression(node));

    removeIdentifiers.forEach(name => {
        const node = pluginsArray.getFirstDescendant(
            node => Node.isIdentifier(node) && node.getText() === name
        );

        if (!node) {
            return;
        }

        try {
            const parent = node.getParent();
            if (Node.isCallExpression(parent)) {
                pluginsArray.removeElement(parent);
            } else {
                pluginsArray.removeElement(node);
            }
        } catch (err) {
            log.error(`Unable to remove ${log.info.highlight(name)}: ${err.message}`);
        }
    });
};

module.exports = {
    upgradeProject,
    getFiles() {
        return files;
    }
};
