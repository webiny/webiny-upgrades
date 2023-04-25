import { SyntaxKind } from "ts-morph";
import { FileDefinition } from "../../utils";

export type TypographyStyle = {
    id: string;
    name: string; // display name for the user
    tag: string;
    css: Record<string, any>;
};

export type Typography = {
    headings: TypographyStyle[];
    paragraphs: TypographyStyle[];
    lists: TypographyStyle[];
    quotes: TypographyStyle[];
};
export type TypographyType = "headings" | "paragraphs" | "lists" | "quotes";

export const typographyKeyToHtmlTagMapping = {
    heading1: "h1",
    heading2: "h2",
    heading3: "h3",
    heading4: "h4",
    heading5: "h5",
    heading6: "h6",
    paragraph1: "p",
    paragraph2: "p",
    list: "ul",
    quote: "quoteblock"
};

export const htmlTagToTypographyTypeMapping = {
    h1: "headings",
    h2: "headings",
    h3: "headings",
    h4: "headings",
    h5: "headings",
    h6: "headings",
    p: "paragraphs",
    ul: "lists",
    quoteblock: "quotes"
};

/*
 * Map style id to typography type.
 * This will help for fast access to the typography types with custom styles keys defined by the user.
 * Example for custom mapping: { XyZParagraph1: "headings" },
 * */
export type StyleIdToTypographyTypeMap = {
    [key in string]: TypographyType;
};

export type TypeReferenceInstruction = {
    syntaxKind: SyntaxKind.TypeReference;
    typeName: string;
    updateToTypeName?: string;
};

export type UnionTypeInstruction = {
    syntaxKind: SyntaxKind.UnionType;
    unionTypes: (TypeReferenceInstruction | FunctionTypeInstruction)[];
};

export type FunctionTypeInstruction = {
    syntaxKind: SyntaxKind.FunctionType;
    params: {
        name: string;
        typeInstruction: TypeReferenceInstruction | UnionTypeInstruction | TypeLiteralInstruction;
    }[];
};

export type PropertySignatureInstruction = {
    syntaxKind: SyntaxKind.PropertySignature;
    name: string;
    typeInstruction: TypeReferenceInstruction | UnionTypeInstruction | FunctionTypeInstruction;
};

export type InterfaceMigrationDefinition = {
    name: string;
    members: PropertySignatureInstruction[];
};

export type TypeLiteralInstruction = {
    syntaxKind: SyntaxKind.TypeLiteral;
    members: PropertySignatureInstruction[];
};

export type TypeAliasMigrationDefinition = {
    name: string;
    typeInstruction: FunctionTypeInstruction | TypeReferenceInstruction;
};

export type StatementMigrationDefinition = {
    variables: {
        name: string | undefined;
        syntaxKind:
            | SyntaxKind.ElementAccessExpression
            | SyntaxKind.TemplateSpan
            | SyntaxKind.PropertyAssignment;
        nodeUpdates?: // first level properties update
        {
            symbolEscapedName?: string;
            syntaxKind: SyntaxKind.PropertyAssignment | SyntaxKind.SpreadAssignment;
            // node attached to the current child that contains the props
            initializerKind?: SyntaxKind.PropertyAccessExpression;
            matchText?: string;
            expression?: SyntaxKind.PropertyAccessExpression;
        }[];
    }[];
};

export type MigrationInstructions = {
    types?: TypeAliasMigrationDefinition[];
    interfaces?: InterfaceMigrationDefinition[];
    statements?: StatementMigrationDefinition;
};

export type ThemeFileMigrationDefinition = {
    file: FileDefinition;
    /*
     * Detailed instructions about code changes
     * */
    migrationInstructions?: MigrationInstructions;
};
