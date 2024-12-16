import { createProcessor } from "../processors";
import { loadReferencesFile } from "./file";
import { listAllPackageJsonFiles } from "./listAllPackageJsonFiles";
import { CompareDependencyTree } from "./CompareDependencyTree";
import { createDependencyTree } from "./tree";
import yesno from "yesno";

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
        "Found dependencies that are not in sync. Please sync them before continuing with the upgrade process..."
    );
    const noMatchItems = results.listNoMatch();
    for (const result of noMatchItems) {
        console.log(`Dependency "${result.name}" is not in sync.`);
        console.log(`- Reference: ${result.reference.versions.map(v => v.version).join(", ")}`);
        console.log(`- Project: ${result.target.versions.map(v => v.version).join(", ")}`);
    }
    const partialItems = results.listMatchPartial();
    if (partialItems.length) {
        for (const result of partialItems) {
            console.log(`Dependency "${result.name}" is partially in sync.`);
            console.log(`- Reference: ${result.reference.versions.map(v => v.version).join(", ")}`);
            console.log(`- Project: ${result.target.versions.map(v => v.version).join(", ")}`);
        }
    }

    const ok = await yesno({
        question: "There are dependencies which are not in sync, do you want to continue (y/N):",
        defaultValue: false
    });

    if (!ok) {
        params.context.log.error("Upgrade aborted.");
        process.exit(0);
    }
});
