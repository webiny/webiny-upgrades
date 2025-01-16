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

const log = (type: keyof typeof colors, ...args: any[]) => {
    const prefix = `webiny ${colors[type](type)}: `;

    const [first, ...rest] = args;
    if (typeof first === "string") {
        return console.log(prefix + colorizePlaceholders(type, first), ...rest);
    }
    return console.log(prefix, first, ...rest);
};

export type QuietTypes = "log" | "info" | "error" | "warning" | "debug" | "success";

const ALL = "*";

class ConsoleLogger {
    private _debug = false;
    private _quiet: QuietTypes[] | typeof ALL = [];

    public readonly colors: typeof colors = colors;

    public setQuiet(types?: QuietTypes[]): void {
        this._quiet = types === undefined ? ALL : types;
    }

    public setLoud(): void {
        this._quiet = [];
    }

    public setDebug(debug: boolean) {
        this._debug = debug;
    }

    public log(...args) {
        return this.exec("log", () => {
            log("log", ...args);
        });
    }

    public info(...args) {
        return this.exec("info", () => {
            log("info", ...args);
        });
    }

    public success(...args) {
        return this.exec("success", () => {
            log("success", ...args);
        });
    }

    public debug(...args) {
        if (this._debug === false) {
            return;
        }
        return this.exec("debug", () => {
            log("debug", ...args);
        });
    }

    public warning(...args) {
        return this.exec("warning", () => {
            log("warning", ...args);
        });
    }

    public error(...args) {
        return this.exec("error", () => {
            log("error", ...args);
        });
    }

    private exec(type: QuietTypes, cb: () => void): void {
        if (this._quiet === ALL || this._quiet.includes(type)) {
            return;
        }
        return cb();
    }
}

export type { ConsoleLogger };

export default new ConsoleLogger();
