const tsMorph = require("ts-morph");

/**
 * @param files {string[]}
 * @return {tsMorph.Project}
 */
const createMorphProject = files => {
    const project = new tsMorph.Project();
    for (const file of files) {
        project.addSourceFileAtPath(file);
    }
    return project;
};

module.exports = createMorphProject;
