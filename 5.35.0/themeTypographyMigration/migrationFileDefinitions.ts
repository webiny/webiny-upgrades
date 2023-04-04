import { Context } from "../../types";
import { createFilePath, FileDefinition } from "../../utils";


export type TypographyUpgradeType = "imports" | "expressions" | "interfaces" | "types" | 'classes';
export type MigrationInstructions = {
    [key in TypographyUpgradeType]?: Record<string, any>;
}

export type ThemeFileMigrationDefinition = {
    file: FileDefinition;
    /*
    * Detailed instructions about code changes
    * */
    migrationInstructions: MigrationInstructions;
}

const themeUpgradeDefinition = (context: Context): ThemeFileMigrationDefinition[] => {
    return [
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${theme}/layouts/forms/DefaultFormLayout/SuccessMessage.tsx"),
                    tag: "theme",
                    "name": "/layouts/forms/DefaultFormLayout/SuccessMessage.tsx",
                }
            ),
            migrationInstructions: {
                expressions: {}
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${theme}/layouts/forms/DefaultFormLayout/TermsOfServiceSection.tsx"),
                    tag: "theme",
                    "name": "/layouts/forms/DefaultFormLayout/TermsOfServiceSection.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {}
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${theme}/layouts/forms/DefaultFormLayout/fields/Input.tsx"),
                    tag: "theme",
                    "name": "/layouts/forms/DefaultFormLayout/fields/Input.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {}
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${theme}/layouts/forms/DefaultFormLayout/fields/Select.tsx"),
                    tag: "theme",
                    "name": "/layouts/forms/DefaultFormLayout/fields/Select.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {}
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${theme}/layouts/forms/DefaultFormLayout/fields/Textarea.tsx"),
                    tag: "theme",
                    "name": "/layouts/forms/DefaultFormLayout/fields/Textarea.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {}
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${theme}/layouts/forms/DefaultFormLayout/fields/components/Field.tsx"),
                    tag: "theme",
                    "name": "/layouts/forms/DefaultFormLayout/fields/components/Field.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {}
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${theme}/layouts/forms/DefaultFormLayout/fields/components/FieldErrorMessage.tsx"),
                    tag: "theme",
                    "name": "/layouts/forms/DefaultFormLayout/fields/components/FieldErrorMessage.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {}
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${theme}/layouts/forms/DefaultFormLayout/fields/components/FieldHelperMessage.tsx"),
                    tag: "theme",
                    "name": "/layouts/forms/DefaultFormLayout/fields/components/FieldHelperMessage.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {}
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${theme}/layouts/pages/Static/Footer.tsx"),
                    tag: "theme",
                    "name": "/layouts/pages/Static/Footer.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {},
                imports: {}
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${theme}/layouts/pages/Static/Header.tsx"),
                    tag: "theme",
                    "name": "/layouts/pages/Static/Header.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {},
                imports: {}
            }
        },
    ];
};

const appFormBuilderDefinitions = (context: Context): ThemeFileMigrationDefinition[] => {
    return [
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${package}/app-form-builder/src/page-builder/components/BeforeFormRender.tsx"),
                    tag: "fb",
                    "name": "/app-form-builder/src/page-builder/components/BeforeFormRender.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {},
                imports: {}
            }
        }
    ];
}

const appPageBuilderElementsDefinitions = (context: Context): ThemeFileMigrationDefinition[] => {
    return [
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${package}/app-page-builder-elements/src/types.ts"),
                    tag: "pb",
                    "name": "/app-page-builder-elements/src/types.ts"
                }
            ),
            migrationInstructions: {
                expressions: {},
                imports: {}
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${package}app-page-builder-elements/src/renderers/pagesList/pagesListComponents/defaultPagesListComponent.tsx"),
                    tag: "pb",
                    "name": "/app-page-builder-elements/src/renderers/pagesList/pagesListComponents/defaultPagesListComponent.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {},
                imports: {},
                types: {}
            }
        }
    ];
}

const cwpTemplateAwsDefinitions = (context: Context): ThemeFileMigrationDefinition[] => {
    return [
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${package}/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/SuccessMessage.tsx"),
                    tag: "cwp",
                    "name": "/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/SuccessMessage.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {},
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${package}/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/TermsOfServiceSection.tsx"),
                    tag: "cwp",
                    "name": "/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/TermsOfServiceSection.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {},
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${package}/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/Select.tsx"),
                    tag: "cwp",
                    "name": "/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/Select.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {},
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${package}/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/Input.tsx"),
                    tag: "cwp",
                    "name": "/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/Input.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {},
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${package}/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/Select.tsx"),
                    tag: "cwp",
                    "name": "/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/Select.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {},
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${package}/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/Textarea.tsx"),
                    tag: "cwp",
                    "name": "/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/Textarea.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {},
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${package}/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/components/Field.tsx"),
                    tag: "cwp",
                    "name": "/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/components/Field.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {},
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${package}/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/components/FieldErrorMessage.tsx"),
                    tag: "cwp",
                    "name": "/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/components/FieldErrorMessage.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {},
                interfaces: {},
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${package}/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/components/FieldHelperMessage.tsx"),
                    tag: "cwp",
                    "name": "/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/components/FieldHelperMessage.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {},
                imports: {},
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${package}/cwp-template-aws/template/common/apps/theme/layouts/pages/Static/Footer.tsx"),
                    tag: "cwp",
                    "name": "/cwp-template-aws/template/common/apps/theme/layouts/pages/Static/Footer.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {},
                imports: {},
            }
        },
        {
            file: new FileDefinition(
                {
                    path: createFilePath(context, "${package}/cwp-template-aws/template/common/apps/theme/layouts/pages/Static/Header.tsx"),
                    tag: "cwp",
                    "name": "/cwp-template-aws/template/common/apps/theme/layouts/pages/Static/Header.tsx"
                }
            ),
            migrationInstructions: {
                expressions: {},
                imports: {},
            }
        }

    ]
}

export const migrationFileDefinitions = (context: Context): ThemeFileMigrationDefinition[] => {
    /**
     * Add files that will be used at some point in the upgrade process.
     */
    const files = [
        ...themeUpgradeDefinition(context),
        ...appFormBuilderDefinitions(context),
        ...appPageBuilderElementsDefinitions(context),
        ...cwpTemplateAwsDefinitions(context),
        ...cwpTemplateAwsDefinitions(context)
    ];

    return files;
};
