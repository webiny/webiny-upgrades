import yesno from "yesno";
import { createProcessor } from "../processors";
import { loadReferencesFile } from "./file";
import { listAllPackageJsonFiles } from "./listAllPackageJsonFiles";
import { CompareDependencyTree } from "./CompareDependencyTree";
import { createDependencyTree } from "./tree";
import { createUpdateAllDependenciesMessage } from "./messages/update";
import { ICompareDependencyTreeCompareItem } from "./types";
import { ConsoleLogger } from "../log";

const createOutOfSyncMessage = (
    log: ConsoleLogger,
    item: ICompareDependencyTreeCompareItem
): string => {
    return `${item.name}: ${item.target.versions
        .map(v => `${log.colors.error(v.version)}`)
        .join(", ")} (${item.reference.versions
        .map(v => `${log.colors.success(v.version)}`)
        .join(", ")})`;
};

export const syncDependenciesProcessor = createProcessor(async params => {
    const { context } = params;

    const references = await loadReferencesFile(params);

    let workspaces: string[];
    try {
        workspaces = context.project.getWorkspaces();
    } catch (ex) {
        context.log.error("Could not load workspaces.");
        throw ex;
    }

    const files = listAllPackageJsonFiles({
        context,
        workspaces
    });

    const tree = createDependencyTree({
        context,
        files
    });

    const compareDependencyTree = new CompareDependencyTree();

    const results = compareDependencyTree.compare({
        tree,
        references
    });
    if (results.hasFaulty() === false) {
        context.log.success("All dependencies are in sync.");
        return;
    }
    context.log.warning(
        "Found dependencies that are out of sync. Please sync them before continuing with the upgrade process..."
    );

    console.log("Dependencies out of sync:");
    const noMatchItems = results.listNoMatch();
    for (const result of noMatchItems) {
        console.log(createOutOfSyncMessage(context.log, result));
    }

    const partialItems = results.listMatchPartial();
    if (partialItems.length) {
        console.log("Dependencies partially in sync:");
        for (const result of partialItems) {
            console.log(createOutOfSyncMessage(context.log, result));
        }
    }

    console.log("");
    console.log("You can update all dependencies to the versions Webiny is using with:");
    console.log("");
    console.log(
        context.log.colors.info(
            createUpdateAllDependenciesMessage({
                noMatchItems,
                partialItems
            })
        )
    );

    console.log("");
    const ok = await yesno({
        question: "Do you want to continue with the project upgrade? (y/N):",
        defaultValue: false
    });

    if (!ok) {
        params.context.log.error("Upgrade aborted.");
        process.exit(0);
    }
});
