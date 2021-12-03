const path = require("path");
const fs = require("fs");
const prettier = require("prettier");
const log = require("./log");

const prettierFormat = async files => {
    try {
        log.info("Formatting updated code...");
        for (const file of files) {
            const filePath = path.join(process.cwd(), file);
            const options = await prettier.resolveConfig(filePath);
            const fileContentRaw = fs.readFileSync(filePath).toString("utf8");
            const fileContentFormatted = prettier.format(fileContentRaw, {
                ...options,
                filepath: filePath
            });
            fs.writeFileSync(filePath, fileContentFormatted);
        }

        log.success("Updated code formatted successfully.");
        console.log();
    } catch (ex) {
        console.log(log.error.hl("Prettier failed."));
        log.error(ex.message);
        if (ex.stdout) {
            console.log(ex.stdout);
        }
    }
};

module.exports = prettierFormat;
