import { ObjectLiteralExpression, StructureKind } from "ts-morph";

export const addPropertyToObject = (
    object: ObjectLiteralExpression,
    propName: string,
    value: Record<string, any> | string | boolean
) => {
    if (!object) {
        return;
    }

    let propValue = value;
    if (typeof propValue === "object") {
        propValue = JSON.stringify(value);
    }

    if (typeof propValue === "boolean") {
        propValue = String(value);
    }

    object.addProperty({
        name: propName,
        initializer: propValue,
        kind: StructureKind.PropertyAssignment
    });
};
