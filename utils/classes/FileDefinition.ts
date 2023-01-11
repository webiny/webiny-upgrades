export type Tag = "fm" | "pb" | "cms" | "gql" | "ps" | "ddb2es" | "theme" | "website";

export interface FileDefinitionParams {
    path: string;
    elasticsearch?: boolean;
    pre529?: boolean;
    tag: Tag;
    name: string;
}

export class FileDefinition {
    public readonly path: string;
    public readonly elasticsearch: boolean;
    public readonly pre529: boolean;
    public readonly tag: Tag;
    public readonly name: string;

    public constructor(params: FileDefinitionParams) {
        this.path = params.path;
        this.elasticsearch = params.elasticsearch === true;
        this.pre529 = params.pre529 === true;
        this.tag = params.tag;
        this.name = params.name;
    }
}
