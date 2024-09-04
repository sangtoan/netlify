function convertNumberToMathMode(text) {
    const pattern = /(\b\w+\b\s)(\d+)(\s\b\w+\b)/g;
    return text.replace(pattern, (match, before, number, after) => {
        if (/[a-zA-Z]/.test(before) && /[a-zA-Z]/.test(after)) {
            return `${before} $${number}$ ${after}`;
        }
        return match;
    });
}

function processCurlyBraces(inputString) {
    const pattern = /\{\s*([^\s])\s*\}/g;
    return inputString.replace(pattern, (match, content) => `{${content}}`);
}

function convertStructure(inputString) {
    const pattern = /\\left\\{\\begin{array}{l}(.*?)\\end{array}\s*(.*?)\\right\.\s*\\right\./gs;
    return inputString.replace(pattern, (match, content, c3) => {
        return `\\left\\{\\begin{array}{l} ${content} \\end{array}\\right.${c3}\\right.`;
    });
}

function convertToHeva(inputString) {
    const pattern = /\\left\s*\\{\\begin{array}{l}(.*?)\\end{array}\s*\\right./gs;
    return inputString.replace(pattern, (match, content) => {
        const lines = content.split('\\\\').map(line => `& ${line.trim()}`);
        return `\\heva{\n${lines.join(' \\\\\n')} }`;
    });
}

function convertToHevatex1(inputString) {
    const pattern = /\\left\\{\\begin{array}{l}(.*?)\\end{array}(.+?)\\right./gs;
    return inputString.replace(pattern, (match, content, c3) => {
        const lines = content.split('\\\\').map(line => `& ${line.trim()}`);
        return `\\heva{\n${lines.join(' \\\\\n')}} ${c3}`;
    });
}

function convertToHoac(inputString) {
    const pattern = /\\left\s*\\begin{array}{l}(.*?)\\end{array}\s*\\right./gs;
    return inputString.replace(pattern, (match, content) => {
        const lines = content.split('\\\\').map(line => `& ${line.trim()}`);
        return `\\hoac{\n${lines.join(' \\\\\n')} }`;
    });
}

function convertToHoactex1(inputString) {
    const pattern = /\\left\\begin{array}{l}(.*?)\\end{array}(.+?)\\right./gs;
    return inputString.replace(pattern, (match, content, c3) => {
        const lines = content.split('\\\\').map(line => `& ${line.trim()}`);
        return `\\hoac{\n${lines.join(' \\\\\n')}} ${c3}`;
    });
}

function replaceTextWithJson(data, text) {
    data.forEach(item => {
        const findText = item.find;
        const replaceText = item.replace;
        const regex = new RegExp(findText, 'g');
        text = text.replace(regex, replaceText);
    });
    return text;
}

function applyResubFromJson(filePath, text) {
    return fetch(filePath)
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                const findText = item.find;
                const replaceText = item.replace;
                const regex = new RegExp(findText, 'gm');
                text = text.replace(regex, replaceText);
            });
            return text;
        })
        .catch(error => console.error('Error:', error));
}

function word2tex() {
    let inputCode = document.getElementById('inputCode').value;
    inputCode = inputCode.replace(/\\mathrm{R}/g, '\\mathbb{R}');
    inputCode = convertNumberToMathMode(inputCode);
    inputCode = inputCode.replace(/}\s*{/g, '}{');

    fetch('replace.json')
        .then(response => response.json())
        .then(data => {
            inputCode = replaceTextWithJson(data, inputCode);
            document.getElementById('outputCode').value = inputCode;
        })
        .catch(error => console.error('Error:', error));
}

function wordtotex() {
    let inputCode = document.getElementById('inputCode').value;
    inputCode = inputCode.replace(/\\mathrm{R}/g, '\\mathbb{R}');
    inputCode = convertNumberToMathMode(inputCode);
    inputCode = inputCode.replace(/}\s*{/g, '}{');

    fetch('replace.json')
        .then(response => response.json())
        .then(data => {
            inputCode = replaceTextWithJson(data, inputCode);
            document.getElementById('outputCode').value = inputCode;
        })
        .catch(error => console.error('Error:', error));
}

function fixCode() {
    let inputCode = document.getElementById('inputCode').value;
    inputCode = inputCode.replace(/\\mathrm{R}/g, '\\mathbb{R}');
    inputCode = convertNumberToMathMode(inputCode);
    inputCode = inputCode.replace(/}\s*{/g, '}{');

    fetch('replace.json')
        .then(response => response.json())
        .then(data => {
            inputCode = replaceTextWithJson(data, inputCode);
            document.getElementById('outputCode').value = inputCode;
        })
        .catch(error => console.error('Error:', error));
}
