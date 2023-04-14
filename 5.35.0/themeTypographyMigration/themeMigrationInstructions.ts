import { Context } from "../../types";
import { createFilePath, FileDefinition } from "../../utils";
import { SyntaxKind } from "ts-morph";
import {
    ThemeFileMigrationDefinition,
} from "./migrationTypes";

const themeLayoutUpgradeDefinition = (context: Context): ThemeFileMigrationDefinition[] => {
    return [
        {
            file: new FileDefinition({
                path: createFilePath(context, "${theme}/layouts/pages/Static/Footer.tsx"),
                tag: "theme",
                name: "/layouts/pages/Static/Footer.tsx"
            })
        },
        {
            file: new FileDefinition({
                path: createFilePath(context, "${theme}/layouts/pages/Static/Header.tsx"),
                tag: "theme",
                name: "/layouts/pages/Static/Header.tsx"
            })
        },
        {
            file: new FileDefinition({
                path: createFilePath(context, "${theme}/layouts/pages/Static/HeaderDesktop.tsx"),
                tag: "theme",
                name: "/layouts/pages/Static/HeaderDesktop.tsx"
            })
        },
        {
            file: new FileDefinition({
                path: createFilePath(context, "${theme}/layouts/pages/Static/Navigation.tsx"),
                tag: "theme",
                name: "/layouts/pages/Static/Navigation.tsx"
            })
        }
    ];
};


export const themeMigrationInstructions = (context: Context): ThemeFileMigrationDefinition[] => {
    return [
        ...themeLayoutUpgradeDefinition(context)
    ];
};
