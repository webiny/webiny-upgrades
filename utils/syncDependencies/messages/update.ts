import { ICompareDependencyTreeCompareItem } from "../types";

interface Params {
    noMatchItems: ICompareDependencyTreeCompareItem[];
    partialItems: ICompareDependencyTreeCompareItem[];
}

const getPackage = (item: ICompareDependencyTreeCompareItem): string | null => {
    const version = item.reference.versions[0];
    if (!version?.version) {
        return null;
    }
    return `"${item.name}@${version.version}"`;
};

export const createUpdateAllDependenciesMessage = ({
    noMatchItems,
    partialItems
}: Params): string => {
    const packages = [...noMatchItems, ...partialItems]
        .map(item => {
            return getPackage(item);
        })
        .filter(Boolean);

    return `yarn up ${packages.join(" ")}`;
};
