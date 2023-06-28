import { SourceFile, Expression } from "ts-morph";
import { getCreateHandlerExpressions } from "./getCreateHandlerExpressions";

interface Params {
    source: SourceFile;
    handler?: string;
    value: string;
    after?: string | null | RegExp;
    before?: string | null | RegExp;
}

const findPlugin = (elements: Expression[], value: string | RegExp) => {
    const match = value instanceof RegExp ? value : new RegExp(value);
    return elements.findIndex(element => element.getText().match(match));
};

export const movePlugin = (params: Params): void => {
    const { source, handler = "handler", value, after, before } = params;
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

    const pluginIndex = findPlugin(elements, value);
    if (pluginIndex === -1) {
        return;
    }

    const pluginElement = elements[pluginIndex];
    const pluginText = pluginElement.getText();
    arrayExpression.removeElement(pluginIndex);

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
    } else if (before) {
        const re = before instanceof RegExp ? after : new RegExp(before);
        for (const i in elements) {
            const element = elements[i];
            if (element.getText().match(re) === null) {
                continue;
            }
            index = Number(i);
            break;
        }
    }
    arrayExpression.insertElement(index, pluginText);
};
