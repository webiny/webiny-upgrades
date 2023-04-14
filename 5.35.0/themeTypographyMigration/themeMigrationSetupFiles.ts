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
            }),
            migrationInstructions: {
                statements: {
                    variables: [{ name: "FooterLogo", syntaxKind: SyntaxKind.TemplateSpan }]
                }
            }
        },
       /* {
            file: new FileDefinition({
                path: createFilePath(context, "${theme}/layouts/pages/Static/Header.tsx"),
                tag: "theme",
                name: "/layouts/pages/Static/Header.tsx"
            }),
            migrationInstructions: {
                statements: {
                    variables: [{ name: "HeaderWrapper", syntaxKind: SyntaxKind.TemplateSpan }]
                }
            }
        }*/
    ];
};


export const themeMigrationSetupFiles = (context: Context): ThemeFileMigrationDefinition[] => {
    return [
        ...themeLayoutUpgradeDefinition(context)
    ];
};
