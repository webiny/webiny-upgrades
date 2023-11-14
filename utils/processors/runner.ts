import { createMorphProject } from "../createMorphProject";
import { Context, IFiles, IProcessor } from "../../types";

export const runProcessors = async (files: IFiles, processors: IProcessor[], context: Context) => {
    const rawFiles = files.paths();
    const project = createMorphProject(rawFiles);
    for (const processor of processors) {
        const result = await processor({
            context,
            project,
            files
        });

        if (result && result?.skipped !== true) {
            console.log();
        }
    }
    // Save file changes.
    await project.save();
};
