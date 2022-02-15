const fs = require("fs");
const glob = require("fast-glob");
const path = require("path");
const { log } = require("../utils");

const pulumiPath = "api/pulumi/";

const targets = [
    /**
     * This will search for all TS files in directories under the pulumi directory.
     * User might have some of his own environments set, that is why the **.
     */
    `${pulumiPath}/**/*.ts`
];

/**
 *
 * @param context {Object}
 * @return {Promise<string[]>}
 */
const getFiles = async context => {
    if (!context || !context.project || !context.project.root) {
        return [];
    }
    return glob(
        targets.map(target => {
            return path.join(context.project.root, target);
        })
    );
};
/**
 * @param context {Object}
 * @param params {{files: string[]}}
 *
 * @return {Promise<void>}
 */
const upgradeProject = async (context, { files }) => {
    /**
     * First lets check if there are more environment directories other than dev and prod, which are built in.
     */
    const re = new RegExp(`${pulumiPath}([a-z0-9]+)/`, "i");
    const environments = files.reduce((collection, file) => {
        const matches = file.match(re);
        if (!matches) {
            return collection;
        }
        const env = matches[1];
        if (collection.includes(env) === true) {
            return collection;
        }

        collection.push(env);

        return collection;
    }, []);
    /**
     * Note to user if there are additional environments detected.
     */
    if (environments.length > 0) {
        log.info(`We detect additional environments (${environments.map(env => `"${env}"`)}).`);
        log.info(
            "We will go through .ts files in those environments and upgrade the lambda definition to Node 14."
        );
        log.warning(
            `After the upgrade process is done, please verify that all Lambda definitions in your custom environments are set to "nodejs14.x". Previous it was "nodejs12.x".`
        );
    }
    const nodejs12Re = new RegExp(/nodejs12\.x/g);
    /**
     * Replace the node target.
     */
    for (const file of files) {
        let contents = fs.readFileSync(file).toString();

        contents = contents.replace(nodejs12Re, `nodejs14.x`);

        fs.writeFileSync(file, contents);
    }
};

module.exports = {
    upgradeProject,
    getFiles
};
