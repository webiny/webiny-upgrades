import { createProcessor, getWebinyLink } from "../utils";
import yesno from "yesno";

export const breakingChangesWarning = (params: {
    version: string;
    breakingChangesCount: number;
}) => {
    const { version, breakingChangesCount } = params;
    return createProcessor(async params => {
        const upgradeGuideLink = getWebinyLink("/upgrade/5.39.0");

        const warningMessage = [
            "Note that Webiny %s introduces potentially %s %s! Before continuing,",
            `please review the upgrade guide located at ${upgradeGuideLink}.\n`
        ].join(" ");

        const breakingChangesCountText =
            breakingChangesCount === 1 ? "breaking change" : "breaking changes";

        params.context.log.warning(
            warningMessage,
            version,
            breakingChangesCount,
            breakingChangesCountText
        );

        const ok = await yesno({
            question:
                "I have read the upgrade guide and I am ready to proceed with the upgrade (y/N):",
            defaultValue: false
        });

        if (!ok) {
            params.context.log.info("Upgrade aborted.");
            process.exit(0);
        }
    });
};
