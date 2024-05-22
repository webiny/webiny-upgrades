import { createMorphProject } from "../createMorphProject";
import { Context, IFiles, IProcessor } from "../../types";

export const runProcessors = async (files: IFiles, processors: IProcessor[], context: Context) => {
    const rawFiles = files.paths();
    const project = createMorphProject(rawFiles);
    for (const processor of processors) {
        await processor({
            context,
            project,
            files
        });
    }
    // Save file changes.
    await project.save();
};

export interface ICreateProcessorRunnerParams {
    files: IFiles;
    context: Context;
}

export const createProcessorRunner = (params: ICreateProcessorRunnerParams) => {
    return {
        execute: async (processors: IProcessor[]) => {
            const { files, context } = params;
            const rawFiles = files.paths();
            const project = createMorphProject(rawFiles);
            for (const processor of processors) {
                await processor({
                    context,
                    project,
                    files
                });

                // Let's have an empty line between each processor.
                console.log();
            }
            // Save file changes.
            await project.save();
        }
    };
};
