import path from "path";
import fs from "fs";

import { createProcessor } from "../utils";

export const robotsTxtUpdates = createProcessor(async params => {
    const { context } = params;

    context.log.info(
        "Creating %s files for Admin and Website project applications...",
        "robots.txt"
    );

    const adminPublicFolderPath = path.join(context.project.root, "apps", "admin", "public");
    const websitePublicFolderPath = path.join(context.project.root, "apps", "website", "public");

    const adminRobotsTxt = fs.readFileSync(
        path.join(__dirname, "robotsTxtUpdates", "admin-robots.txt"),
        "utf8"
    );
    const websiteRobotsTxt = fs.readFileSync(
        path.join(__dirname, "robotsTxtUpdates", "website-robots.txt"),
        "utf8"
    );

    const adminRobotsTxtPath = path.join(adminPublicFolderPath, "robots.txt");
    const websiteRobotsTxtPath = path.join(websitePublicFolderPath, "robots.txt");

    if (fs.existsSync(adminRobotsTxtPath)) {
        context.log.warning(
            `Skipping creation of %s file, already exists.`,
            "apps/admin/public/robots.txt"
        );
    } else {
        fs.writeFileSync(adminRobotsTxtPath, adminRobotsTxt);
    }

    if (fs.existsSync(websiteRobotsTxtPath)) {
        context.log.warning(
            `Skipping creation of %s file, already exists.`,
            "apps/website/public/robots.txt"
        );
    } else {
        fs.writeFileSync(path.join(websitePublicFolderPath, "robots.txt"), websiteRobotsTxt);
    }
});
