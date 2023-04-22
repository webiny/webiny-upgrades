import { Project } from "ts-morph";
import { getSourceFile } from "../../utils";
import { StyleIdToTypographyTypeMap, ThemeFileMigrationDefinition } from "./migrationTypes";
import { Context } from "../../types";
import { migrateStatements } from "./migrateStatements";
import { migrateImports } from "./migrateImports";

export const migrateFile = (
    migrateDefinition: ThemeFileMigrationDefinition,
    map: StyleIdToTypographyTypeMap,
    project: Project,
    context: Context
): void => {
    context.log.debug(`Start migrating file: ${migrateDefinition.file.path}`);
    const source = getSourceFile(project, migrateDefinition.file.path);

    if (migrateDefinition?.migrationInstructions?.imports) {
        migrateImports(source, migrateDefinition, context);
    }

    migrateStatements(source, migrateDefinition, map, context);
};
