import chalk from "chalk";

export const colors = {
    log: v => v,
    info: chalk.blueBright,
    error: chalk.red,
    warning: chalk.yellow,
    debug: chalk.gray,
    success: chalk.green
};

const colorizePlaceholders = (type, string) => {
    return string.replace(/\%[a-zA-Z]/g, match => {
        return colors[type](match);
    });
};

const log = (type, ...args) => {
    const prefix = `webiny ${colors[type](type)}: `;

    const [first, ...rest] = args;
    if (typeof first === "string") {
        return console.log(prefix + colorizePlaceholders(type, first), ...rest);
    }
    return console.log(prefix, first, ...rest);
};

class ConsoleLogger {
    private _debug = false;

    public readonly colors: typeof colors = colors;

    setDebug(debug) {
        this._debug = debug;
    }
    log(...args) {
        log("log", ...args);
    }

    info(...args) {
        log("info", ...args);
    }

    success(...args) {
        log("success", ...args);
    }

    debug(...args) {
        if (this._debug) {
            log("debug", ...args);
        }
    }

    warning(...args) {
        log("warning", ...args);
    }

    error(...args) {
        log("error", ...args);
    }
}

export type { ConsoleLogger };

export default new ConsoleLogger();
