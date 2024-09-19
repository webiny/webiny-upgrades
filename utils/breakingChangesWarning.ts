import { createProcessor, getWebinyLink } from "../utils";
import yesno from "yesno";

export const breakingChangesWarning = (params: {
    version: string;
    breakingChangesCount?: number;
}) => {
    const { version, breakingChangesCount } = params;
    return createProcessor(async params => {
        const upgradeGuideLink = getWebinyLink(`/upgrade/${version}`);

        const warningMessage = [
            "Note that Webiny %s introduces",
            breakingChangesCount,
            "potential %s! Before continuing,",
            `please review the upgrade guide located at ${upgradeGuideLink}.\n`
        ]
            .filter(Boolean)
            .join(" ");

        let breakingChangesCountText = "breaking changes";
        if (breakingChangesCount === 1) {
            breakingChangesCountText = "breaking change";
        }

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
