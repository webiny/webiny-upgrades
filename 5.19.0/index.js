const { yarnInstall } = require("../utils");

const updateResolutions = require("./updateResolutions");

module.exports = async context => {
    await updateResolutions(context);

    /**
     * Install new packages.
     */
    await yarnInstall({
        context
    });
};
