import { ObjectLiteralExpression, StructureKind } from "ts-morph";

export const addPropertyToObject = (
    object: ObjectLiteralExpression,
    propName: string,
    propValue: any
) => {
    if (!object) {
        return;
    }

    if (typeof propValue === "object") {
        propValue = JSON.stringify(propValue);
    }

    if (typeof propValue === "boolean") {
        propValue = String(propValue);
    }

    object.addProperty({
        name: propName,
        initializer: propValue,
        kind: StructureKind.PropertyAssignment
    });
};
