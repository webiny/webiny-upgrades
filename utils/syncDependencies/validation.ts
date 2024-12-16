import zod from "zod";
import { PackageType } from "./types";

const dependencyValidation = zod.object({
    name: zod.string(),
    version: zod.string(),
    files: zod.array(zod.string())
});

const referenceVersionFileValidation = zod.object({
    file: zod.string(),
    types: zod.array(
        zod.string().refine(value => {
            return [
                String(PackageType.dependencies),
                String(PackageType.devDependencies),
                String(PackageType.peerDependencies),
                String(PackageType.resolutions)
            ].includes(value);
        })
    )
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
        resolutions: zod.array(dependencyValidation),
        references: zod.array(referenceValidation)
    });
};
