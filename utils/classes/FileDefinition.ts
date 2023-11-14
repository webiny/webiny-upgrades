import { FileDefinitionTag, IFileDefinition } from "../../types";

export interface FileDefinitionParams {
    path: string;
    elasticsearch?: boolean;
    pre529?: boolean;
    tag: FileDefinitionTag;
    name: string;
}

export class FileDefinition implements IFileDefinition {
    public readonly path: string;
    public readonly elasticsearch: boolean;
    public readonly pre529: boolean;
    public readonly tag: FileDefinitionTag;
    public readonly name: string;

    public constructor(params: FileDefinitionParams) {
        this.path = params.path;
        this.elasticsearch = params.elasticsearch === true;
        this.pre529 = params.pre529 === true;
        this.tag = params.tag;
        this.name = params.name;
    }
}
