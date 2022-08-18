interface NamedExport {
    name: string;
    alias?: string;
}
export const createNamedExports = (
    name: string | string[] | Record<string, string>
): NamedExport[] | undefined => {
    if (typeof name === "string") {
        return undefined;
    } else if (Array.isArray(name) === true) {
        return (name as string[]).map(n => ({
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
