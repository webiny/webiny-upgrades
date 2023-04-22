import { Context } from "../../types";
import { createFilePath, FileDefinition } from "../../utils";

import { ThemeFileMigrationDefinition } from "./migrationTypes";

const themeLayoutUpgradeDefinition = (context: Context): ThemeFileMigrationDefinition[] => {
    return [
        {
            file: new FileDefinition({
                path: createFilePath(context, "${theme}/layouts/pages/Static/Footer.tsx"),
                tag: "theme",
                name: "/layouts/pages/Static/Footer.tsx"
            }),
            migrationInstructions: {
                imports: [
                    {
                        moduleSpecifier: "../../../theme",
                        remove: true
                    }
                ]
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(context, "${theme}/layouts/pages/Static/Header.tsx"),
                tag: "theme",
                name: "/layouts/pages/Static/Header.tsx"
            }),
            migrationInstructions: {
                imports: [
                    {
                        moduleSpecifier: "../../../theme",
                        remove: true
                    }
                ]
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(context, "${theme}/layouts/pages/Static/HeaderDesktop.tsx"),
                tag: "theme",
                name: "/layouts/pages/Static/HeaderDesktop.tsx"
            }),
            migrationInstructions: {
                imports: [
                    {
                        moduleSpecifier: "../../../theme",
                        remove: true
                    }
                ]
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(context, "${theme}/layouts/pages/Static/HeaderMobile.tsx"),
                tag: "theme",
                name: "/layouts/pages/Static/HeaderMobile.tsx"
            }),
            migrationInstructions: {
                imports: [
                    {
                        moduleSpecifier: "../../../theme",
                        remove: true
                    }
                ]
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(context, "${theme}/layouts/pages/Static/Navigation.tsx"),
                tag: "theme",
                name: "/layouts/pages/Static/Navigation.tsx"
            }),
            migrationInstructions: {
                imports: [
                    {
                        moduleSpecifier: "../../../theme",
                        remove: true
                    }
                ]
            }
        }
    ];
};

export const themeMigrationFilesSetup = (context: Context): ThemeFileMigrationDefinition[] => {
    return [...themeLayoutUpgradeDefinition(context)];
};
