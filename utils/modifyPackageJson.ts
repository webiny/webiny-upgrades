import loadJsonFile from "load-json-file";
import writeJson from "write-json-file";
import { PackageJson } from "../types";

export interface IPackageJsonModifierModifyValues {
    [key: string]: {
        [key: string]: string | Record<string, string | Record<string, string>>;
    };
}

export interface IPackageJsonModifier {
    modify(values: IPackageJsonModifierModifyValues): PackageJson;
}

export interface ICreatePackageJsonModifier {
    (file: string): IPackageJsonModifier;
}

export const createPackageJsonModifier: ICreatePackageJsonModifier = file => {
    const load = () => {
        return loadJsonFile.sync<PackageJson>(file);
    };
    const store = (values: PackageJson) => {
        return writeJson.sync(file, values);
    };

    return {
        modify: (values: IPackageJsonModifierModifyValues) => {
            const json = load();
            for (const key in values) {
                if (!json[key]) {
                    json[key] = {
                        ...values[key]
                    };
                    continue;
                }
                json[key] = {
                    ...json[key],
                    ...values[key]
                };
            }

            store(json);
            return json;
        }
    };
};
