import {
    CompareDependencyTreeMatch,
    ICompareDependencyTreeCompareItem,
    ICompareDependencyTreeCompareItemMatchAll,
    ICompareDependencyTreeCompareItemMatchPartial,
    ICompareDependencyTreeCompareItemNoMatch,
    ICompareDependencyTreeResult
} from "./types";

export class CompareDependencyTreeResult implements ICompareDependencyTreeResult {
    public readonly items: ICompareDependencyTreeCompareItem[] = [];

    public add(item: ICompareDependencyTreeCompareItem): void {
        this.items.push(item);
    }

    public hasFaulty(): boolean {
        return this.items.some(
            item =>
                item.match === CompareDependencyTreeMatch.NO_MATCH ||
                item.match === CompareDependencyTreeMatch.MATCH_PARTIAL
        );
    }

    public listNoMatch(): ICompareDependencyTreeCompareItemNoMatch[] {
        return this.items.filter((item): item is ICompareDependencyTreeCompareItemNoMatch => {
            return item.match === CompareDependencyTreeMatch.NO_MATCH;
        });
    }
    public listMatchPartial(): ICompareDependencyTreeCompareItemMatchPartial[] {
        return this.items.filter((item): item is ICompareDependencyTreeCompareItemMatchPartial => {
            return item.match === CompareDependencyTreeMatch.MATCH_PARTIAL;
        });
    }
    public listMatchAll(): ICompareDependencyTreeCompareItemMatchAll[] {
        return this.items.filter((item): item is ICompareDependencyTreeCompareItemMatchAll => {
            return item.match === CompareDependencyTreeMatch.MATCH_ALL;
        });
    }
}
