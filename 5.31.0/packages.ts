import path from "path";

import { Context } from "../types";
import {
    addPackagesToDependencies,
    addPackagesToDevDependencies,
    addPackagesToResolutions,
    log
} from "../utils";

const upgradeFiles = {
    root: "package.json",
    appsAdmin: "apps/admin/package.json",
    appsTheme: "apps/theme/package.json",
    appsWebsite: "apps/website/package.json"
};

export const upgradePackages = (context: Context): void => {
    addPackagesToDevDependencies(context, upgradeFiles.root, {
        "@types/react": "17.0.39",
        "@types/react-dom": "17.0.11"
    });

    log.success(`Upgraded 'devDependencies' into`, upgradeFiles.root);

    addPackagesToResolutions(context, upgradeFiles.root, {
        "@types/react": "17.0.39",
        react: "17.0.2",
        "react-dom": "17.0.2"
    });

    log.success(`Upgraded 'resolutions' into`, upgradeFiles.root);

    // apps/admin/package.json
    addPackagesToDependencies(context, upgradeFiles.appsAdmin, {
        "@types/react": "17.0.39",
        react: "17.0.2",
        "react-dom": "17.0.2"
    });

    log.success(`Upgraded 'dependencies' into`, upgradeFiles.appsAdmin);

    // apps/theme/package.json
    addPackagesToDependencies(context, upgradeFiles.appsTheme, {
        react: "17.0.2"
    });

    log.success(`Upgraded 'dependencies' into`, upgradeFiles.appsTheme);

    // apps/website/package.json
    addPackagesToDependencies(context, upgradeFiles.appsWebsite, {
        "@types/react": "17.0.39",
        react: "17.0.2",
        "react-dom": "17.0.2"
    });

    log.success(`Upgraded 'dependencies' into`, upgradeFiles.appsWebsite);
};
