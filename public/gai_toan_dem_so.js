function calculate() {
    // Lấy giá trị từ form
    const setA = document.getElementById('setA').value.split(',').map(Number);
    const conditionK = parseInt(document.getElementById('conditionK').value);
    const conditionAny = document.getElementById('conditionAny').checked;
    const conditionOdd = document.getElementById('conditionOdd').checked;
    const conditionEven = document.getElementById('conditionEven').checked;
    const conditionDivisible = parseInt(document.getElementById('conditionDivisible').value);
    const conditionInclude = document.getElementById('conditionInclude').value.split(',').map(Number);
    const conditionIncludeTwo = document.getElementById('conditionIncludeTwo').value.split(',').map(Number);
    const conditionAdjacent = document.getElementById('conditionAdjacent').value.split(',').map(Number);
    const conditionGreaterThan = parseInt(document.getElementById('conditionGreaterThan').value);
    const conditionLessThan = parseInt(document.getElementById('conditionLessThan').value);

    // Khởi tạo mảng chứa các số thỏa mãn điều kiện
    let resultArray = [...setA];

    // Kiểm tra các điều kiện và lọc mảng resultArray
    if (!isNaN(conditionK)) {
        resultArray = resultArray.filter(num => new Set(num.toString().split('')).size === conditionK);
    }

    if (conditionOdd) {
        resultArray = resultArray.filter(num => num % 2 !== 0);
    }

    if (conditionEven) {
        resultArray = resultArray.filter(num => num % 2 === 0);
    }

    if (!isNaN(conditionDivisible)) {
        resultArray = resultArray.filter(num => num % conditionDivisible === 0);
    }

    if (conditionInclude.length > 0 && !isNaN(conditionInclude[0])) {
        resultArray = resultArray.filter(num => conditionInclude.every(digit => num.toString().includes(digit)));
    }

    if (conditionIncludeTwo.length === 2 && !isNaN(conditionIncludeTwo[0]) && !isNaN(conditionIncludeTwo[1])) {
        resultArray = resultArray.filter(num => {
            const numStr = num.toString();
            return numStr.includes(conditionIncludeTwo[0]) && numStr.includes(conditionIncludeTwo[1]);
        });
    }

    if (conditionAdjacent.length === 2 && !isNaN(conditionAdjacent[0]) && !isNaN(conditionAdjacent[1])) {
        resultArray = resultArray.filter(num => {
            const numStr = num.toString();
            const pos1 = numStr.indexOf(conditionAdjacent[0]);
            const pos2 = numStr.indexOf(conditionAdjacent[1]);
            return Math.abs(pos1 - pos2) === 1;
        });
    }

    if (!isNaN(conditionGreaterThan)) {
        resultArray = resultArray.filter(num => num > conditionGreaterThan);
    }

    if (!isNaN(conditionLessThan)) {
        resultArray = resultArray.filter(num => num < conditionLessThan);
    }

    // Hiển thị kết quả
    document.getElementById('result').innerText = 'Các số thỏa mãn điều kiện: ' + resultArray.join(', ');
}
