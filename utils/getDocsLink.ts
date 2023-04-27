export const DOCS_WEBSITE = process.env.DOCS_WEBSITE || "https://webiny.com/docs";
export const WEBINY_LINK = process.env.DOCS_WEBINY_LINK || "https://webiny.link";

export const getDocsLink = (...args) => {
    return DOCS_WEBSITE + args.join("/");
};

export const getWebinyLink = (...args) => {
    return WEBINY_LINK + args.join("/");
};
