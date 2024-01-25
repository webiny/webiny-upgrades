import { SourceFile, VariableDeclaration } from "ts-morph";

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
    validate?: (declaration: VariableDeclaration) => boolean;
}

export const replaceVariable = (params: ReplaceVariableParams): void => {
    const { source, target, newValue, validate } = params;

    const declaration = source.getVariableDeclaration(target);
    if (!declaration) {
        return;
    }
    if (validate && validate(declaration) !== true) {
        return;
    }

    declaration.replaceWithText(newValue);
};
