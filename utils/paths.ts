import { Context } from "../types";
import { isPre529Project } from "../utils";

export const getFileManagerPath = (context: Context) => {
    if (isPre529Project(context)) {
        return "api/code/fileManager";
    }
    return "apps/api/fileManager";
};
export const getGraphQLPath = (context: Context) => {
    if (isPre529Project(context)) {
        return "api/code/graphql";
    }
    return "apps/api/graphql";
};
export const getHeadlessCMSPath = (context: Context) => {
    if (isPre529Project(context)) {
        return "api/code/headlessCMS";
    }
    return "apps/api/headlessCMS";
};
export const getPageBuilderPath = (context: Context) => {
    if (isPre529Project(context)) {
        return "api/code/pageBuilder";
    }
    return "apps/api/pageBuilder";
};

export const getPrerenderingServicePath = (context: Context) => {
    if (isPre529Project(context)) {
        return "api/code/prerenderingService";
    }
    return "apps/api/prerenderingService";
};

export const getDynamoDbToElasticsearchPath = (context: Context) => {
    if (isPre529Project(context)) {
        return "api/code/dynamoToElastic";
    }
    return "apps/api/dynamoToElastic";
};

export const getAdminPath = (context: Context) => {
    if (isPre529Project(context)) {
        return "apps/admin/code";
    }
    return "apps/admin";
};

export const getWebsitePath = (context: Context) => {
    if (isPre529Project(context)) {
        return "apps/website/code";
    }
    return "apps/website";
};

export const getThemePath = () => {
    return "apps/theme";
};

interface PathConverters {
    [key: string]: {
        (context: Context): string;
    };
}

/**
 * Add more paths if required.
 */
const pathConverters: PathConverters = {
    "${fileManager}": getFileManagerPath,
    "${graphql}": getGraphQLPath,
    "${cms}": getHeadlessCMSPath,
    "${pageBuilder}": getPageBuilderPath,
    "${prerenderingService}": getPrerenderingServicePath,
    "${dynamoToElastic}": getDynamoDbToElasticsearchPath,
    "${website}": getWebsitePath,
    "${theme}": getThemePath,
    "${admin}": getAdminPath
};

export const createFilePath = (context: Context, file: string): string | null => {
    for (const p in pathConverters) {
        if (file.substring(0, p.length) !== p) {
            continue;
        }
        return file.replace(p, pathConverters[p](context));
    }
    context.log.error(`Could not determine directory for file "${file}".`);
    return null;
};
