export function convertNumberToMathMode(text) {
    
    const mathrmPattern = /\\mathrm{([^dACP\s~][a-zA-Z]*)}/g;
    const mathrmTildePattern = /\\mathrm{~([^dACP\s~][a-zA-Z]*)}/g;

    
    // Thay thế \mathrm{[a-zA-Z]} thành [a-zA-Z], ngoại trừ d, A, C, P
    text = text.replace(mathrmPattern, (match, char) => {
        return `${char}`;
    });

    // Thay thế \mathrm{~[a-zA-Z]} thành [a-zA-Z], ngoại trừ d, A, C, P
    text = text.replace(mathrmTildePattern, (match, char) => {
        return `${char}`;
    });

    return text;
}
