import glob from "fast-glob";
import fs from "fs";

type PathParam = string;

type Find = {
    find: string | RegExp;
};

type FindInPathParam = Find | Find[];

type FindInPathResultItem = { content: string; path: string };
type FindInPathResult = FindInPathResultItem[];

export const findInPath = (path: PathParam, find: FindInPathParam) => {
    // Make sure that file paths use forward-slashes.
    path = path.replace(/\\/g, "/");

    const paths = glob.sync(path);
    const finds = Array.isArray(find) ? find : [find];

    const results: FindInPathResult = [];

    for (let i = 0; i < paths.length; i++) {
        const currentPath = paths[i];
        const file = fs.readFileSync(currentPath, "utf8");

        for (let j = 0; j < finds.length; j++) {
            const currentReplacement = finds[j];
            const findRegex =
                typeof currentReplacement.find === "string"
                    ? new RegExp(currentReplacement.find, "g")
                    : currentReplacement.find;

            if (file.match(findRegex)) {
                results.push({ content: file, path: currentPath });
            }
        }
    }

    return results;
};
