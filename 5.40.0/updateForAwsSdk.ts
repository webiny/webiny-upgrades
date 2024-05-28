import { createProcessor } from "../utils";

export const updateForAwsSdk = createProcessor(async params => {
    const { project, files, context } = params;

    const file = files.byName("api/graphql/security");
    const source = project.getSourceFile(file.path);

    const text = source.getText();
    if (!text || !text.includes("DynamoDBClient")) {
        return;
    }

    context.log.info(`Updating DynamoDB Client...`);

    source.replaceWithText(text.replaceAll("DynamoDBClient", "DynamoDBDocument"));
});
