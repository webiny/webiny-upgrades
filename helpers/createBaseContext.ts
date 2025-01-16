import path from "path";
import { ConsoleLogger, Context } from "../types";
import getYarnWorkspaces from "get-yarn-workspaces";

interface IParams {
    root: string;
    version: `${number}.${number}.${number}`;
    log: ConsoleLogger;
}

export const createBaseContext = (params: IParams): Context => {
    return {
        project: {
            root: params.root,
            getPackageJsonPath: () => {
                return path.join(params.root, "package.json");
            },
            getFilePath: target => {
                const targets = Array.isArray(target) ? target : [target];
                return path.join(params.root, ...targets);
            },
            getWorkspaces: () => {
                const workspaces = getYarnWorkspaces(params.root) as string[] | unknown[] | unknown;
                if (!workspaces || !Array.isArray(workspaces)) {
                    throw new Error(`Could not find Yarn workspaces in "${params.root}".`);
                }
                /**
                 * Also check that all workspaces are strings.
                 */
                if (workspaces.some(workspace => typeof workspace !== "string")) {
                    throw new Error(`Yarn workspaces must be strings.`);
                }
                return workspaces;
            }
        },
        version: params.version,
        log: params.log
    };
};
