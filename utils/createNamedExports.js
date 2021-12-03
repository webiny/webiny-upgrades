/**
 *
 * @param name {string | string[] | Record<string, string>}
 * @return {{name: string, alias: string | undefined}[]|undefined}
 */
const createNamedImports = name => {
    if (typeof name === "string") {
        return undefined;
    } else if (Array.isArray(name) === true) {
        return name.map(n => ({
            name: n
        }));
    }
    return Object.keys(name).map(key => {
        return {
            name: key,
            alias: name[key]
        };
    });
};

module.exports = createNamedImports;
