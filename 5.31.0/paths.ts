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

export const getDynamoDbToElasticsearchPath = context => {
    if (isPre529Project(context)) {
        return "api/code/dynamodbToElastic";
    }
    return "apps/api/dynamodbToElastic";
};
