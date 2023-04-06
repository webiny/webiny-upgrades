import {Project, SourceFile, SyntaxKind} from "ts-morph";
import {ThemeFileMigrationDefinition} from "./migrationFileDefinitions";
import {getSourceFile} from "../../utils";
import {StyleIdToTypographyTypeMap} from "./definitions";

const migrateStatements = (
    sourceFile: SourceFile,
    instructions: Record<string, any>,
    map: StyleIdToTypographyTypeMap
): void => {
    // Variable declaration
    // example: Heading = styled.div(theme.styles.typography["heading1"])
    if (!!instructions?.variables?.length) {
        instructions?.variables.forEach(item => {
            const statement = sourceFile.getVariableStatement(item.name);

            let styleKey = undefined;
            let typographyType = undefined;

            // Element access expression. Example: theme.styles.typography["heading1"]
            if (item.syntaxKind === SyntaxKind.ElementAccessExpression) {
                // Filter all children that have element access expression and access to typography
                const allExpressions = statement
                    .forEachChildAsArray()
                    .filter(
                        child =>
                            child.asKind(SyntaxKind.ElementAccessExpression) &&
                            child.getText().includes("typography")
                    );

                // Go to all element expressions in the variable declaration and update
                if (allExpressions) {
                    allExpressions.forEach(expression => {
                        const elementAccess = expression.asKind(SyntaxKind.ElementAccessExpression);

                        // Success to the typography key like, heading1, heading2....
                        const styleKeyLiteral = elementAccess
                            .getArgumentExpression()
                            .asKind(SyntaxKind.StringLiteral);
                        styleKey = styleKeyLiteral.getText();

                        // Typography type like headings, paragraphs...
                        typographyType = map[styleKey];
                        if (typographyType && styleKey) {
                            elementAccess.setExpression(
                                `theme.styles.typography.${typographyType}.byId("${styleKey}")`
                            );
                        }
                    });
                }
            }

            // For styled templates and property access expression.
            // example: const Wrapper = styled.div`${theme.styles.typography.paragraph2}`;
            if (item.syntaxKind === SyntaxKind.TemplateSpan) {
                const allTemplateSpans = statement
                    .forEachChildAsArray()
                    .filter(
                        child =>
                            child.asKind(SyntaxKind.TemplateSpan) &&
                            child.getText().includes("typography")
                    );

                if (allTemplateSpans) {
                    allTemplateSpans.forEach(templateSpan => {
                        const expression = templateSpan.asKind(SyntaxKind.TemplateSpan);
                        // Success to the typography key like, heading1, heading2....
                        styleKey = expression.getExpression().getKindName();
                        // Typography type like headings, paragraphs...
                        typographyType = map[styleKey];
                        if (typographyType && styleKey) {
                            expression.setExpression(
                                `theme.styles.typography.${typographyType}.byId("${styleKey}")`
                            );
                        }
                    });
                }
            }
        });
    }
};

const migrateImports = (source: SourceFile): void => {};

const migrateInterfaces = (source: SourceFile): void => {};

const migrateTypes = (source: SourceFile): void => {};

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
};
export const migrateFile = (
    migrateDefinition: ThemeFileMigrationDefinition,
    typographyMap: StyleIdToTypographyTypeMap,
    project: Project
): ThemeFileMigrationResult => {
    const source = getSourceFile(project, migrateDefinition.file.path);

    if (!source) {
        return {
            isSuccessfullyMigrated: false,
            skipped: true,
            info: `File does not exist. Path: ${migrateDefinition.file}`
        };
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

    if (migrateDefinition.migrationInstructions?.statements) {
        const statements = migrateDefinition.migrationInstructions?.statements;
        migrateStatements(source, statements, typographyMap);
    }

    return {
        skipped: false,
        isSuccessfullyMigrated: true
    };
};
