import { SourceFile } from "ts-morph";

export interface ExtendInterfaceParams {
    source: SourceFile;
    target: string;
    add: string | string[];
}

export const extendInterface = (params: ExtendInterfaceParams) => {
    const { source, target, add } = params;

    const items = Array.isArray(add) ? add : [add];
    const int = source.getInterface(target);
    if (!int) {
        return;
    }
    const alreadyExtends = int.getExtends().some(item => {
        return items.includes(item.getText());
    });
    if (alreadyExtends) {
        return;
    }
    int.addExtends(items);
};
