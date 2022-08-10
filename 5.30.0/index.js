const { upgradeProject } = require("./upgradeProject");

module.exports = async context => {
    await upgradeProject(context);
};
