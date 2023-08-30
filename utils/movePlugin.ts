import { Expression, SourceFile } from "ts-morph";
import { getCreateHandlerExpressions } from "./getCreateHandlerExpressions";
import log from "./log";

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

const findElementIndex = (elements, target) => {
    const re = target instanceof RegExp ? target : new RegExp(target);
    for (const index in elements) {
        const element = elements[index];
        /**
         * We want to skip if the element was forgotten or moved.
         */
        if (element.wasForgotten()) {
            continue;
        } else if (element.getText().match(re) === null) {
            continue;
        }
        return Number(index);
    }
    return null;
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

    let index = elements.length;
    if (after) {
        index = findElementIndex(elements, after);
        if (index === null) {
            return;
        } else if (pluginIndex > index) {
            return;
        }
    } else if (before) {
        index = findElementIndex(elements, before);
        if (index === null) {
            return;
        }
        /**
         * Must reduce the target position by 1.
         */
        index--;
        if (pluginIndex < index) {
            return;
        }
    }
    /**
     * Now we can remove the plugin from its original position.
     */
    log.debug(`Moving plugin "${value}" to index ${index}.`);
    arrayExpression.removeElement(pluginIndex);
    /**
     * And insert into the new position.
     */
    arrayExpression.insertElement(index, pluginText);
};
