import { Project, SyntaxKind } from "ts-morph";
import {
    addPackagesToDependencies,
    addToExportDefaultArray,
    Files,
    insertImportToSourceFile
} from "../utils";
import { Context } from "../types";
import * as fs from "fs";
import * as path from "path";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const updateFbPlugins = async (params: Params) => {
    const { project, files, context } = params;

    const adminPluginsFile = files.byName("admin/plugins/formBuilder");
    const websitePluginsFile = files.byName("website/plugins/formBuilder");

    {
        // 1. Admin plugins.
        const source = project.getSourceFile(adminPluginsFile.path);

        context.log.info(`Adding new Form Builder plugins (%s)`, adminPluginsFile.path);

        const imports = [
            {
                name: "editorTriggerGoogleAnalyticsEvent",
                moduleSpecifier:
                    "@webiny/app-form-builder/admin/plugins/editor/triggers/googleAnalyticsEvent"
            },

            // Date/time field.
            {
                name: "editorFieldDateTime",
                moduleSpecifier: "@webiny/app-form-builder/admin/plugins/editor/formFields/dateTime"
            },
            {
                name: "editorValidatorDateTimeGte",
                moduleSpecifier:
                    "@webiny/app-form-builder/admin/plugins/editor/formFieldValidators/dateTimeGte"
            },
            {
                name: "editorValidatorDateTimeLte",
                moduleSpecifier:
                    "@webiny/app-form-builder/admin/plugins/editor/formFieldValidators/dateTimeLte"
            },
            {
                name: "fieldValidatorDateTimeGte",
                moduleSpecifier: "@webiny/app-form-builder/render/plugins/validators/dateTimeGte"
            },
            {
                name: "fieldValidatorDateTimeLte",
                moduleSpecifier: "@webiny/app-form-builder/render/plugins/validators/dateTimeLte"
            }
        ];

        imports.forEach(currentImport => {
            insertImportToSourceFile({
                source,
                after: "@webiny/app-form-builder/admin/plugins/editor/triggers/redirect",
                ...currentImport
            });

            addToExportDefaultArray({
                source,
                target: currentImport.name
            });
        });
    }

    {
        // 2. Website editor plugins.
        const source = project.getSourceFile(websitePluginsFile.path);

        context.log.info(`Adding new Form Builder plugins (%s)`, websitePluginsFile.path);

        const imports = [
            {
                name: "formsGoogleAnalyticsEventTrigger",
                moduleSpecifier:
                    "@webiny/app-form-builder/render/plugins/triggers/googleAnalyticsEvent"
            },

            // Date/time field.
            {
                name: "fieldValidatorDateTimeLte",
                moduleSpecifier: "@webiny/app-form-builder/render/plugins/validators/dateTimeLte"
            },
            {
                name: "fieldValidatorDateTimeGte",
                moduleSpecifier: "@webiny/app-form-builder/render/plugins/validators/dateTimeGte"
            }
        ];

        imports.forEach(currentImport => {
            insertImportToSourceFile({
                source,
                after: "@webiny/app-form-builder/render/plugins/triggers/redirect",
                ...currentImport
            });

            addToExportDefaultArray({
                source,
                target: currentImport.name
            });
        });
    }

    {
        // Update theme / form layout.
        // apps/theme/layouts/forms/DefaultFormLayout/fields/DateTime.tsx
        const defaultFormLayoutFieldsFolder = path.join(
            context.project.root,
            "apps",
            "theme",
            "layouts",
            "forms",
            "DefaultFormLayout",
            "fields"
        );

        if (fs.existsSync(defaultFormLayoutFieldsFolder)) {
            // Create packages/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/DateTime.tsx.
            fs.copyFileSync(
                path.join(__dirname, "updateFbPlugins", "DateTime.tsx"),
                path.join(defaultFormLayoutFieldsFolder, "DateTime.tsx")
            );

            // Update theme package's package.json.
            const themePackageJsonPath = path.join(
                context.project.root,
                "apps",
                "theme",
                "package.json"
            );

            addPackagesToDependencies(context, themePackageJsonPath, {
                "@webiny/utils": context.version
            });

            // Update packages/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/Field.tsx.
            const defaultFormLayoutFieldFile = files.byName(
                "apps/theme/layouts/forms/DefaultFormLayout/Field"
            );
            const defaultFormLayoutFieldFileSource = project.getSourceFile(
                defaultFormLayoutFieldFile.path
            );

            insertImportToSourceFile({
                source: defaultFormLayoutFieldFileSource,
                after: "./fields/Hidden",
                name: ["DateTimeField"],
                moduleSpecifier: "./fields/DateTime"
            });

            defaultFormLayoutFieldFileSource
                .getDescendantsOfKind(SyntaxKind.CaseBlock)
                .forEach(node => {
                    // If we found the CaseBlock, let's insert the date/time field as the first item.
                    // `case "datetime": return <DateTimeField {...props} />;`

                    if (node.getKindName() !== "CaseBlock") {
                        return;
                    }

                    // Let's replace the first child.

                    const children = node.getChildrenOfKind(SyntaxKind.CaseClause);
                    for (const child of children) {
                        const text = child.getText();
                        if (text.includes("datetime")) {
                            return;
                        }
                    }

                    const firstChild = node.getFirstChildByKind(SyntaxKind.CaseClause);
                    if (!firstChild) {
                        return;
                    }

                    if (firstChild.getText().includes("text") === false) {
                        return;
                    }
                    firstChild.replaceWithText(
                        [
                            `case "text": return <InputField {...props} />;`,
                            `case "datetime": return <DateTimeField {...props} />;`
                        ].join("\n")
                    );
                });

            // Update packages/cwp-template-aws/template/common/apps/theme/layouts/forms/DefaultFormLayout/fields/Select.tsx
            const defaultFormLayoutSelectFile = files.byName(
                "apps/theme/layouts/forms/DefaultFormLayout/fields/Select"
            );
            const defaultFormLayoutFieldSelectSource = project.getSourceFile(
                defaultFormLayoutSelectFile.path
            );

            // Find `const StyledSelect` and then export it. Don't throw if not found.
            const styledSelect =
                defaultFormLayoutFieldSelectSource.getVariableDeclaration("StyledSelect");

            if (styledSelect) {
                const name = styledSelect.getName();
                const exists = defaultFormLayoutFieldSelectSource.getExportDeclaration(decl => {
                    return decl.getText().includes(name);
                });
                if (!exists) {
                    // Export the StyledSelect const.
                    defaultFormLayoutFieldSelectSource.addExportDeclaration({
                        namedExports: [name]
                    });
                }
            }
        }
    }
};
