import loadJsonFile from "load-json-file";
import writeJson from "write-json-file";
import { PackageJson } from "../types";

export interface IPackageJsonModifier {
    modify(values: Partial<PackageJson>): PackageJson;
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
        modify: values => {
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
