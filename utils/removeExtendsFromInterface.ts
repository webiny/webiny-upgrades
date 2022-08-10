import { SourceFile } from "ts-morph";

export const removeExtendsFromInterface = (
    source: SourceFile,
    interfaceName: string,
    target: string
): void => {
    if (!source) {
        return;
    }
    const interfaceNode = source.getInterface(interfaceName);
    if (!interfaceNode) {
        return;
    }
    const extendsInterfaces = interfaceNode.getExtends();

    const index = extendsInterfaces.findIndex(e => {
        return e.getText() === target;
    });
    if (index < 0) {
        return;
    }
    interfaceNode.removeExtends(index);
};
