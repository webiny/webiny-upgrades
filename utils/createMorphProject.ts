import { Project } from "ts-morph";
import log from "./log";

export const createMorphProject = (files: string[]): Project => {
    const project = new Project();
    for (const file of files) {
        try {
            project.addSourceFileAtPath(file);
        } catch (e) {
            log.warning("Could not add %s file.", file);
        }
    }
    return project;
};
