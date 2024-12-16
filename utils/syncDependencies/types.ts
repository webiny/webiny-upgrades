import { PackageJson } from "type-fest";

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

export interface IDependencyTreePushParams {
    file: string;
    json: PackageJson;
    ignore?: RegExp;
    ignoreVersion?: RegExp;
}

export interface IDependencyTree {
    dependencies: IDependency[];
    devDependencies: IDependency[];
    peerDependencies: IDependency[];
    resolutions: IDependency[];
    references: IReference[];
    duplicates: IReference[];

    push(params: IDependencyTreePushParams): void;
}

export enum CompareDependencyTreeMatch {
    NO_MATCH = "NO_MATCH",
    MATCH_PARTIAL = "MATCH_PARTIAL",
    MATCH_ALL = "MATCH_ALL"
}

export interface ICompareDependencyTreeCompareParams {
    references: IReferencesJson;
    tree: IDependencyTree;
}

export interface ICompareDependencyTreeCompareItemBase {
    name: string;
    reference: IReference;
    target: IReference;
}

export interface ICompareDependencyTreeCompareItemNoMatch
    extends ICompareDependencyTreeCompareItemBase {
    match: CompareDependencyTreeMatch.NO_MATCH;
}

export interface ICompareDependencyTreeCompareItemMatchPartial
    extends ICompareDependencyTreeCompareItemBase {
    match: CompareDependencyTreeMatch.MATCH_PARTIAL;
}

export interface ICompareDependencyTreeCompareItemMatchAll
    extends ICompareDependencyTreeCompareItemBase {
    match: CompareDependencyTreeMatch.MATCH_ALL;
}

export type ICompareDependencyTreeCompareItem =
    | ICompareDependencyTreeCompareItemNoMatch
    | ICompareDependencyTreeCompareItemMatchPartial
    | ICompareDependencyTreeCompareItemMatchAll;

export interface ICompareDependencyTreeResult {
    readonly items: ICompareDependencyTreeCompareItem[];
    add(item: ICompareDependencyTreeCompareItem): void;
    hasFaulty(): boolean;
    listNoMatch(): ICompareDependencyTreeCompareItemNoMatch[];
    listMatchPartial(): ICompareDependencyTreeCompareItemMatchPartial[];
    listMatchAll(): ICompareDependencyTreeCompareItemMatchAll[];
}

export interface ICompareDependencyTree {
    compare(params: ICompareDependencyTreeCompareParams): ICompareDependencyTreeResult;
}
