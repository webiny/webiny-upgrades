import { Project } from "ts-morph";

export const createMorphProject = (files: string[]): Project => {
    const project = new Project();
    for (const file of files) {
        try {
            project.addSourceFileAtPath(file);
        } catch (e) {
            console.log("file can't be found. File path: ", file);
        }
    }
    return project;
};
