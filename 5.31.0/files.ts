import { Context } from "../types";
import { getIsElasticsearchProject, getIsPre529Project } from "../utils";
import { createFilePath, getGraphQLPath } from "./utils/paths";
import { Files } from "./classes/Files";
import { FileDefinition } from "./classes/FileDefinition";

export const getAllFiles = (context: Context): Files => {
    /**
     * Add new source file that will be changed at some point later on.
     */
    const isPre529Project = getIsPre529Project(context);
    const isElasticsearchProject = getIsElasticsearchProject(context, getGraphQLPath(context));
    const files = new Files(context, [
        new FileDefinition({
            path: createFilePath(context, "${fileManager}/download/src/index.ts"),
            tag: "fm",
            name: "fm/download"
        }),
        new FileDefinition({
            path: createFilePath(context, "${fileManager}/manage/src/index.ts"),
            tag: "fm",
            name: "fm/manage"
        }),
        new FileDefinition({
            path: createFilePath(context, "${fileManager}/transform/src/index.ts"),
            tag: "fm",
            name: "fm/transform"
        }),
        new FileDefinition({
            path: createFilePath(context, "${graphql}/src/index.ts"),
            tag: "gql",
            name: "graphql/index"
        }),
        new FileDefinition({
            path: createFilePath(context, "${graphql}/src/types.ts"),
            tag: "gql",
            name: "graphql/types"
        }),
        new FileDefinition({
            path: createFilePath(context, "${cms}/src/index.ts"),
            tag: "cms",
            name: "cms/index"
        }),
        new FileDefinition({
            path: createFilePath(context, "${cms}/src/types.ts"),
            tag: "cms",
            name: "cms/types"
        }),
        new FileDefinition({
            path: createFilePath(context, "${pageBuilder}/exportPages/combine/src/index.ts"),
            tag: "pb",
            name: "pb/exportPages/combine"
        }),
        new FileDefinition({
            path: createFilePath(context, "${pageBuilder}/exportPages/process/src/index.ts"),
            tag: "pb",
            name: "pb/exportPages/process"
        }),
        new FileDefinition({
            path: createFilePath(context, "${pageBuilder}/importPages/create/src/index.ts"),
            tag: "pb",
            name: "pb/importPages/create"
        }),
        new FileDefinition({
            path: createFilePath(context, "${pageBuilder}/importPages/process/src/index.ts"),
            tag: "pb",
            name: "pb/importPages/process"
        }),
        new FileDefinition({
            path: createFilePath(context, "${pageBuilder}/updateSettings/src/index.ts"),
            tag: "pb",
            name: "pb/updateSettings"
        }),
        new FileDefinition({
            path: createFilePath(context, "${prerenderingService}/flush/src/index.ts"),
            pre529: true,
            tag: "ps",
            name: "ps/flush"
        }),
        new FileDefinition({
            path: createFilePath(context, "${prerenderingService}/render/src/index.ts"),
            pre529: true,
            tag: "ps",
            name: "ps/render"
        }),
        new FileDefinition({
            path: createFilePath(context, "${prerenderingService}/queue/add/src/index.ts"),
            pre529: true,
            tag: "ps",
            name: "ps/queue/add"
        }),
        new FileDefinition({
            path: createFilePath(context, "${prerenderingService}/queue/process/src/index.ts"),
            pre529: true,
            tag: "ps",
            name: "ps/queue/process"
        }),
        new FileDefinition({
            path: createFilePath(context, "${dynamoToElastic}/src/index.ts"),
            pre529: true,
            elasticsearch: true,
            tag: "ddb2es",
            name: "ddb-es/index"
        })
    ]);

    return files.filter(file => {
        if (file.pre529 === true && !isPre529Project) {
            return false;
        } else if (file.elasticsearch === true && !isElasticsearchProject) {
            return false;
        }
        return true;
    });
};
