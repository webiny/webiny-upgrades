import { Context } from "../../types";
import { createFilePath, FileDefinition } from "../../utils";
import { ElementAccessExpression, SyntaxKind } from "ts-morph";

export type TypographyUpgradeType =
    | "imports"
    | "expressions"
    | "interfaces"
    | "types"
    | "classes"
    | "statements";
export type MigrationInstructions = {
    [key in TypographyUpgradeType]?: Record<string, any>;
};

export type ThemeFileMigrationDefinition = {
    file: FileDefinition;
    /*
     * Detailed instructions about code changes
     * */
    migrationInstructions: MigrationInstructions;
};

const themeLayoutUpgradeDefinition = (context: Context): ThemeFileMigrationDefinition[] => {
    return [
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${theme}/layouts/forms/DefaultFormLayout/SuccessMessage.tsx"
                ),
                tag: "theme",
                name: "/layouts/forms/DefaultFormLayout/SuccessMessage.tsx"
            }),
            migrationInstructions: {
                statements: {
                    variables: [
                        { name: "Heading", syntaxKind: SyntaxKind.ElementAccessExpression },
                        { name: "Message", syntaxKind: SyntaxKind.ElementAccessExpression }
                    ]
                }
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${theme}/layouts/forms/DefaultFormLayout/TermsOfServiceSection.tsx"
                ),
                tag: "theme",
                name: "/layouts/forms/DefaultFormLayout/TermsOfServiceSection.tsx"
            }),
            migrationInstructions: {
                statements: {
                    variables: [
                        { name: "RteFieldLabel", syntaxKind: SyntaxKind.ElementAccessExpression }
                    ]
                }
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${theme}/layouts/forms/DefaultFormLayout/fields/Input.tsx"
                ),
                tag: "theme",
                name: "/layouts/forms/DefaultFormLayout/fields/Input.tsx"
            }),
            migrationInstructions: {
                statements: {
                    variables: [
                        { name: "StyledInput", syntaxKind: SyntaxKind.ElementAccessExpression }
                    ]
                }
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${theme}/layouts/forms/DefaultFormLayout/fields/Select.tsx"
                ),
                tag: "theme",
                name: "/layouts/forms/DefaultFormLayout/fields/Select.tsx"
            }),
            migrationInstructions: {
                statements: {
                    variables: [
                        { name: "StyledSelect", syntaxKind: SyntaxKind.ElementAccessExpression }
                    ]
                }
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${theme}/layouts/forms/DefaultFormLayout/fields/Textarea.tsx"
                ),
                tag: "theme",
                name: "/layouts/forms/DefaultFormLayout/fields/Textarea.tsx"
            }),
            migrationInstructions: {
                statements: {
                    variables: [
                        { name: "StyledTextarea", syntaxKind: SyntaxKind.ElementAccessExpression }
                    ]
                }
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${theme}/layouts/forms/DefaultFormLayout/fields/components/Field.tsx"
                ),
                tag: "theme",
                name: "/layouts/forms/DefaultFormLayout/fields/components/Field.tsx"
            }),
            migrationInstructions: {
                statements: {
                    variables: [{ name: "Field", syntaxKind: SyntaxKind.ElementAccessExpression }]
                }
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${theme}/layouts/forms/DefaultFormLayout/fields/components/FieldErrorMessage.tsx"
                ),
                tag: "theme",
                name: "/layouts/forms/DefaultFormLayout/fields/components/FieldErrorMessage.tsx"
            }),
            migrationInstructions: {
                statements: {
                    variables: [{ name: "Wrapper", syntaxKind: SyntaxKind.TemplateSpan }]
                }
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${theme}/layouts/forms/DefaultFormLayout/fields/components/FieldHelperMessage.tsx"
                ),
                tag: "theme",
                name: "/layouts/forms/DefaultFormLayout/fields/components/FieldHelperMessage.tsx"
            }),
            migrationInstructions: {
                statements: {
                    variables: [{ name: "FieldHelperMessage", syntaxKind: SyntaxKind.TemplateSpan }]
                }
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(context, "${theme}/layouts/pages/Static/Footer.tsx"),
                tag: "theme",
                name: "/layouts/pages/Static/Footer.tsx"
            }),
            migrationInstructions: {
                statements: {
                    variables: [{ name: "FooterLogo", syntaxKind: SyntaxKind.TemplateSpan }]
                },
                imports: {
                    declarations: [
                        {
                            moduleSpecifier: "../../../theme",
                            insertDefaultImport: "theme",
                            removeNamedImports: ["typography"]
                        }
                    ]
                }
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(context, "${theme}/layouts/pages/Static/Header.tsx"),
                tag: "theme",
                name: "/layouts/pages/Static/Header.tsx"
            }),
            migrationInstructions: {
                statements: {
                    variables: [{ name: "HeaderWrapper", syntaxKind: SyntaxKind.TemplateSpan }]
                },
                imports: {
                    declarations: [
                        {
                            moduleSpecifier: "../../../theme",
                            insertDefaultImport: "theme",
                            removeNamedImports: ["typography"]
                        }
                    ]
                }
            }
        }
    ];
};

const appFormBuilderDefinitions = (context: Context): ThemeFileMigrationDefinition[] => {
    return [
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${package}/app-form-builder/src/page-builder/components/BeforeFormRender.tsx"
                ),
                tag: "fb",
                name: "/app-form-builder/src/page-builder/components/BeforeFormRender.tsx"
            }),
            migrationInstructions: {
                statements: {
                    variables: [{ name: "Before", syntaxKind: SyntaxKind.TemplateSpan }]
                }
            }
        }
    ];
};

const appPageBuilderElementsDefinitions = (context: Context): ThemeFileMigrationDefinition[] => {
    return [
        {
            file: new FileDefinition({
                path: createFilePath(context, "${package}/app-page-builder-elements/src/types.ts"),
                tag: "pb",
                name: "/app-page-builder-elements/src/types.ts"
            }),
            migrationInstructions: {
                expressions: {},
                imports: {}
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${package}app-page-builder-elements/src/renderers/pagesList/pagesListComponents/defaultPagesListComponent.tsx"
                ),
                tag: "pb",
                name: "/app-page-builder-elements/src/renderers/pagesList/pagesListComponents/defaultPagesListComponent.tsx"
            }),
            migrationInstructions: {
                statements: {
                    variables: [
                        {
                            name: "styles",
                            syntaxKind: SyntaxKind.PropertyAssignment,
                            nodeUpdates: [
                                // first level properties update
                                {
                                    symbolEscapedName: "h3",
                                    syntaxKind: SyntaxKind.PropertyAssignment,
                                    // node attached to the current child that contains the props
                                    initializerKind: SyntaxKind.PropertyAccessExpression,
                                    matchText: "theme.styles.typography"
                                },
                                {
                                    symbolEscapedName: "p",
                                    syntaxKind: SyntaxKind.PropertyAssignment,
                                    // node attached to the current child that contains the props
                                    initializerKind: SyntaxKind.PropertyAccessExpression,
                                    matchText: "theme.styles.typography"
                                },
                                {
                                    // spread assignments do not have name
                                    name: undefined,
                                    syntaxKind: SyntaxKind.SpreadAssignment,
                                    // expression attached to the current child that contains the props
                                    expression: SyntaxKind.PropertyAccessExpression,
                                    matchText: "...theme.styles.typography"
                                }
                            ]
                        }
                    ]
                },
                imports: {},
                types: {}
            }
        }
    ];
};

const cwpTemplateAwsDefinitions = (context: Context): ThemeFileMigrationDefinition[] => {
    return [
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${package}/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/SuccessMessage.tsx"
                ),
                tag: "cwp",
                name: "/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/SuccessMessage.tsx"
            }),
            migrationInstructions: {
                expressions: {}
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${package}/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/TermsOfServiceSection.tsx"
                ),
                tag: "cwp",
                name: "/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/TermsOfServiceSection.tsx"
            }),
            migrationInstructions: {
                expressions: {}
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${package}/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/Select.tsx"
                ),
                tag: "cwp",
                name: "/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/Select.tsx"
            }),
            migrationInstructions: {
                expressions: {}
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${package}/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/Input.tsx"
                ),
                tag: "cwp",
                name: "/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/Input.tsx"
            }),
            migrationInstructions: {
                expressions: {}
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${package}/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/Select.tsx"
                ),
                tag: "cwp",
                name: "/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/Select.tsx"
            }),
            migrationInstructions: {
                expressions: {}
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${package}/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/Textarea.tsx"
                ),
                tag: "cwp",
                name: "/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/Textarea.tsx"
            }),
            migrationInstructions: {
                expressions: {}
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${package}/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/components/Field.tsx"
                ),
                tag: "cwp",
                name: "/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/components/Field.tsx"
            }),
            migrationInstructions: {
                expressions: {}
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${package}/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/components/FieldErrorMessage.tsx"
                ),
                tag: "cwp",
                name: "/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/components/FieldErrorMessage.tsx"
            }),
            migrationInstructions: {
                expressions: {},
                interfaces: {}
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${package}/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/components/FieldHelperMessage.tsx"
                ),
                tag: "cwp",
                name: "/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/components/FieldHelperMessage.tsx"
            }),
            migrationInstructions: {
                expressions: {},
                imports: {}
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${package}/cwp-template-aws/template/common/apps/theme/layouts/pages/Static/Footer.tsx"
                ),
                tag: "cwp",
                name: "/cwp-template-aws/template/common/apps/theme/layouts/pages/Static/Footer.tsx"
            }),
            migrationInstructions: {
                expressions: {},
                imports: {}
            }
        },
        {
            file: new FileDefinition({
                path: createFilePath(
                    context,
                    "${package}/cwp-template-aws/template/common/apps/theme/layouts/pages/Static/Header.tsx"
                ),
                tag: "cwp",
                name: "/cwp-template-aws/template/common/apps/theme/layouts/pages/Static/Header.tsx"
            }),
            migrationInstructions: {
                expressions: {},
                imports: {}
            }
        }
    ];
};

export const migrationFileDefinitions = (context: Context): ThemeFileMigrationDefinition[] => {
    return [
        ...themeLayoutUpgradeDefinition(context),
        ...appFormBuilderDefinitions(context),
        ...appPageBuilderElementsDefinitions(context),
        ...cwpTemplateAwsDefinitions(context)
    ];
};

export const getVariableNodeUpdateInstructions = (
    symbolEscapedName: string,
    nodeUpdates: Record<string, any>[]
): Record<string, any> | undefined => {
    return nodeUpdates.find(x => x.symbolEscapedName === symbolEscapedName);
};
