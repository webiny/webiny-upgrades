import loadJsonFile from "load-json-file";
import { PackageJson } from "../types";

const keys = ["dependencies", "devDependencies", "peerDependencies"];
/**
 * Method takes first available @webiny package and takes it's version
 */
export const findVersion = (packageJson: string): string | null => {
    const json = loadJsonFile.sync<PackageJson>(packageJson);
    for (const key of keys) {
        if (!json[key]) {
            continue;
        }
        const deps = json[key];
        if (typeof deps !== "object") {
            continue;
        }
        for (const dep in deps) {
            if (dep.match(/^@webiny\//) === null) {
                continue;
            }
            return deps[dep];
        }
    }

    return null;
};
