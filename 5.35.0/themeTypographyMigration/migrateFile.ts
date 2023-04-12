import { Project } from "ts-morph";
import { getSourceFile } from "../../utils";
import { StyleIdToTypographyTypeMap, ThemeFileMigrationDefinition } from "./migrationTypes";
import { Context } from "../../types";
import { migrateTypesAliases } from "./migrateTypesAliases";
import { migrateImports } from "./migrateImports";
import { migrateStatements } from "./migrateStatements";
import { migrateInterfaces } from "./migrateInterfaces";

export type ThemeFileMigrationResult = {
    isSuccessfullyMigrated: boolean;
    skipped: boolean;
    info?: string;
};

export const migrateFile = (
    migrateDefinition: ThemeFileMigrationDefinition,
    typographyMap: StyleIdToTypographyTypeMap,
    project: Project,
    context: Context
): ThemeFileMigrationResult => {
    const source = getSourceFile(project, migrateDefinition.file.path);

    if (!source) {
        return {
            isSuccessfullyMigrated: false,
            skipped: true,
            info: `File does not exist. Path: ${migrateDefinition.file.path}`
        };
    }

    if (migrateDefinition.migrationInstructions?.imports) {
        migrateImports(source, migrateDefinition, typographyMap, context);
    }

    if (migrateDefinition.migrationInstructions?.interfaces) {
        migrateInterfaces(source, migrateDefinition, context);
    }

    if (migrateDefinition.migrationInstructions?.types) {
        migrateTypesAliases(source, migrateDefinition.migrationInstructions?.types, context);
    }

    if (migrateDefinition.migrationInstructions?.statements) {
        migrateStatements(source, migrateDefinition, typographyMap, context);
    }

    return {
        skipped: false,
        isSuccessfullyMigrated: true
    };
};
