import path from "path";
import fs from "fs";
import prettier from "prettier";
import log from "./log";

export const prettierFormat = async (files: string[]) => {
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
        log.error("%s", "Prettier failed.");
        log.error(ex.message);
        if (ex.stdout) {
            console.log(ex.stdout);
        }
    }
};
