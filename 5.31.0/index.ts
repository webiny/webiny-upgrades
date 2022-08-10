import { Context } from "../types";
import { isPre529Project, createMorphProject, prettierFormat, yarnInstall } from "../utils";

const getGraphQLPath = (context: Context) => {
    if (isPre529Project(context)) {
        return "api/code/graphql";
    }
    return "apps/api/graphql";
};
const getHeadlessCMSPath = (context: Context) => {
    if (isPre529Project(context)) {
        return "api/code/headlessCMS";
    }
    return "apps/api/headlessCMS";
};

module.exports = async (context: Context) => {
    const files: string[] = [];
    const project = createMorphProject(files);

    // Save file changes.
    await project.save();

    // Format updated files.
    await prettierFormat(files);

    // Install dependencies.
    await yarnInstall();
};
