import {Project, SourceFile} from "ts-morph";
import {TypographyMigrateDefinition} from "./migrationFileDefinitions";
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

const migrateFile = (migrateDefinition: TypographyMigrateDefinition, project: Project): void => {
    const source = getSourceFile(project, migrateDefinition.file.path);
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
}
