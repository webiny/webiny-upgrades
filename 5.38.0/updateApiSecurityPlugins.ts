import { createProcessor } from "../utils";
import { updateCognito } from "./updateApiSecurityPlugins/updateCognito";
import { updateOktaAuth0 } from "./updateApiSecurityPlugins/updateOktaAuth0";

export const updateApiSecurityPlugins = createProcessor(async params => {
    const { project, files } = params;

    const securityFile = files.byName("api/graphql/security");
    const source = project.getSourceFile(securityFile.path);

    // Check if the `security.ts` file contains `okta` or `auth0` string.
    if (source.getText().match(/okta/i) || source.getText().match(/auth0/i)) {
        return updateOktaAuth0(params);
    }

    return updateCognito(params);
});
