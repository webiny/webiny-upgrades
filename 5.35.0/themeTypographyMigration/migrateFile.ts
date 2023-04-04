import {Project, SourceFile} from "ts-morph";
import {ThemeFileMigrationDefinition} from "./migrationFileDefinitions";
import {getSourceFile} from "../../utils";

const migrateExpressions = (source: SourceFile):void => {

}

const migrateImports = (source: SourceFile): void => {

}

const migrateInterfaces = (source: SourceFile): void => {

}

const migrateTypes = (source: SourceFile): void => {

}


// * check th theme -
// 1. if typography exist
// 2. Check if you can access to legacy styles

// * Map the theme to new structure
// 1. For the same key copy the existing style of the user
//  - if the key does not contain the default names try to find the heading, paragraph in the name
// by default create paragraph styles
//

export type ThemeFileMigrationResult = {
    isSuccessfullyMigrated: boolean;
    skipped: boolean;
    info?: string;
}
export const migrateFile = (migrateDefinition: ThemeFileMigrationDefinition, project: Project): ThemeFileMigrationResult => {
    const source = getSourceFile(project, migrateDefinition.file.path);
    if(!source){
        return {
            isSuccessfullyMigrated: false,
            skipped: true,
            info: `File does not exist. Path: ${migrateDefinition.file}`
        }
    }

    if (migrateDefinition.migrationInstructions?.imports) {
        migrateImports(source);
    }

    if (migrateDefinition.migrationInstructions?.interfaces) {
        migrateInterfaces(source);
    }

    if (migrateDefinition.migrationInstructions?.types) {
        migrateTypes(source);
    }

    if (migrateDefinition.migrationInstructions?.expressions) {
        migrateExpressions(source);
    }

    return {
        skipped: false,
        isSuccessfullyMigrated: true
    }
}
