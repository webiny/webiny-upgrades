import { SourceFile } from "ts-morph";
import { getCreateHandlerExpressions } from "./getCreateHandlerExpressions";

interface Options {
    debug?: boolean;
}

export const upgradeCreateHandlerToPlugins = (
    source: SourceFile,
    handler: string = "handler",
    options: Options = {}
): void => {
    const { createHandlerExpression, plugins } = getCreateHandlerExpressions(source, handler);

    if (plugins) {
        return;
    }

    const args = createHandlerExpression.getArguments().map(a => a.getText());
    if (args.length === 0) {
        console.log(`Missing arguments in handler expression "${handler}".`);
        return;
    }
    /**
     * We need  to remove existing arguments.
     */
    args.forEach(() => createHandlerExpression.removeArgument(0));
    /**
     * And then add the new ones.
     */
    createHandlerExpression.addArgument(
        `{plugins: [${args.join(",")}]${
            options.debug !== false ? `, http: {debug: process.env.DEBUG === "true"}` : ""
        }}`
    );
};
