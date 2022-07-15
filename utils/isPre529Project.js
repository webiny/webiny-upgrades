const fs = require("fs");
const path = require("path");
/**
 * Check if the project is created on 5.29.0 or later.
 * Or it is an old type of project.
 *
 * @param context {Context}
 * @return {boolean}
 */
const isPre529Project = context => {
    return fs.existsSync(path.join(process.cwd(), "api"));
};

module.exports = {
    isPre529Project
};
