import path from "path";
import { ConsoleLogger, Context } from "../types";

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
            }
        },
        version: params.version,
        log: params.log
    };
};
