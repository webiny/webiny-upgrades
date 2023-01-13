import { Context } from "../types";
import { createFilePath, Files, FileDefinition } from "../utils";

export const setupFiles = (context: Context): Files => {
    /**
     * Add files that will be used at some point in the upgrade process.
     */
    const files = new Files(context, [
        new FileDefinition({
            path: createFilePath(context, "${graphql}/src/index.ts"),
            tag: "gql",
            name: "graphql/index"
        }),
        new FileDefinition({
            path: createFilePath(context, "${graphql}/src/types.ts"),
            tag: "gql",
            name: "graphql/types"
        }),
        new FileDefinition({
            path: createFilePath(context, "${admin}/src/plugins/headlessCms.ts"),
            tag: "gql",
            name: "admin/headlessCms"
        }),
        // Themes/Website
        new FileDefinition({
            path: createFilePath(context, "${theme}/formBuilder/styles/theme.scss"),
            tag: "theme",
            name: "formBuilder/styles/theme.scss"
        }),
        new FileDefinition({
            path: createFilePath(context, "${theme}/pageBuilder/styles/elements/layout.scss"),
            tag: "theme",
            name: "pageBuilder/styles/elements/layout.scss"
        }),
        new FileDefinition({
            path: createFilePath(context, "${theme}/pageBuilder/styles/elements/image.scss"),
            tag: "theme",
            name: "pageBuilder/styles/elements/image.scss"
        }),
        new FileDefinition({
            path: createFilePath(context, "${theme}/pageBuilder/styles/base.scss"),
            tag: "theme",
            name: "pageBuilder/styles/base.scss"
        }),
        new FileDefinition({
            path: createFilePath(context, "${website}/src/components/Page/Render.tsx"),
            tag: "website",
            name: "website/render"
        }),
        new FileDefinition({
            path: createFilePath(context, "${website}/src/components/Page/graphql.ts"),
            tag: "website",
            name: "website/components/Page/graphql.ts"
        }),
        new FileDefinition({
            path: createFilePath(context, "${admin}/src/plugins/pageBuilder/editorPlugins.ts"),
            tag: "admin",
            name: "admin/plugins/pageBuilder/editorPlugins.ts"
        }),
        new FileDefinition({
            path: createFilePath(context, "${root}/webiny.project.ts"),
            tag: "core",
            name: "webiny.project.ts"
        })
    ]);

    return files.relevant();
};
