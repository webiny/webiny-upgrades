const util = require("util");
const ncpBase = require("ncp");
const ncp = util.promisify(ncpBase.ncp);

export const copyPaste = async (src: string, dest: string) => {
    await ncp(src, dest);
};
