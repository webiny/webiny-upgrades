import { SourceFile } from "ts-morph";
import { getCreateHandlerExpressions } from "./getCreateHandlerExpressions";

export const removePluginFromCreateHandler = (
    source: SourceFile,
    handler: string,
    targetPlugin: string | RegExp
) => {
    const { plugins, arrayExpression } = getCreateHandlerExpressions(source, handler);

    if (!plugins) {
        console.log(`Missing plugins in "createHandler" expression "${handler}".`);
        return;
    }
    if (!arrayExpression) {
        console.log(`Missing array literal expression in handler "${handler}".`);
        return;
    }

    const elements = arrayExpression.getElements();
    const removeIndexes = elements
        .map((element, index) => {
            if (element.getText().match(targetPlugin) === null) {
                return null;
            }
            return index;
        })
        .reverse()
        .filter(index => {
            return index !== null;
        });
    for (const index of removeIndexes) {
        arrayExpression.removeElement(index);
    }
};
