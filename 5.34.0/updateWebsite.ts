import { Project } from "ts-morph";
import path from "path";
import { insertImportToSourceFile } from "../utils";
import { Context, IFiles } from "../types";
import { backupAndReplace } from "./backupAndReplace";

interface Params {
    files: IFiles;
    project: Project;
    context: Context;
}

export const updateWebsite = async (params: Params) => {
    const { project, files, context } = params;

    backupAndReplace(
        context,
        files.byName("formBuilder/styles/theme.scss"),
        path.join(__dirname, "replacements", "website", "formBuilder_styles_theme.scss")
    );

    backupAndReplace(
        context,
        files.byName("pageBuilder/styles/elements/layout.scss"),
        path.join(__dirname, "replacements", "website", "pageBuilder_styles_elements_layout.scss")
    );

    backupAndReplace(
        context,
        files.byName("pageBuilder/styles/elements/image.scss"),
        path.join(__dirname, "replacements", "website", "pageBuilder_styles_elements_image.scss")
    );

    backupAndReplace(
        context,
        files.byName("pageBuilder/styles/base.scss"),
        path.join(__dirname, "replacements", "website", "pageBuilder_styles_base.scss")
    );

    backupAndReplace(
        context,
        files.byName("website/components/Page/graphql.ts"),
        path.join(__dirname, "replacements", "website", "website_components_page_graphql.ts")
    );

    // Add <WebsiteScripts/> component
    const websiteRender = files.byName("website/render");
    const websiteRenderSource = project.getSourceFile(websiteRender.path);

    insertImportToSourceFile({
        source: websiteRenderSource,
        name: "WebsiteScripts",
        moduleSpecifier: "@webiny/app-page-builder/render/components/WebsiteScripts",
        after: "@webiny/app-page-builder/render/components/Element"
    });

    const sourceCode = websiteRenderSource.getFullText();
    if (!sourceCode.includes("<WebsiteScripts")) {
        websiteRenderSource.replaceWithText(
            sourceCode.replace(
                "</Helmet>",
                `</Helmet>
        <WebsiteScripts
            headerTags={settings?.htmlTags?.header}
            footerTags={settings?.htmlTags?.footer}
        />`
            )
        );
    } else {
        context.log.info(
            "%s components has already been added to the %s app (%s).",
            "<WebsiteScripts/>",
            "website",
            "skipping upgrade"
        );
    }
};
