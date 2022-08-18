import { Context } from "../../types";
import { FileDefinition, Tag } from "./FileDefinition";

export class Files {
    public readonly context: Context;
    private readonly files: FileDefinition[];

    public constructor(context: Context, files: FileDefinition[]) {
        this.context = context;
        this.files = files.filter(file => {
            return !!file.path;
        });
    }

    public byName(name: string): FileDefinition | null {
        for (const file of this.files) {
            if (file.name === name) {
                return file;
            }
        }
        this.context.log.error(`There is no file with name "${name}".`);
        return null;
    }

    public byTag(tag: Tag): Files {
        return new Files(
            this.context,
            this.files.filter(file => {
                return file.tag === tag;
            })
        );
    }

    public filter(cb: (file: FileDefinition) => boolean): Files {
        return new Files(this.context, this.files.filter(cb));
    }

    public all(): string[] {
        return this.files.map(file => {
            return file.path;
        });
    }
}
