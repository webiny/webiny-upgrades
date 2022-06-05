const websiteApp = require("./websiteApp");

module.exports = async context => {
    /**
     * Replace Page/index.tsx and graphql.ts files.
     */
    await websiteApp.run(context);
};
