import { createMorphProject } from "../createMorphProject";
import { Context, IFiles, IProcessor } from "../../types";

export const runProcessors = async (files: IFiles, processors: IProcessor[], context: Context) => {
    for (const processor of processors) {
        const rawFiles = files.paths();
        const project = createMorphProject(rawFiles);

        const result = await processor({
            context,
            project,
            files
        });

        if (result && result?.skipped !== true) {
            console.log();
        }

        // Save file changes.
        await project.save();
    }
};
