/**
 * TODO When 5.42.0 is released, use the @webiny/cli-plugin-sync-dependencies/references/DependencyTree.ts file.
 */

import semver from "semver";
import {
    IDependency,
    IDependencyTree,
    IDependencyTreePushParams,
    IInvalidSemverVersion,
    IReference,
    PackageType
} from "./types";

const keys = [
    PackageType.dependencies,
    PackageType.devDependencies,
    PackageType.peerDependencies,
    PackageType.resolutions
];

interface IAddReferenceParams {
    name: string;
    version: string;
    file: string;
    type: PackageType;
}

interface ISortItem {
    name: string;
}

const sortByName = (a: ISortItem, b: ISortItem) => {
    return a.name.localeCompare(b.name);
};

export class DependencyTree implements IDependencyTree {
    public readonly _invalidSemver: IInvalidSemverVersion[] = [];

    private readonly packages: Record<(typeof keys)[number], IDependency[]> = {
        resolutions: [],
        dependencies: [],
        devDependencies: [],
        peerDependencies: []
    };
    public readonly references: IReference[] = [];

    public get dependencies(): IDependency[] {
        return this.packages.dependencies.sort(sortByName);
    }

    public get devDependencies(): IDependency[] {
        return this.packages.devDependencies.sort(sortByName);
    }

    public get peerDependencies(): IDependency[] {
        return this.packages.peerDependencies.sort(sortByName);
    }

    public get resolutions(): IDependency[] {
        return this.packages.resolutions.sort(sortByName);
    }

    public get duplicates(): IReference[] {
        return this.references
            .filter(reference => {
                return reference.versions.length > 1;
            })
            .sort(sortByName);
    }

    public push(params: IDependencyTreePushParams): void {
        const { file, json, ignore, ignoreVersion } = params;

        for (const key of keys) {
            const dependencies = json[key];
            if (!dependencies) {
                continue;
            }

            for (const name in dependencies) {
                if (ignore?.exec && ignore.exec(name) !== null) {
                    continue;
                }
                let version = dependencies[name];
                if (!version || (ignoreVersion?.exec && ignoreVersion.exec(version) !== null)) {
                    continue;
                }

                const semverVersion =
                    semver.validRange(version) || version === "beta" ? version : null;
                if (!semverVersion) {
                    this._invalidSemver.push({
                        version,
                        file,
                        name
                    });
                    continue;
                }
                version = version
                    .replace(/\^/g, "")
                    .replace(/~/g, "")
                    .replace(/>/g, "")
                    .replace(/</g, "")
                    .replace(/=/g, "");
                const existing = this.packages[key].find(item => {
                    return item.name === name && item.version === version;
                });
                if (existing) {
                    existing.files.push(file);
                    this.addReference({
                        name,
                        version,
                        file,
                        type: key
                    });
                    continue;
                }

                this.packages[key].push({
                    name,
                    version,
                    files: [file]
                });
                this.addReference({
                    name,
                    version,
                    file,
                    type: key
                });
            }
        }
    }

    public invalid(): IInvalidSemverVersion[] {
        return this._invalidSemver;
    }

    private addReference(ref: IAddReferenceParams): void {
        const existing = this.references.find(item => {
            return item.name === ref.name;
        });
        const types = [ref.type];
        if (!existing) {
            this.references.push({
                name: ref.name,
                versions: [
                    {
                        version: ref.version,
                        files: [
                            {
                                file: ref.file,
                                types
                            }
                        ]
                    }
                ]
            });
            return;
        }
        const existingVersion = existing.versions.find(item => {
            return item.version === ref.version;
        });
        if (!existingVersion) {
            existing.versions.push({
                version: ref.version,
                files: [
                    {
                        file: ref.file,
                        types
                    }
                ]
            });
            return;
        }
        const existingFile = existingVersion.files.find(item => {
            return item.file === ref.file;
        });
        if (!existingFile) {
            existingVersion.files.push({
                file: ref.file,
                types
            });
            return;
        } else if (existingFile.types.includes(ref.type)) {
            return;
        }
        existingFile.types.push(ref.type);
    }
}
