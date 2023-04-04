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
}


export const typographyKeyToHtmlTagMapping = {
    "heading1": "h1",
    "heading2": "h2",
    "heading3": "h3",
    "heading4": "h4",
    "heading5": "h5",
    "heading6": "h6",
    "paragraph1": "p",
    "paragraph2": "p",
    "list": "ul",
    "quote": "quoteblock"
}





