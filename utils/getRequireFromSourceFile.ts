import { Node, SourceFile, VariableStatement } from "ts-morph";

export const getRequireFromSourceFile = (
    source: SourceFile,
    target: string,
    cb: (stm: VariableStatement) => void
) => {
    const requireStatement = source.getVariableStatement(node => {
        return !!node.getFirstDescendant(node => {
            const isCallExp = Node.isCallExpression(node);
            if (isCallExp) {
                return (
                    node.getExpression().getText() === "require" &&
                    node.getArguments()[0].getText() === `"${target}"`
                );
            }

            return false;
        });
    });

    if (!requireStatement) {
        return;
    }

    cb(requireStatement);
};
