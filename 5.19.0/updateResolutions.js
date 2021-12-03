const { log, addResolutionToRootPackageJson } = require("../utils");

module.exports = async () => {
    log.info(
        `Inserting new entries into the ${log.info.hl(
            "resolutions"
        )} property in the root ${log.info.hl("package.json")} file...`
    );

    await addResolutionToRootPackageJson("package.json", {
        "@pulumi/pulumi": "3.19.0",
        "@pulumi/aws": "4.28.0"
    });

    log.success(`The following resolutions entries were successfully added:`);
    console.log(`‣ "@pulumi/pulumi": "3.19.0",`)
    console.log(`‣ "@pulumi/aws": "4.28.0"`)

    console.log();
};
