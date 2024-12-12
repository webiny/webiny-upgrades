export enum PackageType {
    dependencies = "dependencies",
    devDependencies = "devDependencies",
    peerDependencies = "peerDependencies",
    resolutions = "resolutions"
}

export interface IReferenceVersionFile {
    file: string;
    types: PackageType[];
}

export interface IReferenceVersion {
    version: string;
    files: IReferenceVersionFile[];
}

export interface IReference {
    name: string;
    versions: IReferenceVersion[];
}

export interface IDependency {
    name: string;
    version: string;
    files: string[];
}

export interface IReferencesJson {
    dependencies: IDependency[];
    devDependencies: IDependency[];
    peerDependencies: IDependency[];
    resolutions: IReference[];
    references: IReference[];
}
