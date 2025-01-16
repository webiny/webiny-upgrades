import { Project } from "ts-morph";
import { addToExportDefaultArray, insertImportToSourceFile } from "../utils";
import { Context, IFiles } from "../types";

interface Params {
    files: IFiles;
    project: Project;
    context: Context;
}

export const updatePbPlugins = async (params: Params) => {
    const { project, files, context } = params;

    const adminEditorPluginsFile = files.byName("admin/plugins/pageBuilder/editorPlugins");
    const adminRenderPluginsFile = files.byName("admin/plugins/pageBuilder/renderPlugins");
    const websiteRenderPluginsFile = files.byName("website/plugins/pageBuilder");

    {
        // 1. Admin / editor plugins.
        const source = project.getSourceFile(adminEditorPluginsFile.path);

        context.log.info(`Adding new Page Builder plugins (%s)`, adminEditorPluginsFile.path);

        const imports = [
            // Carousel plugins.
            {
                factory: true,
                name: "carousel",
                moduleSpecifier: "@webiny/app-page-builder/editor/plugins/elements/carousel"
            },
            {
                factory: true,
                name: "carouselElement",
                moduleSpecifier: "@webiny/app-page-builder/editor/plugins/elements/carouselElement"
            },
            {
                name: "carouselSettings",
                moduleSpecifier: "@webiny/app-page-builder/editor/plugins/elementSettings/carousel"
            },
            {
                name: "carouselElementSettings",
                moduleSpecifier:
                    "@webiny/app-page-builder/editor/plugins/elementSettings/carouselElement"
            },
            {
                name: "carouselStylesSettings",
                moduleSpecifier:
                    "@webiny/app-page-builder/editor/plugins/elementSettings/carouselStyles"
            },

            // Tabs plugins.
            {
                factory: true,
                name: "tabs",
                moduleSpecifier: "@webiny/app-page-builder/editor/plugins/elements/tabs"
            },
            {
                factory: true,
                name: "tab",
                moduleSpecifier: "@webiny/app-page-builder/editor/plugins/elements/tab"
            },
            {
                name: "tabsSettings",
                moduleSpecifier: "@webiny/app-page-builder/editor/plugins/elementSettings/tabs"
            },
            {
                name: "tabSettings",
                moduleSpecifier: "@webiny/app-page-builder/editor/plugins/elementSettings/tab"
            },

            // Accordion plugins.
            {
                factory: true,
                name: "accordion",
                moduleSpecifier: "@webiny/app-page-builder/editor/plugins/elements/accordion"
            },
            {
                factory: true,
                name: "accordionItem",
                moduleSpecifier: "@webiny/app-page-builder/editor/plugins/elements/accordionItem"
            },
            {
                name: "accordionSettings",
                moduleSpecifier: "@webiny/app-page-builder/editor/plugins/elementSettings/accordion"
            },
            {
                name: "accordionItemSettings",
                moduleSpecifier:
                    "@webiny/app-page-builder/editor/plugins/elementSettings/accordionItem"
            },

            // Cell mirroring options (only admin).
            {
                name: "mirrorCell",
                moduleSpecifier:
                    "@webiny/app-page-builder/editor/plugins/elementSettings/mirror-cell"
            }
        ];

        imports.forEach(currentImport => {
            insertImportToSourceFile({
                source,
                after: "@webiny/app-page-builder/editor/plugins/elements/heading",
                ...currentImport
            });

            addToExportDefaultArray({
                source,
                target: currentImport.factory ? currentImport.name + "()" : currentImport.name
            });
        });
    }

    {
        // 2. Admin / render plugins.
        const source = project.getSourceFile(adminRenderPluginsFile.path);

        context.log.info(`Adding new Page Builder plugins (%s)`, adminRenderPluginsFile.path);

        const imports = [
            // Carousel plugins.
            {
                name: "carousel",
                moduleSpecifier: "@webiny/app-page-builder/render/plugins/elements/carousel"
            },
            {
                name: "carouselElement",
                moduleSpecifier: "@webiny/app-page-builder/render/plugins/elements/carouselElement"
            },

            // Tabs plugins.
            {
                name: "tabs",
                moduleSpecifier: "@webiny/app-page-builder/render/plugins/elements/tabs"
            },
            {
                name: "tab",
                moduleSpecifier: "@webiny/app-page-builder/render/plugins/elements/tab"
            },

            // Accordion plugins.
            {
                name: "accordion",
                moduleSpecifier: "@webiny/app-page-builder/render/plugins/elements/accordion"
            },
            {
                name: "accordionItem",
                moduleSpecifier: "@webiny/app-page-builder/render/plugins/elements/accordionItem"
            }
        ];

        imports.forEach(currentImport => {
            insertImportToSourceFile({
                source,
                after: "@webiny/app-page-builder/render/plugins/elements/heading",
                ...currentImport
            });

            addToExportDefaultArray({
                source,
                target: currentImport.name + "()"
            });
        });
    }

    {
        // 3. Website / render plugins.
        const source = project.getSourceFile(websiteRenderPluginsFile.path);

        context.log.info(`Adding new Page Builder plugins (%s)`, websiteRenderPluginsFile.path);

        const imports = [
            // Carousel plugins.
            {
                name: "carousel",
                moduleSpecifier: "@webiny/app-page-builder/render/plugins/elements/carousel"
            },
            {
                name: "carouselElement",
                moduleSpecifier: "@webiny/app-page-builder/render/plugins/elements/carouselElement"
            },

            // Tabs plugins.
            {
                name: "tabs",
                moduleSpecifier: "@webiny/app-page-builder/render/plugins/elements/tabs"
            },
            {
                name: "tab",
                moduleSpecifier: "@webiny/app-page-builder/render/plugins/elements/tab"
            },

            // Accordion plugins.
            {
                name: "accordion",
                moduleSpecifier: "@webiny/app-page-builder/render/plugins/elements/accordion"
            },
            {
                name: "accordionItem",
                moduleSpecifier: "@webiny/app-page-builder/render/plugins/elements/accordionItem"
            }
        ];

        imports.forEach(currentImport => {
            insertImportToSourceFile({
                source,
                after: "@webiny/app-page-builder/render/plugins/elements/heading",
                ...currentImport
            });

            addToExportDefaultArray({
                source,
                target: currentImport.name + "()"
            });
        });
    }
};
