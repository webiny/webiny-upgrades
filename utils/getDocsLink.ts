export const DOCS_WEBSITE = process.env.DOCS_WEBSITE || "https://webiny.com/docs";

export const getDocsLink = (...args) => {
    return DOCS_WEBSITE + args.join("/");
};
