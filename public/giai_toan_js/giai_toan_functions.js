function showCalculation(id) {
    var calculations = document.getElementsByClassName('calculation');
    for (var i = 0; i < calculations.length; i++) {
        calculations[i].style.display = 'none';
    }
    document.getElementById(id).style.display = 'block';
}

function calculatePower() {
    const number = document.getElementById('number').value;
    const exponent = document.getElementById('exponent').value;
    const bigIntNumber = bigInt(number);
    const result = bigIntNumber.pow(exponent);
    document.getElementById('result').innerText = result.toString();
}

function calculateExpansion() {
    const polynomial = document.getElementById('polynomial').value;
    let expanded;
    try {
        expanded = math.simplify(polynomial).toString();
    } catch (error) {
        document.getElementById('rendered-result').innerHTML = 'Lỗi khi khai triển đa thức: ' + error.message;
        return;
    }

    const latex = math.parse(expanded).toTex();

    document.getElementById('rendered-result').innerHTML = `\\[ ${latex} \\]`;
    document.getElementById('latex-code').innerText = latex;

    renderMathInElement(document.getElementById('rendered-result'));
}
