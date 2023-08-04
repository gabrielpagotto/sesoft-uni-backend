export function omitObjectFields<T, Key extends keyof T>(
    object: T,
    keys: Key[]
): Omit<T, Key> {
    for (let key of keys) {
        delete object[key]
    }
    return object
}
