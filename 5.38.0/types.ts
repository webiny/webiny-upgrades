import {Files} from "../utils";
import {Project} from "ts-morph";
import {Context} from "../types";

export interface ProcessorParams {
    files: Files;
    project: Project;
    context: Context;
}

export type ProcessorResult<T> = {skipped?: boolean;} & T;

export interface Processor<T = Record<string, any>> {
    (params: ProcessorParams): Promise<ProcessorResult<T> | void>;
}
