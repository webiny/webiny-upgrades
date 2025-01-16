import { createProcessor } from "../utils";

export const removeTsExpectError = createProcessor(async params => {
    const { files, project, context } = params;

    context.log.info("Removing all @ts-expect-error comments...");

    const pbRichTextEditor = files.byName("admin/pb/richTextEditor");
    const cmsRichTextEditor = files.byName("admin/cms/richTextEditor");
    const fbRichTextEditor = files.byName("admin/fb/richTextEditor");

    const usableFiles = [pbRichTextEditor, cmsRichTextEditor, fbRichTextEditor];

    for (const file of usableFiles) {
        try {
            const source = project.getSourceFile(file.path);

            let text = source.getText();

            text = text.replace(
                `/**
 * Package @editorjs/* is missing types.
 */`,
                ""
            );

            text = text.replaceAll("// @ts-expect-error", "");

            source.replaceWithText(text);
        } catch {
            // It is ok to ignore this error.
            // This means that the user does not have this file in their project.
        }
    }
});
