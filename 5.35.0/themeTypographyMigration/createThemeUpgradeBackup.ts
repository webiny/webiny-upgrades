export type ThemeBackupResult = {
    isSuccessful: booleans;
    info?: string;
};

/*
 *TODO: Create backup of the files and theme for the user.
 * Creates folder named 'legacy_theme_backup'
 * */
export const createThemeUpgradeBackup = (): ThemeBackupResult => {
    return {
        isSuccessful: true
    };
};
