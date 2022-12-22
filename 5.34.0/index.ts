import { yarnInstall } from "../utils";

module.exports = async () => {
    // Install dependencies.
    await yarnInstall();
};
