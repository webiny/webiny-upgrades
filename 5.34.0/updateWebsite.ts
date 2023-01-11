import { Project } from "ts-morph";
import fs from "fs-extra";
import path from "path";
import { FileDefinition, Files, insertImportToSourceFile } from "../utils";
import { Context } from "../types";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

const replace = (context: Context, file: FileDefinition, source: string) => {
    const fileInfo = path.parse(file.path);
    const backupPath = path.join(fileInfo.dir, `${fileInfo.name}.backup${fileInfo.ext}`);
    fs.copyFileSync(file.path, backupPath);
    fs.copyFileSync(source, file.path);
    context.log.info(`Replaced %s (backup created at %s).`, file.path, backupPath);
};

export const updateWebsite = async (params: Params) => {
    const { project, files, context } = params;

    replace(
        context,
        files.byName("formBuilder/styles/theme.scss"),
        path.join(__dirname, "replacements", "formBuilder_styles_theme.scss")
    );

    replace(
        context,
        files.byName("pageBuilder/styles/elements/layout.scss"),
        path.join(__dirname, "replacements", "pageBuilder_styles_elements_layout.scss")
    );

    replace(
        context,
        files.byName("pageBuilder/styles/base.scss"),
        path.join(__dirname, "replacements", "pageBuilder_styles_base.scss")
    );

    replace(
        context,
        files.byName("website/components/Page/graphql.ts"),
        path.join(__dirname, "replacements", "website_components_page_graphql.ts")
    );

    // Add <WebsiteScripts/> component
    const websiteRender = files.byName("website/render");
    const source = project.getSourceFile(websiteRender.path);

    insertImportToSourceFile({
        source,
        name: "WebsiteScripts",
        moduleSpecifier: "@webiny/app-page-builder/render/components/WebsiteScripts",
        after: "@webiny/app-page-builder/render/components/Element"
    });

    const sourceCode = source.getFullText();
    if (!sourceCode.includes("<WebsiteScripts")) {
        source.replaceWithText(
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
