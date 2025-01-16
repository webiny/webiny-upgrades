import path from "path";
import fs from "fs";
import prettier from "prettier";
import log from "./log";
import execa from "execa";

const removeFilesFromGitChangedFiles = ["yarn.lock", ".gitignore", ".prettierignore"];

const getGitChangedFiles = async (): Promise<string[]> => {
    try {
        const result = await execa("git", ["ls-files", "-m"], {
            cwd: process.cwd(),
            cleanup: true
        });

        if (typeof result?.stdout !== "string") {
            return [];
        }
        const files = result.stdout.split("\n");

        return files.filter(file => {
            return removeFilesFromGitChangedFiles.includes(file) === false;
        });
    } catch (ex) {
        log.error(ex);
        return [];
    }
};

const getPrettierOptions = async (filePath: string) => {
    try {
        return await prettier.resolveConfig(filePath);
    } catch {
        return null;
    }
};

export const prettierFormat = async (input: string[]) => {
    const gitFiles = await getGitChangedFiles();
    /**
     * We can merge both git files and input files, but we need to make sure that we don't have duplicates.
     */
    const files = gitFiles.concat([...input.filter(file => gitFiles.includes(file) === false)]);

    try {
        log.info("Formatting updated code...");
        for (const file of files) {
            const filePath = path.join(process.cwd(), file);
            if (fs.existsSync(filePath) === false) {
                log.warning("File %s does not exist, skipping prettier...", file);
                continue;
            }
            const options = await getPrettierOptions(filePath);
            if (!options) {
                log.warning("Failed to get prettier options for %s, skipping prettier...", file);
                continue;
            }
            const fileContentRaw = fs.readFileSync(filePath).toString("utf8");
            log.debug("%s", file);
            const fileContentFormatted = await prettier.format(fileContentRaw, {
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
