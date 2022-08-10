import { Context } from "../types";
import { getIsElasticsearchProject, getIsPre529Project } from "../utils";
import {
    getFileManagerPath,
    getGraphQLPath,
    getHeadlessCMSPath,
    getPageBuilderPath,
    getPrerenderingServicePath
} from "./paths";

export interface FileDefinitionParams {
    path: string;
    elasticsearch?: boolean;
    pre529?: boolean;
}
export class FileDefinition {
    public readonly path: string;
    public readonly elasticsearch: boolean;
    public readonly pre529: boolean;

    public constructor(params: FileDefinitionParams) {
        this.path = params.path;
        this.elasticsearch = params.elasticsearch === true;
        this.pre529 = params.pre529 === true;
    }
}

export const getAllFiles = (context: Context): string[] => {
    /**
     * Add new source file that will be changed at some point later on.
     */
    const files = [
        new FileDefinition({ path: "${fileManager}/download/src/index.ts" }),
        new FileDefinition({ path: "${fileManager}/manage/src/index.ts" }),
        new FileDefinition({ path: "${fileManager}/transform/src/index.ts" }),
        new FileDefinition({ path: "${graphql}/src/index.ts" }),
        new FileDefinition({ path: "${headlessCms}/src/index.ts" }),
        new FileDefinition({ path: "${pageBuilder}/exportPages/combine/src/index.ts" }),
        new FileDefinition({ path: "${pageBuilder}/exportPages/process/src/index.ts" }),
        new FileDefinition({ path: "${pageBuilder}/importPages/combine/src/index.ts" }),
        new FileDefinition({ path: "${pageBuilder}/importPages/process/src/index.ts" }),
        new FileDefinition({ path: "${pageBuilder}/updateSettings/src/index.ts" }),
        new FileDefinition({ path: "${prerenderingService}/flush/src/index.ts" }),
        new FileDefinition({ path: "${prerenderingService}/render/src/index.ts" }),
        new FileDefinition({ path: "${prerenderingService}/queue/add/src/index.ts" }),
        new FileDefinition({ path: "${prerenderingService}/queue/process/src/index.ts" })
    ];

    const directories = {
        "${fileManager}": getFileManagerPath(context),
        "${graphql}": getGraphQLPath(context),
        "${headlessCms}": getHeadlessCMSPath(context),
        "${pageBuilder}": getPageBuilderPath(context),
        "${prerenderingService}": getPrerenderingServicePath(context)
    };

    const isPre529Project = getIsPre529Project(context);
    const isElasticsearchProject = getIsElasticsearchProject(context, getGraphQLPath(context));

    return files
        .filter(file => {
            if (file.pre529 === true && !isPre529Project) {
                return false;
            } else if (file.elasticsearch === true && !isElasticsearchProject) {
                return false;
            }
            return true;
        })
        .map(file => {
            for (const p in directories) {
                if (file.path.match(p) === null) {
                    continue;
                }
                return file.path.replace(p, directories[p]);
            }
            context.log.error(`File "${file.path}" does not have a mapped directory.`);
            return null;
        })
        .filter(Boolean);
};
