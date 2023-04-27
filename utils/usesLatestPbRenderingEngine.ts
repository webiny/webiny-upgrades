import fs from 'fs';

export const usesLatestPbRenderingEngine = (projectRoot = process.cwd()) => {
    const themeTsExists = fs.existsSync(`${projectRoot}/apps/theme/theme.ts`);
    const globalScssExists = fs.existsSync(`${projectRoot}/apps/theme/global.scss`);

    return themeTsExists && globalScssExists;
}