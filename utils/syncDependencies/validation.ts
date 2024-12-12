import zod from "zod";
import { PackageType } from "./types";

const dependencyValidation = zod.object({
    name: zod.string(),
    version: zod.string(),
    files: zod.array(zod.string())
});

const referenceVersionFileValidation = zod.object({
    file: zod.string(),
    types: zod.enum([
        PackageType.dependencies,
        PackageType.devDependencies,
        PackageType.peerDependencies,
        PackageType.resolutions
    ])
});

const referenceVersionValidation = zod.object({
    version: zod.string(),
    files: zod.array(referenceVersionFileValidation)
});

const referenceValidation = zod.object({
    name: zod.string(),
    versions: zod.array(referenceVersionValidation)
});

export const createReferencesValidation = () => {
    return zod.object({
        dependencies: zod.array(dependencyValidation),
        devDependencies: zod.array(dependencyValidation),
        peerDependencies: zod.array(dependencyValidation),
        resolutions: zod.array(referenceValidation),
        references: zod.array(referenceValidation)
    });
};
