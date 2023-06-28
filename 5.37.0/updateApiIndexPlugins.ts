import { Project } from "ts-morph";
import {
    Files,
    getIsElasticsearchProject,
    removeImportFromSourceFile,
    removePluginFromCreateHandler,
    addPackagesToDependencies,
    movePlugin,
    replaceInPath,
    getCreateHandlerExpressions
} from "../utils";
import { Context } from "../types";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

class UpdateApiIndex {
    private readonly project: Project;
    private readonly files: Files;
    private readonly context: Context;

    constructor(params: Params) {
        this.project = params.project;
        this.files = params.files;
        this.context = params.context;
    }

    async execute() {
        const indexFile = this.files.byName("api/graphql/index");
        const source = this.project.getSourceFile(indexFile.path);
        const jsonFile = this.files.byName("api/graphql/package.json");

        addPackagesToDependencies(this.context, jsonFile.path, {
            "@webiny/api-file-manager-aco": null
        });
        removeImportFromSourceFile(source, "@webiny/api-file-manager-aco", { quiet: true });
        removePluginFromCreateHandler(source, "handler", "createAcoFileManagerContext()");

        movePlugin({
            source,
            value: "createHeadlessCmsContext",
            before: "createFileManagerContext"
        });

        movePlugin({
            source,
            value: "createHeadlessCmsGraphQL",
            after: "createHeadlessCmsContext"
        });

        await this.project.save();
    }
}

class UpdateEsApiIndex {
    private project: Project;
    private files: Files;
    private context: Context;
    constructor(params: Params) {
        this.project = params.project;
        this.files = params.files;
        this.context = params.context;
    }

    async execute() {
        const indexFile = this.files.byName("api/graphql/index");
        const jsonFile = this.files.byName("api/graphql/package.json");

        replaceInPath(indexFile.path, [
            { find: "@webiny/api-file-manager-ddb-es", replaceWith: "@webiny/api-file-manager-ddb" }
        ]);

        const source = this.project.getSourceFile(indexFile.path);
        source.replaceWithText(
            source
                .getText()
                .replace("@webiny/api-file-manager-ddb-es", "@webiny/api-file-manager-ddb")
        );

        addPackagesToDependencies(this.context, jsonFile.path, {
            "@webiny/api-file-manager-ddb-es": null,
            "@webiny/api-file-manager-ddb": this.context.version
        });

        // remove `elasticsearchClient` argument from `createFileManagerStorageOperations` (replace the whole block)
        const { arrayExpression } = getCreateHandlerExpressions(source, "handler");

        const elements = arrayExpression.getElements();
        const fmContext = elements.find(el => el.getText().match(/createFileManagerContext/));
        if (fmContext) {
            fmContext.replaceWithText(
                `
                createFileManagerContext({
                    storageOperations: createFileManagerStorageOperations({
                        documentClient
                    })
                })
            `.trim()
            );
        }

        await this.project.save();
    }
}

export const updateApiIndexPlugins = async (params: Params) => {
    const isElasticsearchProject = getIsElasticsearchProject(params.context, "apps/api/graphql");

    // Run common updater
    const updater = new UpdateApiIndex(params);
    await updater.execute();

    if (isElasticsearchProject) {
        const esUpdater = new UpdateEsApiIndex(params);
        await esUpdater.execute();
    }
};
