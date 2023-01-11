const { log, addResolutionToRootPackageJson } = require("../utils");

module.exports = async () => {
    log.info(
        `Inserting new entries into the %s property in the root %s file...`,
        "resolutions",
        "package.json"
    );

    await addResolutionToRootPackageJson("package.json", {
        "@pulumi/pulumi": "3.19.0",
        "@pulumi/aws": "4.28.0"
    });

    log.success(`The following resolutions entries were successfully added:`);
    console.log(`‣ "@pulumi/pulumi": "3.19.0",`);
    console.log(`‣ "@pulumi/aws": "4.28.0"`);

    console.log();
};
