import { createProcessor } from "../utils";

export const updateForAwsSdk = createProcessor(async params => {
    const { project, files } = params;

    const file = files.byName("api/graphql/security");
    const source = project.getSourceFile(file.path);

    const text = source.getText();
    if (!text || text.includes("DynamoDBDocument")) {
        return;
    }

    source.replaceWithText(text.replace("DynamoDBClient", "DynamoDBDocument"));
});
