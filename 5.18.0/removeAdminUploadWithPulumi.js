const path = require("path");
const fs = require("fs");
const { log } = require("../utils");

module.exports = async context => {
    log.info(`Updating Admin Area Pulumi code (%s)...`, "apps/admin/pulumi/app");

    const project = context.project;

    const pulumiIndexPath = path.join(project.root, "apps", "admin", "pulumi", "index.ts");
    const pulumiAppPath = path.join(project.root, "apps", "admin", "pulumi", "app.ts");
    if (fs.existsSync(pulumiIndexPath) && fs.existsSync(pulumiAppPath)) {
        let pulumiIndex = fs.readFileSync(pulumiIndexPath, "utf8");

        if (!pulumiIndex.match("appUrl: cloudfront")) {
            log.warning(`Could not update %s - you will need to do it manually.`, pulumiIndexPath);
        } else {
            pulumiIndex = pulumiIndex.replace(
                "appUrl: cloudfront",
                "appStorage: app.bucket.id, appUrl: cloudfront"
            );
            fs.writeFileSync(pulumiIndexPath, pulumiIndex);
            log.success(`%s successfully updated.`, pulumiIndexPath);

            const pulumiNewAppPath = path.join(
                __dirname,
                "removeAdminUploadWithPulumi",
                "newApp.ts"
            );
            fs.copyFileSync(pulumiNewAppPath, pulumiAppPath);
            log.success(`%s successfully updated.`, pulumiAppPath);
        }
    }

    console.log();
};
