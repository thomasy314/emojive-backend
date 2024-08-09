/**
 * Return a boolean indicating if a given string is properly formatted JSON 
 * @param {string} jsonString JSON string for validating
 * @returns {boolean}
 */
function isValidJson(jsonString: string): boolean {
    try {
        JSON.parse(jsonString)
    } catch (e) {
        return false;
    }
    return true;
}

export {
    isValidJson
};

