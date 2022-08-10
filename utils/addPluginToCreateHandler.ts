import { SourceFile } from "ts-morph";
import { getCreateHandlerExpressions } from "./getCreateHandlerExpressions";

interface Params {
    source: SourceFile;
    handler: string;
    value: string;
    after?: string | null | RegExp;
}

export const addPluginToCreateHandler = (params: Params): void => {
    const { source, handler, value, after } = params;
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
    let index = elements.length;
    if (after) {
        const re = after instanceof RegExp ? after : new RegExp(after);
        for (const i in elements) {
            const element = elements[i];
            if (element.getText().match(re) === null) {
                continue;
            }
            index = Number(i) + 1;
            break;
        }
    }
    arrayExpression.insertElement(index, value);
};
