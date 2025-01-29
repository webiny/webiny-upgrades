import yesno from "yesno";
import { createProcessor } from "../processors";
import { loadReferencesFile } from "./referencesFile";
import { listAllPackageJsonFiles } from "./listAllPackageJsonFiles";
import { CompareDependencyTree } from "./CompareDependencyTree";
import { createDependencyTree } from "./tree";
import { ICompareDependencyTreeCompareItem } from "./types";
import { ConsoleLogger } from "../log";
import { yarnUp } from "../yarnUp";

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

    const compareDependencyTree = new CompareDependencyTree({
        /**
         * We will skip some packages of our packages as we did not use the versions correctly.
         */
        skipPackages: ["theme"]
    });

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

    console.log("");
    console.log("package.json files which have dependencies out of sync:");
    const packageJsonFiles = results.listFiles();
    for (const file of packageJsonFiles) {
        console.log(` - ${file}`);
    }

    console.log("");
    console.log("Dependencies out of sync (yours (Webiny)):");
    const noMatchItems = results.listNoMatch();
    for (const result of noMatchItems) {
        console.log(` - ` + createOutOfSyncMessage(context.log, result));
    }

    const partialItems = results.listMatchPartial();
    if (partialItems.length) {
        console.log("");
        console.log("Dependencies partially out of sync:");
        for (const result of partialItems) {
            console.log(` - ` + createOutOfSyncMessage(context.log, result));
        }
    }

    console.log("");
    const ok = await yesno({
        question: "Do you want us to upgrade those dependencies? (y/N):",
        defaultValue: false
    });

    if (!ok) {
        console.log("");
        const upgrade = await yesno({
            question: context.log.colors.warning(
                "We strongly recommend you update the dependencies. Failing to do so may result in unexpected problems. Do you still want to continue with the project upgrade and skip updating dependencies? (y/N)"
            ),
            defaultValue: false
        });
        if (!upgrade) {
            context.log.error("Upgrade aborted.");
            process.exit(0);
        }
    }

    const packages = [...noMatchItems, ...partialItems].reduce((collection, pkg) => {
        const version = pkg.reference.versions[0].version;
        if (!version) {
            return collection;
        }
        collection[pkg.name] = version;
        return collection;
    }, {});

    await yarnUp(packages);
});
