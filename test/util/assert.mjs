export function strictEqual(actual, expected, title) {
    // return {
    //     result: actual === expected,
    //     message: actual === expected ? "" : `${title ? title + ":  " : ""}${expected} is expected, but got ${actual}`
    // }
    if(actual !== expected) {
        throw Error(`${title ? title + ":  " : ""}${expected} is expected, but got ${actual}`)
    }
} 