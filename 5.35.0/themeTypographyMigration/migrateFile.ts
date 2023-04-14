import { Project } from "ts-morph";
import { getSourceFile } from "../../utils";
import { StyleIdToTypographyTypeMap, ThemeFileMigrationDefinition } from "./migrationTypes";
import { Context } from "../../types";
import { migrateStatements } from "./migrateStatements";
import { migrateImports } from "./migrateImports";

export type ThemeFileMigrationResult = {
    isSuccessfullyMigrated: boolean;
    skipped: boolean;
    info?: string;
};

export const migrateFile = (
    migrateDefinition: ThemeFileMigrationDefinition,
    map: StyleIdToTypographyTypeMap,
    project: Project,
    context: Context
): ThemeFileMigrationResult => {
    context.log.debug(`Start migrating file: ${migrateDefinition.file.path}`);
    const source = getSourceFile(project, migrateDefinition.file.path);

    if (!source) {
        return {
            isSuccessfullyMigrated: false,
            skipped: true,
            info: `File does not exist. Path: ${migrateDefinition.file.path}`
        };
    }

    if (migrateDefinition?.migrationInstructions?.imports) {
        migrateImports(source, migrateDefinition, context);
    }

    migrateStatements(source, migrateDefinition, map, context);

    return {
        skipped: false,
        isSuccessfullyMigrated: true
    };
};
