import { createProcessor } from "../utils";

export const updateForAwsSdk = createProcessor(async params => {
    const { project, files, context } = params;

    const file = files.byName("api/graphql/security");
    const source = project.getSourceFile(file.path);

    source.replaceWithText(source.getText().replace("DynamoDBClient", "DynamoDBDocument"));
});
