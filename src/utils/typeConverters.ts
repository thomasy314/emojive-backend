
function stringListToStringMap(stringList: string[]): Map<string, string> {
    if (stringList.length % 2 !== 0) throw new Error("String list contains an odd number of values, all keys do not have a value")

    const map = new Map<string, string>()

    for (let i = 0; i < stringList.length; i += 2) {
        const key = stringList[i];
        const value = stringList[i + 1]
        map.set(key, value);
    }

    return map;
}

export {
    stringListToStringMap
};
