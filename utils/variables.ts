import { SourceFile } from "ts-morph";

export interface RemoveVariableParams {
    source: SourceFile;
    target: string;
}

export const removeVariable = (params: RemoveVariableParams): void => {
    const { source, target } = params;

    const declaration = source.getVariableDeclaration(target);
    declaration.remove();
};

export interface ReplaceVariableParams {
    source: SourceFile;
    target: string;
    newValue: string;
}

export const replaceVariable = (params: ReplaceVariableParams): void => {
    const { source, target, newValue } = params;

    const declaration = source.getVariableDeclaration(target);

    declaration.replaceWithText(newValue);
};
