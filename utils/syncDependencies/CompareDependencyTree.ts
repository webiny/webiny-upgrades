import {
    CompareDependencyTreeMatch,
    ICompareDependencyTree,
    ICompareDependencyTreeCompareParams,
    ICompareDependencyTreeResult,
    IReference
} from "./types";
import { CompareDependencyTreeResult } from "./CompareDependencyTreeResult";

interface ICompareDependencyTreeCompareVersionParams {
    reference: IReference;
    target: IReference;
}

export interface ICompareDependencyTreeParams {
    skipPackages?: string[];
}

export class CompareDependencyTree implements ICompareDependencyTree {
    private readonly skipPackages: string[] = [];
    public constructor(params?: ICompareDependencyTreeParams) {
        this.skipPackages = params?.skipPackages || [];
    }

    public compare(params: ICompareDependencyTreeCompareParams): ICompareDependencyTreeResult {
        const { references, tree } = params;
        const results = new CompareDependencyTreeResult();
        for (const reference of references.references) {
            if (this.skipPackages.includes(reference.name)) {
                continue;
            }
            const target = tree.references.find(item => item.name === reference.name);
            if (!target) {
                continue;
            }

            const result = this.compareVersion({ reference, target });

            const file = target.versions[0]?.files?.[0]?.file || "unknown";

            results.add({
                file,
                name: reference.name,
                reference,
                target: target,
                match: result
            });
        }

        return results;
    }
    /**
     * This method will return NO_MATCH if target version does not match some of the reference versions.
     * If it matches a single referenced version, but there are many, it will return MATCH_PARTIAL.
     * If it matches all reference versions, it will return MATCH_ALL.
     */
    private compareVersion(
        params: ICompareDependencyTreeCompareVersionParams
    ): CompareDependencyTreeMatch {
        const { reference, target } = params;

        const all = reference.versions.every(ref => {
            return target.versions.every(tar => tar.version === ref.version);
        });
        if (all) {
            return CompareDependencyTreeMatch.MATCH_ALL;
        }

        const partial = reference.versions.some(ref => {
            return target.versions.some(tar => tar.version === ref.version);
        });
        if (partial) {
            return CompareDependencyTreeMatch.MATCH_PARTIAL;
        }

        return CompareDependencyTreeMatch.NO_MATCH;
    }
}
