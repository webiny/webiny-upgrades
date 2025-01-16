import { Context, FileDefinitionTag, IFileDefinition, IFiles, IFilesFilterCb } from "../../types";
import { getIsPre529Project } from "../isPre529Project";
import { getIsElasticsearchProject } from "../isElasticsearchProject";
import { getGraphQLPath } from "../paths";

export class Files implements IFiles {
    public readonly context: Context;
    private readonly files: IFileDefinition[];

    public constructor(context: Context, files: IFileDefinition[]) {
        this.context = context;
        this.files = files.filter(file => {
            return !!file.path;
        });
    }

    public byName(name: string): IFileDefinition | null {
        for (const file of this.files) {
            if (file.name === name) {
                return file;
            }
        }
        this.context.log.error(`There is no file with name "${name}".`);
        return null;
    }

    public byTag(tag: FileDefinitionTag): IFiles {
        return createFiles(
            this.context,
            this.files.filter(file => {
                return file.tag === tag;
            })
        );
    }

    public filter(cb: IFilesFilterCb): IFiles {
        return createFiles(this.context, this.files.filter(cb));
    }

    /**
     * Get files that are relevant to the current project.
     *
     * Conditions:
     * - is project pre-5.29?
     * - is project DDB-only or DDB+ES?
     */
    public relevant(): IFiles {
        const isPre529Project = getIsPre529Project(this.context);
        const isElasticsearchProject = getIsElasticsearchProject(
            this.context,
            getGraphQLPath(this.context)
        );

        return this.filter(file => {
            if (file.pre529 === true && !isPre529Project) {
                return false;
            } else if (file.elasticsearch === true && !isElasticsearchProject) {
                return false;
            }
            return true;
        });
    }

    /**
     * Get raw file paths.
     */
    public paths(): string[] {
        return this.files.map(file => file.path);
    }
    /**
     * Backwards compatibility method.
     * @deprecated
     */
    public all(): string[] {
        return this.paths();
    }
}

export const createFiles = (context: Context, files: IFileDefinition[]) => {
    return new Files(context, files);
};
