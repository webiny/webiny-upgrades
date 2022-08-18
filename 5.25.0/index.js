const { yarnInstall } = require("../utils");
const reactTypes = require("./reactTypes");

module.exports = async context => {
    /**
     * Copy the react types files from cwp-template-aws
     */
    await reactTypes.run(context);

    /**
     * Install new packages.
     */
    await yarnInstall({
        context
    });
};
