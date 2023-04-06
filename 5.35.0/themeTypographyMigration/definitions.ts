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
