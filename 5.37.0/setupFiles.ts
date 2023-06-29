import { Context } from "../types";
import { createFilePath, Files, FileDefinition } from "../utils";

export const setupFiles = (context: Context): Files => {
    /**
     * Add files that will be used at some point in the upgrade process.
     */
    const files = new Files(context, [
        new FileDefinition({
            path: createFilePath(context, "${graphql}/src/security.ts"),
            tag: "gql",
            name: "api/graphql/security"
        }),
        new FileDefinition({
            path: createFilePath(context, "${graphql}/src/index.ts"),
            tag: "gql",
            name: "api/graphql/index"
        }),
        new FileDefinition({
            path: createFilePath(context, "${graphql}/package.json"),
            tag: "gql",
            name: "api/graphql/package.json"
        }),

        new FileDefinition({
            path: createFilePath(context, "${admin}/src/plugins/pageBuilder/editorPlugins.ts"),
            tag: "admin",
            name: "admin/plugins/pageBuilder/editorPlugins"
        }),
        new FileDefinition({
            path: createFilePath(context, "${admin}/src/plugins/pageBuilder/renderPlugins.ts"),
            tag: "admin",
            name: "admin/plugins/pageBuilder/renderPlugins"
        }),
        new FileDefinition({
            path: createFilePath(context, "${website}/src/plugins/pageBuilder.ts"),
            tag: "website",
            name: "website/plugins/pageBuilder"
        }),

        new FileDefinition({
            path: createFilePath(context, "${admin}/src/plugins/formBuilder.ts"),
            tag: "admin",
            name: "admin/plugins/formBuilder"
        }),

        new FileDefinition({
            path: createFilePath(context, "${website}/src/plugins/formBuilder.ts"),
            tag: "website",
            name: "website/plugins/formBuilder"
        }),

        new FileDefinition({
            path: createFilePath(context, "${theme}/layouts/forms/DefaultFormLayout/Field.tsx"),
            tag: "theme",
            name: "apps/theme/layouts/forms/DefaultFormLayout/Field"
        }),
        new FileDefinition({

            path: createFilePath(context, "${theme}/layouts/forms/DefaultFormLayout/fields/Select.tsx"),
            tag: "theme",
            name: "apps/theme/layouts/forms/DefaultFormLayout/fields/Select"
        })
    ]);

    return files.relevant();
};
