const tsMorph = require("ts-morph");
const path = require("path");
const fs = require("fs");
const prettier = require("prettier");
const execa = require("execa");
const log = require("./log");

/**
 * @param files {string[]}
 * @return {tsMorph.Project}
 */
const createMorphProject = files => {
    const project = new tsMorph.Project();
    for (const file of files) {
        project.addSourceFileAtPath(file);
    }
    return project;
};

const prettierFormat = async files => {
    try {
        log.info("Formatting updated code...");
        for (const file of files) {
            const filePath = path.join(process.cwd(), file);
            const options = await prettier.resolveConfig(filePath);
            const fileContentRaw = fs.readFileSync(filePath).toString("utf8");
            const fileContentFormatted = prettier.format(fileContentRaw, {
                ...options,
                filepath: filePath
            });
            fs.writeFileSync(filePath, fileContentFormatted);
        }

        log.success("Updated code formatted successfully.");
        console.log();
    } catch (ex) {
        console.log(log.error.hl("Prettier failed."));
        log.error(ex.message);
        if (ex.stdout) {
            console.log(ex.stdout);
        }
    }
};

/**
 * Run to install new packages in the project.
 */
const yarnInstall = async () => {
    try {
        log.info("Installing new packages...");
        await execa("yarn", { cwd: process.cwd() });
        log.success("Packages installed successfully.");
        console.log();
    } catch (ex) {
        log.error("Installation of new packages failed.");
        console.log(ex.message);
        if (ex.stdout) {
            console.log(ex.stdout);
        }
    }
};

/**
 * Run to up the versions of all packages.
 *
 *
 */
const yarnUp = async ({ targetVersion }) => {
    try {
        log.info(`Updating all package versions to ${targetVersion}...`);
        await execa(`yarn`, [`up`, `@webiny/*@${targetVersion}`], { cwd: process.cwd() });
        await execa("yarn", { cwd: process.cwd() });
        log.info("Finished update packages.");
    } catch (ex) {
        log.error("Updating of the packages failed.");
        console.log(ex);
        console.log(log.error(ex.message));
        if (ex.stdout) {
            console.log(ex.stdout);
        }
    }
};

/**
 *
 * @param name {string | string[] | Record<string, string>}
 * @return {{name: string, alias: string | undefined}[]|undefined}
 */
const createNamedImports = name => {
    if (typeof name === "string") {
        return undefined;
    } else if (Array.isArray(name) === true) {
        return name.map(n => ({
            name: n
        }));
    }
    return Object.keys(name).map(key => {
        return {
            name: key,
            alias: name[key]
        };
    });
};

/**
 *
 * @param source {tsMorph.SourceFile}
 * @param handler {tsMorph.Node}
 * @return {{handlerDeclaration: VariableDeclaration, createHandlerExpression: tsMorph.Node, plugins: tsMorph.Node, arrayExpression: tsMorph.ArrayLiteralExpression}}
 */
const getCreateHandlerExpressions = (source, handler) => {
    /**
     * First, we need to find handler declaration to check if it actually is ok.
     */
    const handlerDeclaration = source.getVariableDeclaration(handler);
    if (!handlerDeclaration) {
        console.log(`Missing handler expression "${handler}".`);
        return {
            handlerDeclaration: null,
            createHandlerExpression: null,
            plugins: null,
            arrayExpression: null
        };
    }
    /**
     * Then we need the handler expression "createHandler" to check if it has plugins defined.
     *
     * @type {Node}
     */
    const createHandlerExpression = handlerDeclaration.getFirstDescendant(
        node =>
            tsMorph.Node.isCallExpression(node) &&
            node.getExpression().getText() === "createHandler"
    );
    if (!createHandlerExpression) {
        console.log(`Missing "createHandler" expression in the handler declaration "${handler}".`);
        return {
            handlerDeclaration,
            createHandlerExpression: null,
            plugins: null,
            arrayExpression: null
        };
    }
    /**
     * And third check step is to determine if we need to upgrade the "createHandler".
     */
    const plugins = createHandlerExpression.getFirstDescendant(
        node => tsMorph.Node.isPropertyAssignment(node) && node.getName() === "plugins"
    );
    if (!plugins) {
        return {
            handlerDeclaration,
            createHandlerExpression,
            plugins,
            arrayExpression: null
        };
    }
    const arrayExpression = plugins.getFirstDescendant(node =>
        tsMorph.Node.isArrayLiteralExpression(node)
    );
    return {
        handlerDeclaration,
        createHandlerExpression,
        plugins,
        arrayExpression
    };
};

/**
 * It is possible to send:
 * - string - will produce default import
 * - string[] - will produce named imports
 * - Record<string, string> - will produce named imports with aliases
 *
 * @param source {tsMorph.SourceFile}
 * @param name {string|string[]|Record<string, string>}
 * @param moduleSpecifier {string}
 * @param after {string|null}
 */
const insertImportToSourceFile = ({ source, name, moduleSpecifier, after = null }) => {
    const namedImports = createNamedImports(name);
    const defaultImport = namedImports === undefined ? name : undefined;

    const declaration = source.getImportDeclaration(moduleSpecifier);

    if (declaration) {
        if (defaultImport) {
            declaration.setDefaultImport(defaultImport);
            return;
        }
        /**
         * We check the existing imports so we dont add the same one.
         */
        const existingNamedImports = declaration.getNamedImports().map(ni => {
            return ni.getText();
        });
        declaration.addNamedImports(
            namedImports.filter(ni => {
                return existingNamedImports.includes(ni.name) === false;
            })
        );
        return;
    }
    /**
     * If we want to add this import after some other import...
     */
    if (after) {
        const afterDeclaration = source.getImportDeclaration(after);
        /**
         * If there is no target import, we will just add it at the end.
         */
        if (afterDeclaration) {
            source.insertImportDeclaration(afterDeclaration.getChildIndex() + 1, {
                defaultImport,
                namedImports,
                moduleSpecifier
            });
            return;
        }
    }

    source.addImportDeclaration({
        defaultImport,
        namedImports,
        moduleSpecifier
    });
};

/**
 *
 * @param source {tsMorph.SourceFile}
 * @param handler {string}
 * @param targetPlugin {RegExp|string}
 */
const removePluginFromCreateHandler = (source, handler, targetPlugin) => {
    const { plugins, arrayExpression } = getCreateHandlerExpressions(source, handler);

    if (!plugins) {
        console.log(`Missing plugins in "createHandler" expression "${handler}".`);
        return;
    }
    if (!arrayExpression) {
        console.log(`Missing array literal expression in handler "${handler}".`);
        return;
    }

    const elements = arrayExpression.getElements();
    const removeIndexes = elements
        .map((element, index) => {
            if (element.getText().match(targetPlugin) === null) {
                return null;
            }
            return index;
        })
        .reverse()
        .filter(index => {
            return index !== null;
        });
    for (const index of removeIndexes) {
        arrayExpression.removeElement(index);
    }
};

/**
 * @param params {{source: tsMorph.SourceFile, handler: string, plugin: string, after: string|undefined|null}}
 */
const addPluginToCreateHandler = params => {
    const { source, handler, value, after } = params;
    const { plugins, arrayExpression } = getCreateHandlerExpressions(source, handler);

    if (!plugins) {
        console.log(`Missing plugins in "createHandler" expression "${handler}".`);
        return;
    }
    if (!arrayExpression) {
        console.log(`Missing array literal expression in handler "${handler}".`);
        return;
    }
    /**
     * @type tsMorph.Expression[]
     */
    const elements = arrayExpression.getElements();
    let index = elements.length;
    if (after) {
        const re = after instanceof RegExp ? after : new RegExp(after);
        for (const i in elements) {
            const element = elements[i];
            if (element.getText().match(re) === null) {
                continue;
            }
            index = Number(i) + 1;
            break;
        }
    }
    arrayExpression.insertElement(index, value);
};

/**
 * @param source {tsMorph.SourceFile}
 * @param target {string}
 */
const removeImportFromSourceFile = (source, target) => {
    const importDeclaration = source.getImportDeclaration(target);
    if (!importDeclaration) {
        console.log(`No import declaration with target path "${target}".`);
        return;
    }
    importDeclaration.remove();
};

/**
 * @param source {tsMorph.SourceFile}
 */
const addElasticsearchClient = source => {
    /**
     * If there is elasticsearchClient declaration, no need to proceed further.
     */
    const elasticsearchClient = source.getFirstDescendant(node => {
        return tsMorph.Node.isVariableDeclaration(node) && node.getName() === "elasticsearchClient";
    });
    if (elasticsearchClient) {
        return;
    }

    const createElasticsearchClientImport = source.getImportDeclaration(node => {
        return node.getModuleSpecifierValue() === "@webiny/api-elasticsearch/client";
    });
    if (!createElasticsearchClientImport) {
        insertImportToSourceFile({
            source,
            name: ["createElasticsearchClient"],
            moduleSpecifier: "@webiny/api-elasticsearch/client"
        });
    }

    const importDeclarations = source.getImportDeclarations();
    const lastImportDeclaration = importDeclarations[importDeclarations.length - 1];
    const last = lastImportDeclaration.getEndLineNumber();

    source.insertVariableStatement(last, {
        declarationKind: tsMorph.VariableDeclarationKind.Const,
        declarations: [
            {
                name: "elasticsearchClient",
                initializer:
                    "createElasticsearchClient({endpoint: `https://${process.env.ELASTIC_SEARCH_ENDPOINT}`})"
            }
        ]
    });
};

module.exports = {
    log,
    addElasticsearchClient,
    createMorphProject,
    prettierFormat,
    yarnInstall,
    yarnUp,
    insertImportToSourceFile,
    removePluginFromCreateHandler,
    addPluginToCreateHandler,
    removeImportFromSourceFile
};
