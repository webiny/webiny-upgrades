import { Project } from "ts-morph";
import { Context } from "../types";
import { addPackagesToDependencies, Files } from "../utils";
import { replaceInPath } from "replace-in-path";

import path from "path";
import util from "util";
import ncpBase from "ncp";

const ncp = util.promisify(ncpBase.ncp);

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const updateToEmotion11 = async (params: Params): Promise<void> => {
    const { context, files } = params;

    context.log.info(`Upgrading Emotion library to version 11.`);

    // 1. Replace @emotion/core with the latest version of @emotion/react, and also
    // upgrade @emotion/styled to the latest version.
    // apps/website/package.json
    context.log.info(`Upgrading %s packages within the %s application.`, "@emotion", "Website");

    const websitePackageJsonFile = files.byName("website/package.json");

    addPackagesToDependencies(context, websitePackageJsonFile.path, {
        "@emotion/core": null,
        "@emotion/react": "^11.10.6"
    });

    // 2. Do the same for apps/theme.
    context.log.info(`Upgrading %s packages within the %s package.`, "@emotion", "Theme");

    const themePackageJsonFile = files.byName("theme/package.json");
    addPackagesToDependencies(context, themePackageJsonFile.path, {
        "@emotion/core": null,
        "@emotion/react": "^11.10.6",
        "@emotion/styled": "^11.10.6"
    });

    context.log.info(
        `Replacing all %s import statements with %s.`,
        "@emotion/core",
        "@emotion/react"
    );

    replaceInPath("apps/theme/**/*.*", [{ find: "@emotion/core", replaceWith: "@emotion/react" }]);
    replaceInPath("apps/website/**/*.*", [
        { find: "@emotion/core", replaceWith: "@emotion/react" }
    ]);

    // A quick fix that needs to be applied on the `SuccessMessage.tsx` file.
    // Not sure how this ended up in users projects or how it didn't cause issues before.
    replaceInPath("apps/theme/**/*.*", [
        {
            find: "styled\\(\\({ className }\\)",
            replaceWith: "styled(({ className } : { className?: string })"
        }
    ]);

    // 3. Generate global Emotion theme type.
    context.log.info(`Creating global theme TypesScript types in %s.`, "types/emotion/index.d.ts");
    await ncp(path.join(__dirname, "updateToEmotion11", "env"), path.join("types", "emotion"));

    context.log.success(`Successfully upgraded Emotion library to version 11.`);
};
