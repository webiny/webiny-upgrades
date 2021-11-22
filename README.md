# webiny-upgrades
Contains upgrade scripts, executed via the `webiny upgrade` command.

# Development Notes

## Creating New Upgrades

The first step is to create a new folder in the repository root. 

For example, if we're writing an upgrade script for the upcoming `5.50.0` version of Webiny, we need to create a folder named `5.50.0`. Once that's done, simply create an `index.js` file in it, and start writing your script For example:

```js
const { log } = require("../utils");

module.exports = async context => {
    log.info("Doing something...");
    
    // Do whatever you might need to do...
    
    // Format updated files.
    const files = [...];
    await prettierFormat(files, context);

    /**
     * Install new packages.
     */
    await yarnInstall({
        context
    });
};
```

## Fixing An Existing Upgrade Script

Noticed something is off with a live upgrade script?

When fixing an upgrade script, in order to avoid further affecting the existing live one, it's recommended we just copy/paste the existing script. So, for example, copy the code from the existing `5.50.0` into a new `5.50.0-hot-fix` folder. Then, when testing the upgrade script via the Webiny CLI, just tell the upgrade command to use the new code, via the `--use-version` flag. For example:

```
yarn webiny upgrade --use-version 5.50.0-hot-fix
```

Once you've concluded the fix is ready to go live, simply delete the initial `5.50.0` folder and remove the `-hot-fix` suffix from the `5.50.0-hot-fix` folder name.
