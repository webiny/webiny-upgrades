import { IProcessor } from "../../types";

export const createProcessor = <T = Record<string, any>>(processor: IProcessor<T>) => {
    return processor;
};
