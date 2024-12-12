import { createProcessor, updateYarn } from "../utils";

export const updatesForYarn = createProcessor(async params => {
    const { context } = params;
    const version = "4.5.3";

    await updateYarn({
        context,
        version
    });
});
