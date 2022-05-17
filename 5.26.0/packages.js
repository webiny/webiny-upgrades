const path = require("path");
const fs = require("fs");
const { log } = require("../utils");
const json5 = require("json5");

const tsconfigFile = `tsconfig.build.json`;
const packageJsonFile = `package.json`;

const logSkip = file => {
    log.info(`Skipping ${file} upgrade. Please upgrade it manually, if possible.`);
};

const readFile = file => {
    if (fs.existsSync(file) === false) {
        log.error(`Missing ${file}.`);
        logSkip(file);
        return null;
    }

    try {
        return fs.readFileSync(file).toString();
    } catch (ex) {
        log.error(`Could not read ${file}.`);
        log.info(ex.message);
        logSkip();
    }
    return null;
};

const parseContent = (file, content) => {
    if (!content) {
        return null;
    }
    try {
        return JSON.parse(content);
    } catch {}
    try {
        return json5.parse(content);
    } catch (ex) {
        log.error(`Could not parse ${file}.`);
        log.info(ex.message);
        logSkip();
    }
    return null;
};

const writeFile = (file, parsed) => {
    let stringified = {};
    try {
        stringified = JSON.stringify(parsed);
    } catch {
        stringified = json5.stringify(parsed);
    }

    try {
        fs.writeFileSync(file, stringified);
    } catch (ex) {
        log.error(`Could not store ${file}`);
        log.info(ex.message);
        logSkip();
    }
};

const updateTsConfig = (file, parsed) => {
    if (!parsed) {
        console.log("No parsed tsconfig.build.json content.");
        logSkip(file);
        return;
    }
    if (!parsed.compilerOptions) {
        log.error(`Missing compilerOptions in ${file}.`);
        logSkip();
        return;
    }
    log.info("Updating tsconfig...");

    parsed.compilerOptions.target = "esnext";
    parsed.compilerOptions.module = "esnext";
    parsed.compilerOptions.lib = ["esnext"];
    writeFile(file, parsed);
    log.info("...done");
};

const updatePackageJson = (file, parsed) => {
    if (!parsed) {
        console.log("No parsed package.json content.");
        logSkip(file);
        return;
    }

    log.info("Updating package.json...");

    parsed.resolutions = {
        ...(parsed.resolutions || {}),
        typescript: "4.5.5"
    };

    writeFile(file, parsed);
    log.info("...done");
};
/**
 *
 * @param context {Object}
 * @return {Promise<void>}
 */
const removeLibDom = async context => {
    const tsconfigFilePath = path.join(context.project.root, `${tsconfigFile}`);
    const packageJsonFilePath = path.join(context.project.root, `${packageJsonFile}`);

    const tsconfigContent = readFile(tsconfigFilePath);
    const packageJsonContent = readFile(packageJsonFilePath);

    const tsconfigParsed = parseContent(tsconfigFilePath, tsconfigContent);
    const packageJsonParsed = parseContent(packageJsonFilePath, packageJsonContent);

    updateTsConfig(tsconfigFilePath, tsconfigParsed);

    updatePackageJson(packageJsonFilePath, packageJsonParsed);
};

module.exports = {
    getFiles: () => {
        return [tsconfigFile, packageJsonFile];
    },
    removeLibDom
};
