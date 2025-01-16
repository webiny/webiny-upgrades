import { createProcessor, updateYarn } from "../utils";

export const updatesForYarn = createProcessor(async params => {
    const { context } = params;
    const version = "4.6.0";

    await updateYarn({
        context,
        version
    });
});
