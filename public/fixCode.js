import { convertNumberToMathMode } from './numberUtils.js';
import { replaceTextWithJson, convertArrayToHeva, convertArrayToHoac,removeSpacesInMathMode } from './replaceUtils.js';

export function fixCode() {
    let inputCode = document.getElementById('inputCode').value;
    inputCode = inputCode.replace('Lò̀i giải','Lời giải')
    inputCode = inputCode.replace(/\\mathrm{R}/g, '\\mathbb{R}');
    inputCode = convertNumberToMathMode(inputCode);
    inputCode = inputCode.replace(/}\s*{/g, '}{');
    inputCode = convertArrayToHeva(inputCode);
    inputCode = convertArrayToHoac(inputCode);
    inputCode = removeSpacesInMathMode(inputCode);
    fetch('replace.json')
        .then(response => response.json())
        .then(data => {
            inputCode = replaceTextWithJson(data, inputCode);
            document.getElementById('outputCode').value = inputCode;
        })
        .catch(error => console.error('Error:', error));
}
