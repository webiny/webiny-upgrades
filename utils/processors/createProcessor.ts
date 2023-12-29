import { IProcessor, IProcessorParams, IProcessorResult } from "../../types";

export { IProcessor, IProcessorParams, IProcessorResult };

export const createProcessor = <T = Record<string, any>>(processor: IProcessor<T>) => {
    return processor;
};
