const { yarnInstall } = require("../utils");

const updateResolutions = require("./updateResolutions");
const addActionPlugin = require("./addActionPlugin");

module.exports = async context => {
    // Locks Pulumi packages.
    await updateResolutions(context);

    // Adds a new "action" settings plugin for the Page Builder Editor.
    await addActionPlugin(context);

    /**
     * Install new packages.
     */
    await yarnInstall({
        context
    });
};
