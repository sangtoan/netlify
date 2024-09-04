export function replaceTextWithJson(data, text) {
    data.forEach(item => {
        const findText = item.find;
        const replaceText = item.replace;
        const regex = new RegExp(findText, 'g');
        text = text.replace(regex, replaceText);
    });
    return text;
}

export function applyResubFromJson(filePath, text) {
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
export function convertArrayToHeva(text) {
    const arrayRegex = /\\left\\\{\\begin\{array\}\s*\{\s*[clr]\s*\}([\s\S]*?)\\end\{array\}\\right\./g;

    return text.replace(arrayRegex, (match, content) => {
        const lines = content.trim().split(/\\\\/).map(line => '&' + line.trim());
        return '\\heva{\n' + lines.join(' \\\\\n') + '\n}';
    });
}
export function convertArrayToHoac(text) {
    const arrayRegex = /\\left\[\\begin\{array\}\s*\{\s*[clr]\s*\}([\s\S]*?)\\end\{array\}\\right\./g;

    return text.replace(arrayRegex, (match, content) => {
        const lines = content.trim().split(/\\\\/).map(line => '&' + line.trim());
        return '\\hoac{\n' + lines.join(' \\\\\n') + '\n}';
    });
}
// yourFileName.js
export function removeSpacesInMathMode(text) {
    text = text.replace(/\^\{\prime\}/g, "'");
    // Xử lý các trường hợp có dấu $...$
    const regexDollar = /\$([A-Za-z\\.\s]+)\$/g;
    text = text.replace(regexDollar, match => {
        // Thay thế \cdot bằng .
        let cleaned = match.replace(/\\cdot/g, '.');
        // Loại bỏ các khoảng trắng nhưng giữ lại dấu .
        cleaned = cleaned.replace(/(?<=\S)\s+(?=\S)/g, '');
        return cleaned;
    });

    // Xử lý các trường hợp có dấu \(...\)
    const regexParen = /\((\s*[A-Za-z\\.\s]*\s*)+\)/g;
    text = text.replace(regexParen, match => {
        // Thay thế \cdot bằng .
        let cleaned = match.replace(/\\cdot/g, '.');
        // Loại bỏ các khoảng trắng nhưng giữ lại dấu .
        cleaned = cleaned.replace(/(?<=\S)\s+(?=\S)/g, '');
        return cleaned;
    });
    // Xử lý các trường hợp có dấu \(...\)
    const regexA = /\{(\s*[A-Za-z\\.\s]*\s*)+\}/g;
    text = text.replace(regexA, match => {
        // Thay thế \cdot bằng .
        let cleaned = match.replace(/\\cdot/g, '.');
        // Loại bỏ các khoảng trắng nhưng giữ lại dấu .
        cleaned = cleaned.replace(/(?<=\S)\s+(?=\S)/g, '');
        return cleaned;
    });

    // Xử lý các trường hợp không có dấu ngoặc đơn
    const regexNoParen = /\$(\s*[A-Za-z\\.\s]*\s*)+\$/g;
    text = text.replace(regexNoParen, match => {
        // Thay thế \cdot bằng .
        let cleaned = match.replace(/\\cdot/g, '.');
        // Loại bỏ các khoảng trắng nhưng giữ lại dấu .
        cleaned = cleaned.replace(/(?<=\S)\s+(?=\S)/g, '');
        return cleaned;
    });
    // Sử dụng biểu thức chính quy để tìm và thay thế các \item không nằm ở đầu dòng
    text = text.replace(/([^\n])\\item/g, '$1\n\\item ');
    //replace '' thành \lq\lq
    let isEven = true; // Biến cờ để kiểm tra thứ tự xuất hiện
    // Hàm thay thế cho các ký tự phù hợp
    text = text.replace(/"/g, match => {
        if (isEven) {
            isEven = false;
            return '``'; // Thay thế dấu nháy kép đầu tiên trong cặp bằng ``
        } else {
            isEven = true;
            return "''"; // Thay thế dấu nháy kép thứ hai trong cặp bằng ''
        }
    });
    // Biểu thức chính quy để tìm các cụm từ trong dấu $
    const regexDollarC = /\$([^$]+)\$/g;
   // Thay thế các cụm từ tìm thấy
   text = text.replace(regexDollarC, (match, content) => {
    // Sử dụng biểu thức chính quy để tách nội dung, ngoại trừ trường hợp giữa các số
    let parts = content.split(/(,\s*(?=\D)|(?<=\D),)/).filter(Boolean);

    // Xử lý từng phần tử
    parts = parts.map(part => {
        // Loại bỏ khoảng trắng thừa
        return part.replace(/\s+/g, '');
    });

    // Nối lại các phần tử với dấu $, $
    content = parts.join('$, $');

    // Thêm lại dấu $
    return `$${content}$`;
    });
    text = text.replace(/\$,\$,/g,'')
    return text;
}
export function RegexTwo(text) {
    // Xử lý các trường hợp có dấu $...$ DẠNG NÀY $A B C D \\cdot A' B' C' D'$
    const regexB = /\$([A-Za-z\s'\\]+\\cdot[A-Za-z\s']+)\$/g;
    text = text.replace(regexB, match => {
        // Thay thế \cdot bằng .
        let cleaned = match.replace(/\\cdot/g, '.');
        // Loại bỏ các khoảng trắng giữa các chữ cái và dấu chấm
        cleaned = cleaned.replace(/\s+/g, '');
        return cleaned;
    });
    return text;

}