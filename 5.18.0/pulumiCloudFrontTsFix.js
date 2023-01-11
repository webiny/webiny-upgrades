const path = require("path");
const fs = require("fs");
const { log } = require("../utils");

module.exports = async context => {
    log.info(`Fixing TypeScript issue in %s`, "api/pulumi/dev/elasticSearch.ts");

    const project = context.project;

    const pulumiFilePath = path.join(project.root, "api", "pulumi", "dev", "elasticSearch.ts");
    if (fs.existsSync(pulumiFilePath)) {
        let pulumiFile = fs.readFileSync(pulumiFilePath, "utf8");
        pulumiFile = pulumiFile.replace(
            "Resource: this.domain.arn.apply(v => `${v}/*`)",
            "Resource: pulumi.interpolate`${this.domain.arn}/*`"
        );
        fs.writeFileSync(pulumiFilePath, pulumiFile);
        log.success(`%s`, "api/pulumi/dev/elasticSearch.ts");
    } else {
        log.warning(
            `Skipping fixing TypeScript issue in %s - file does not exist.`,
            "api/pulumi/dev/elasticSearch.ts"
        );
    }

    console.log();
};
