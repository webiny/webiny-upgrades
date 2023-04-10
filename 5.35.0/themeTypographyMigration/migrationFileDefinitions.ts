import {Context} from "../../types";
import {createFilePath, FileDefinition} from "../../utils";
import {SyntaxKind} from "ts-morph";
import {
    FunctionTypeInstruction,
    InterfaceMigrationDefinition,
    PropertySignatureInstruction,
    TypeLiteralInstruction,
    TypeReferenceInstruction,
    UnionTypeInstruction
} from "./migrateInterface";

import {TypeAliasMigrationDefinition} from "./migrateType";

export type TypographyUpgradeType =
    | "imports"
    | "expressions"
    | "interfaces"
    | "types"
    | "classes"
    | "statements";

export type MigrationInstructions = {
    imports?: { declarations: ImportDeclarationDefinition[] };
    types?: TypeAliasMigrationDefinition[];
    interfaces?: InterfaceMigrationDefinition[];
    statements?: Record<string, any>;
};

export type ImportDeclarationDefinition = {
    insertDefaultImport: string;
    moduleSpecifier?: string;
    removeNamedImports?: string[];
    addNamedImports?: string[];
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
                imports: {
                    declarations: [
                        {
                            moduleSpecifier: "../../../theme",
                            removeNamedImports: ["Theme"],
                            addNamedImports: ["DecoratedTheme"]
                        }
                    ] as ImportDeclarationDefinition[]
                },
                interfaces: [
                    {
                        name: "PageElementsProviderProps",
                        members: [
                            {
                                name: "theme",
                                typeInstruction: {
                                    typeName: "Theme",
                                    updateToTypeName: "DecoratedTheme",
                                    syntaxKind: SyntaxKind.TypeReference
                                } as TypeReferenceInstruction
                            }
                        ]
                    },
                    {
                        name: "SetStylesCallbackParams",
                        members: [
                            {
                                name: "styles",
                                typeInstruction: {
                                    syntaxKind: SyntaxKind.UnionType,
                                    unionTypes: [
                                        {
                                            syntaxKind: SyntaxKind.FunctionType,
                                            params: [
                                                {
                                                    name: "theme",
                                                    typeInstruction: {
                                                        syntaxKind: SyntaxKind.TypeReference,
                                                        typeName: "Theme",
                                                        updateToTypeName: "DecoratedTheme"
                                                    } as TypeReferenceInstruction
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ] as InterfaceMigrationDefinition[],
                types: [
                    {
                        name: "GetStyles",
                        typeInstruction: {
                            syntaxKind: SyntaxKind.FunctionType,
                            params: [
                                {
                                    name: "styles",
                                    typeInstruction: {
                                        syntaxKind: SyntaxKind.UnionType,
                                        unionTypes: [
                                            {
                                             syntaxKind: SyntaxKind.FunctionType,
                                             params: [
                                                 {
                                                     name: "theme",
                                                     typeInstruction: {
                                                         syntaxKind: SyntaxKind.TypeReference,
                                                         typeName: "Theme",
                                                         updateToTypeName: "DecoratedTheme",
                                                     }
                                                 }
                                             ]
                                            }
                                        ]
                                    } as UnionTypeInstruction
                                }
                            ]
                        } as FunctionTypeInstruction
                    },
                    {
                        name: "ElementAttributesModifier",
                        typeInstruction: {
                            syntaxKind: SyntaxKind.FunctionType,
                            params: [
                                {
                                    name: "args",
                                    typeInstruction: {
                                        syntaxKind: SyntaxKind.TypeLiteral,
                                        members: [
                                            {
                                                name: "theme",
                                                typeInstruction: {
                                                    syntaxKind: SyntaxKind.TypeReference,
                                                    typeName: "Theme",
                                                    updateToTypeName: "DecoratedTheme"
                                                }
                                            }
                                        ] as PropertySignatureInstruction[]
                                    } as TypeLiteralInstruction
                                }
                            ]
                        }
                    },
                    {
                        name: "ElementStylesModifier",
                        typeInstruction: {
                            syntaxKind: SyntaxKind.FunctionType,
                            params: [
                                {
                                    name: "args",
                                    typeInstruction: {
                                        syntaxKind: SyntaxKind.TypeLiteral,
                                        members: [
                                            {
                                                name: "theme",
                                                typeInstruction: {
                                                    syntaxKind: SyntaxKind.TypeReference,
                                                    typeName: "Theme",
                                                    updateToTypeName: "DecoratedTheme"
                                                }
                                            }
                                        ] as PropertySignatureInstruction[]
                                    } as TypeLiteralInstruction
                                }
                            ]
                        }
                    }
                ] as TypeAliasMigrationDefinition[]
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
                }
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
