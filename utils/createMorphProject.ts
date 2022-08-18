import { Project } from "ts-morph";

export const createMorphProject = (files: string[]): Project => {
    const project = new Project();
    for (const file of files) {
        project.addSourceFileAtPath(file);
    }
    return project;
};
