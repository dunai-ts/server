/**
 * @module @dunai/server
 */

export function deepFreeze(obj: object): object {
    Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === 'object')
            obj[key] = deepFreeze(obj[key]);
    }, obj);
    return Object.freeze(obj);
}
