import {Project, SourceFile} from "ts-morph";
import {ThemeFileMigrationDefinition} from "./migrationFileDefinitions";
import {getSourceFile} from "../../utils";
import {Context} from "../../types";

const migrateExpressions = (source: SourceFile):void => {

}

const migrateImports = (source: SourceFile): void => {

}

const migrateInterfaces = (source: SourceFile): void => {

}

const migrateTypes = (source: SourceFile): void => {

}

export type ThemeFileMigrationResult = {
    isSuccessfullyMigrated: boolean;
    skipped: boolean;
    info?: string;
}
const migrateFile = (migrateDefinition: ThemeFileMigrationDefinition, project: Project): ThemeFileMigrationResult => {
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
