function replacenew(content) {
    content = content.replace(/{listEX}/g, '{enumerate}');
    content = content.replace(/{aligned}\[t\]/g, '{aligned}');
    content = content.replace(/\\quad/g,' ')
    content = content.replace(/\\qquad/g,' ')
    //content = content.replace(/\$\s*\\begin{aligned}/g, '\\\\$\\begin{aligned}');
    return content;
}

function replaceHeva1(content) {
    const regexHeva = /\\heva\s*\{([\s\S]*?)\}/g;
    return content.replace(regexHeva, (match, innerContent) => {
        const newContent = innerContent.replace(/&/g, '').trim();
        return `\\begin{cases} ${newContent} \\end{cases}`;
    });
}

function replaceHoac1(content) {
    const regexHoac = /\\hoac\s*\{([\s\S]*?)\}/g;
    return content.replace(regexHoac, (match, innerContent) => {
        const newContent = innerContent.replace(/&\s*/g, '').trim();
        return `\\left[\\begin{array}{l} ${newContent} \\end{array}\\right.`;
    });
}
function removeChoice(content) {
    const regexChoice = /\\choice\s*\{/g;
    return content.replace(regexChoice, '');
}
function replaceMathLineBreaksG(content) {
    const regexMath = /\$[^$]*\$/g;
    return content.replace(regexMath, (match) => {
        return match.replace(/\\\\/g, 'ayzx');
    });
}
function replaceMathLineBreaks(content) {
    const regexMath = /(\$\$[\s\S]*?\$\$|\$[^$]*\$)/g;
    return content.replace(regexMath, (match) => {
        return match.replace(/\\\\/g, 'ayzx');
    });
}

function restoreMathLineBreaks(content) {
    return content.replace(/ayzx/g, '\\\\');
}

function replaceShortansNumber(content) {
    const regex = /\\shortans\{\$([0-9]+)\$\}/g;
    return content.replace(regex, '\\shortans{$1}');
  }
  
  function layCacNgoacLon(text) {
    let ngoacLon = [];
    let demNgoac = 0;
    let batDau = null;
  
    for (let i = 0; i < text.length; i++) {
        let kyTu = text[i];
        if (kyTu === "{") {
            if (demNgoac === 0) {
                batDau = i;
            }
            demNgoac += 1;
        } else if (kyTu === "}") {
            demNgoac -= 1;
            if (demNgoac === 0 && batDau !== null) {
                let ketThuc = i;
                ngoacLon.push([batDau, ketThuc]);
                batDau = null;
            }
        }
    }
  
    return ngoacLon;
  }
  
  function replaceHeva(content) {
    const regexHeva = /\\heva\s*\{/g;
    let match;
    while ((match = regexHeva.exec(content)) !== null) {
        const startIndex = match.index;
        const ngoacLon = layCacNgoacLon(content.slice(startIndex));
        if (ngoacLon.length > 0) {
            const [batDau, ketThuc] = ngoacLon[0];
            const innerContent = content.slice(startIndex + batDau + 1, startIndex + ketThuc);
            const newContent = innerContent.replace(/&/g, '\\\\').trim();
            const fullMatch = content.slice(startIndex, startIndex + ketThuc + 1);
            const replacedMatch = `\\begin{cases} ${newContent} \\end{cases}`;
            content = content.replace(fullMatch, replacedMatch);
        }
    }
    return content;
}

function replaceHoac(content) {
    const regexHoac = /\\hoac\s*\{/g;
    let match;
    while ((match = regexHoac.exec(content)) !== null) {
        const startIndex = match.index;
        const ngoacLon = layCacNgoacLon(content.slice(startIndex));
        if (ngoacLon.length > 0) {
            const [batDau, ketThuc] = ngoacLon[0];
            const innerContent = content.slice(startIndex + batDau + 1, startIndex + ketThuc);
            const newContent = innerContent.replace(/&/g, '\\\\').trim();
            const fullMatch = content.slice(startIndex, startIndex + ketThuc + 1);
            const replacedMatch = `\\left[\\begin{array}{l} ${newContent} \\end{array}\\right.`;
            //replacedMatch = replacedMatch.replace('lt;','\>' );
            content = content.replace(fullMatch, replacedMatch);
            
        }
    }
    return content;
}

  function removeLatexComments(content) {
    return content.replace(/%.*$/gm, '');
  }
  
  function renderLatexInElement(element) {
    let exampleCount = 1;
    let vdCount = 1;
    let btCount = 1;
    let dangCount = 1;
    let dnCount = 1;
    let dlCount = 1;
    let tcCount = 1;
    let noteCount = 1;
    let luuyCount = 1;
  
    function replaceLoigiai(content) {
        const regex = /\\loigiai\s*\{/g;
  
        let result = '';
        let lastIndex = 0;
  
        content.replace(regex, (match, offset, string) => {
            let startIndex = offset + match.length - 1;
            let remainingString = string.slice(startIndex);
            let braces = layCacNgoacLon(remainingString);
  
            if (braces.length > 0) {
                let [batDau, ketThuc] = braces[0];
                let contentInside = remainingString.slice(batDau + 1, ketThuc);
                let transformedContent = `\\begin{lg}${contentInside}\\end{lg}`;
  
                result += content.slice(lastIndex, startIndex + batDau + 1) + transformedContent;
                lastIndex = startIndex + ketThuc + 1;
            }
            return match;
        });
  
        result += content.slice(lastIndex);
        return result;
    }
  ////
  function replaceChoice(content) {
    const regex = /\\choice\s*\{/g;

    let result = '';
    let lastIndex = 0;

    content.replace(regex, (match, offset, string) => {
        let startIndex = offset + match.length - 1;
        let remainingString = string.slice(startIndex);
        let braces = layCacNgoacLon(remainingString);

        if (braces.length >= 4) {
            let choices = braces.slice(0, 4).map(pair => remainingString.slice(pair[0] + 1, pair[1]));
            let labels = ['A', 'B', 'C', 'D'];
            let transformedChoices = '<div class="choices">' + choices.map((choice, index) => {
                const isCorrect = choice.includes('\\True');
                choice = choice.replace('\\True', '');
                return `<div class="choice">
                            <label class="custom-radio" data-label="${labels[index]}">
                                <input type="radio" name="choice${exampleCount - 1}" value="${isCorrect}">
                                <span class="radio-label"></span>
                            </label>
                            ${choice}
                        </div>`;
            }).join('') + '</div><div class="result"></div>';

            result += content.slice(lastIndex, startIndex + braces[0][0] + 1) + transformedChoices;
            lastIndex = startIndex + braces[3][1] + 1;
        }
        return match;
    });

    result += content.slice(lastIndex);
    return result;
}

  ////
    function replaceChoiceGOC(content) {
        const regex = /\\choice\s*\{/g;
  
        let result = '';
        let lastIndex = 0;
  
        content.replace(regex, (match, offset, string) => {
            let startIndex = offset + match.length - 1;
            let remainingString = string.slice(startIndex);
            let braces = layCacNgoacLon(remainingString);
  
            if (braces.length >= 4) {
                let choices = braces.slice(0, 4).map(pair => remainingString.slice(pair[0] + 1, pair[1]));
                let labels = ['A', 'B', 'C', 'D'];
                let transformedChoices = '<div class="choices">' + choices.map((choice, index) => {
                    const isCorrect = choice.includes('\\True');
                    choice = choice.replace('\\True', '');
                    return `<div class="choice"><input type="radio" name="choice${exampleCount - 1}" value="${isCorrect}"> ${labels[index]}. ${choice}</div>`;
                }).join('') + '</div><div class="result"></div>';
  
                result += content.slice(lastIndex, startIndex + braces[0][0] + 1) + transformedChoices;
                lastIndex = startIndex + braces[3][1] + 1;
            }
            return match;
        });
  
        result += content.slice(lastIndex);
        return result;
    }
  
    function replaceChoiceTF(content) {
        const regex = /\\choiceTF\s*\{/g;
  
        let result = '';
        let lastIndex = 0;
  
        content.replace(regex, (match, offset, string) => {
            let startIndex = offset + match.length - 1;
            let remainingString = string.slice(startIndex);
            let braces = layCacNgoacLon(remainingString);
  
            if (braces.length >= 4) {
                let choices = braces.slice(0, 4).map(pair => remainingString.slice(pair[0] + 1, pair[1]));
                let labels = ['A', 'B', 'C', 'D'];
                let transformedChoices = '<div class="truefalse">' + choices.map((choice, index) => {
                    const isCorrect = choice.includes('\\True');
                    choice = choice.replace('\\True', '');
                    return `<div class="choice"><input type="radio" name="truefalse${exampleCount - 1}" value="${isCorrect}"> ${labels[index]}. ${choice}</div>`;
                }).join('') + '</div><div class="result"></div>';
  
                result += content.slice(lastIndex, startIndex + braces[0][0] + 1) + transformedChoices;
                lastIndex = startIndex + braces[3][1] + 1;
            }
            return match;
        });
  
        result += content.slice(lastIndex);
        return result;
    }
  
    function replaceChoiceTFt(content) {
        const regex = /\\choiceTFt\s*\{/g;
  
        let result = '';
        let lastIndex = 0;
  
        content.replace(regex, (match, offset, string) => {
            let startIndex = offset + match.length - 1;
            let remainingString = string.slice(startIndex);
            let braces = layCacNgoacLon(remainingString);
  
            if (braces.length >= 4) {
                let choices = braces.slice(0, 4).map(pair => remainingString.slice(pair[0] + 1, pair[1]));
                let labels = ['A', 'B', 'C', 'D'];
                let transformedChoices = '<div class="truefalse">' + choices.map((choice, index) => {
                    const isCorrect = choice.includes('\\True');
                    choice = choice.replace('\\True', '');
                    return `<div class="choice"><input type="radio" name="truefalset${exampleCount - 1}" value="${isCorrect}"> ${labels[index]}. ${choice}</div>`;
                }).join('') + '</div><div class="result"></div>';
  
                result += content.slice(lastIndex, startIndex + braces[0][0] + 1) + transformedChoices;
                lastIndex = startIndex + braces[3][1] + 1;
            }
            return match;
        });
  
        result += content.slice(lastIndex);
        return result;
    }
  
    function replaceShortans(content) {
        content = replaceShortansNumber(content);
        const regex = /\\shortans\s*\{/g;
  
        let result = '';
        let lastIndex = 0;
  
        content.replace(regex, (match, offset, string) => {
            let startIndex = offset + match.length - 1;
            let remainingString = string.slice(startIndex);
            let braces = layCacNgoacLon(remainingString);
  
            if (braces.length > 0) {
                let [batDau, ketThuc] = braces[0];
                let answer = remainingString.slice(batDau + 1, ketThuc).trim();
                let transformedAnswer = `<div class="shortans"><input type="text" name="fillblank${exampleCount - 1}" data-answer="${answer}"><div class="result"></div></div>`;
  
                result += content.slice(lastIndex, startIndex + batDau + 1) + transformedAnswer;
                lastIndex = startIndex + ketThuc + 1;
            }
            return match;
        });
  
        result += content.slice(lastIndex);
        return result;
    }
  
    function convertLatexToHTML(content) {
        // replace // thành br
        content = replaceMathLineBreaks(content)
        // Remove comments
        content = removeLatexComments(content);
        // Convert heva
        content = replaceHeva(content);

        // Convert hoac
        content = replaceHoac(content);
        // Convert sections
        content = content.replace(/\\section{([^}]+)}/g, '<h1>$1</h1>');
        content = content.replace(/\\subsection{([^}]+)}/g, '<h2>$1</h2>');
        content = content.replace(/\\subsubsection{([^}]+)}/g, '<h3>$1</h3>');
        content = content.replace(/\\paragraph{([^}]+)}/g, '<h4>$1</h4>');
  
        // Convert bold text and change color to blue
        content = content.replace(/\\textbf{([^}]+)}/g, '<strong style="color: blue;">$1</strong>');
  
        // Convert itemize
        content = content.replace(/\\begin{itemize}/g, '<ul>');
        content = content.replace(/\\end{itemize}/g, '</ul>');
        content = content.replace(/\\item\s+/g, '<li>');
  
        // Convert enumerate
        content = content.replace(/\\begin{enumerate}/g, '<ol>');
        content = content.replace(/\\end{enumerate}/g, '</ol>');
        content = content.replace(/\\item\s+/g, '<li>');
  
        // Convert display math $$...$$ to \[...\]
        content = content.replace(/\$\$([\s\S]+?)\$\$/g, '\\[$1\\]');
  
        // Convert inline math $...$ to \(...\)
        content = content.replace(/(?<!\$)\$([^\$]+?)\$(?!\$)/g, '\\($1\\)');
  
        // Convert example block
        content = content.replace(/\\begin{ex}/g, () => `<div class="example"><strong class="question">Câu ${exampleCount++}:</strong>`);
        content = content.replace(/\\end{ex}/g, '</div>');
  
        // Convert ví dụ block
        content = content.replace(/\\begin{vd}/g, () => `<div class="vidu"><strong class="question">Ví dụ ${vdCount++}:</strong>`);
        content = content.replace(/\\end{vd}/g, '</div>');

        content = content.replace(/\\begin{ghichu}/g, () => `<div class="ghichu"><strong class="question">Ghi chú:</strong>`);
        content = content.replace(/\\end{ghichu}/g, '</div>');
  
        // Convert bt block
        content = content.replace(/\\begin{bt}/g, () => `<div class="baitap"><strong class="question">Bài Tập ${btCount++}:</strong>`);
        content = content.replace(/\\end{bt}/g, '</div>');
  
        // Convert dang block
        content = content.replace(/\\begin{1dang}\{([^}]+)\}/g, () => `<div class="dang"><strong>Dạng ${dangCount++}: $1</strong><br>`);
        content = content.replace(/\\begin{1dang}/g, () => `<div class="dang"><strong>Dạng ${dangCount++}:</strong><br>`);
        content = content.replace(/\\end{1dang}/g, '</div>');
        


// Convert dang block with title
content = content.replace(/\\begin{dang}\{([^}]+)\}/g, (match, title) => 
  `<div class="dang">
    <strong>
      <span style="color: blue;">Dạng ${dangCount++}:</span>
      <span style="color: magenta;"> ${title}</span>
    </strong><br>`);

// Convert dang block without title
content = content.replace(/\\begin{dang}/g, () => 
  `<div class="dang">
    <strong>
      <span style="color: blue;">Dạng ${dangCount++}:</span>
    </strong><br>`);

// End dang block
content = content.replace(/\\end{dang}/g, '</div>');

////

// Convert dang block with title
content = content.replace(/\\begin{dang1}\{([^}]+)\}/g, (match, title) => 
    `<div class="dang1">
      <strong>
        <span style="color: blue;">Dạng :</span>
        <span style="color: magenta;"> ${title}</span>
      </strong><br>`);
  
  // Convert dang block without title
  content = content.replace(/\\begin{dang1}/g, () => 
    `<div class="dang1">
      <strong>
        <span style="color: blue;">Dạng :</span>
      </strong><br>`);
  
  // End dang block
  content = content.replace(/\\end{dang1}/g, '</div>');

  
        // Convert dn block
        content = content.replace(/\\begin{dn}\[([^}]+)\]/g, () => `<div class="dn"><strong>Định nghĩa ${dnCount++}: $1</strong><br>`);
        content = content.replace(/\\begin{dn}/g, () => `<div class="dn"><strong>Định nghĩa ${dnCount++}:</strong><br>`);
        content = content.replace(/\\end{dn}/g, '</div>');
  
        // Convert dl block
        content = content.replace(/\\begin{dl}\{([^}]+)\}/g, () => `<div class="dl"><strong>Định lý ${dlCount++}: $1</strong><br>`);
        content = content.replace(/\\begin{dl}/g, () => `<div class="dl"><strong>Định lý ${dlCount++}:</strong><br>`);
        content = content.replace(/\\end{dl}/g, '</div>');
  
        // Convert tc block
        content = content.replace(/\\begin{tc}\[([^}]+)\]/g, () => `<div class="tc"><strong>Tính chất ${tcCount++}: $1</strong><br>`);
        content = content.replace(/\\begin{tc}/g, () => `<div class="tc"><strong>Tính chất ${tcCount++}:</strong><br>`);
        content = content.replace(/\\end{tc}/g, '</div>');
  
        // Convert note block
        content = content.replace(/\\begin{note}\[([^}]+)\]/g, () => `<div class="note"><strong>Chú ý ${noteCount++}: $1</strong><br>`);
        content = content.replace(/\\begin{note}/g, () => `<div class="note"><strong>Chú ý ${noteCount++}:</strong><br>`);
        content = content.replace(/\\end{note}/g, '</div>');
  
        // Convert luuy block
        content = content.replace(/\\begin{luuy}\[([^}]+)\]/g, () => `<div class="luuy"><strong>Chú ý ${luuyCount++}: $1</strong><br>`);
        content = content.replace(/\\begin{luuy}/g, () => `<div class="luuy"><strong>Chú ý ${luuyCount++}:</strong><br>`);
        content = content.replace(/\\end{luuy}/g, '</div>');
  
        // Convert lg block with toggle button
        content = content.replace(/\\begin{lg}([\s\S]+?)\\end{lg}/g, function(match, p1) {
            return '<div class="solution"><button onclick="toggleSolution(this)">Hiện lời giải</button><div class="solution-content" style="display: none;">' + p1 + '</div></div>';
        });
  
        // Convert line breaks \\ to <br>
        content = content.replace(/\\\\/g, '<br>');
        content = content.replace(/\\loigiai\{/g, '<br>');        
        content = content.replace(/amp;/g, '');        
        content = content.replace(/\\lq\\lq/g, '"');
        content = content.replace(/\\rq\\rq/g, '"');
        return content;
    }
  
    // Toggle solution visibility
    window.toggleSolution = function(button) {
        var solutionContent = button.nextElementSibling;
        if (solutionContent.style.display === "none" || solutionContent.style.display === "") {
            solutionContent.style.display = "block";
            button.textContent = "Ẩn lời giải";
        } else {
            solutionContent.style.display = "none";
            button.textContent = "Hiện lời giải";
        }
    };
  
    // Check if the selected answer is correct
    document.addEventListener('change', function(event) {
        if (event.target.name.startsWith('choice') || event.target.name.startsWith('truefalse') || event.target.name.startsWith('truefalset')) {
            const choices = event.target.closest('.choices, .truefalse');
            const result = choices.nextElementSibling;
            if (event.target.value === "true") {
                result.textContent = "Bạn đã chọn đúng!";
                result.style.display = "block";
                result.style.backgroundColor = "#e0ffe0";
                result.style.borderColor = "#00aa00";
            } else {
                result.textContent = "Bạn đã chọn sai!";
                result.style.display = "block";
                result.style.backgroundColor = "#ffe0e0";
                result.style.borderColor = "#aa0000";
            }
        }
    });
  
    // Check fill-in-the-blank answers
    document.addEventListener('blur', function(event) {
        if (event.target.name.startsWith('fillblank')) {
            const answer = event.target.getAttribute('data-answer');
            const result = event.target.nextElementSibling;
            if (parseFloat(event.target.value.trim()) === parseFloat(answer)) {
                result.textContent = "Bạn đã điền đúng!";
                result.style.display = "block";
                result.style.backgroundColor = "#e0ffe0";
                result.style.borderColor = "#00aa00";
            } else {
                result.textContent = "Bạn đã điền sai!";
                result.style.display = "block";
                result.style.backgroundColor = "#ffe0e0";
                result.style.borderColor = "#aa0000";
            }
        }
    }, true);
  
    // Replace \loigiai{...}, \choice{...}{...}{...}{...}, \choiceTF{...}{...}{...}{...}, \choiceTFt{...}{...}{...}{...}, and \shortans{...}
    let content = element.innerHTML;
    content = replacenew(content)
    content = removeLatexComments(content);
    content = replaceLoigiai(content);
    content = replaceChoice(content);
    content = replaceChoiceTF(content);
    content = replaceChoiceTFt(content);
    content = replaceShortans(content);
    content = convertLatexToHTML(content);
    content = restoreMathLineBreaks(content)
    content = content.replace(/\\choice\s*{/g, ' ');
    content = content.replace(/\\loigiai\s*{/g, ' ');
    content = content.replace(/\\choice\{/g, ' ');
    content = content.replace(/\\vec/g, '\\overrightarrow');
    
    //content = content.replace(/lt;/g, '\<');
    element.innerHTML = content;
  
    // Render math
    renderMathInElement(element, {
        delimiters: [
            {left: "\\(", right: "\\)", display: false},
            {left: "\\[", right: "\\]", display: true},
        ]
    });
    // Render math with MathJax if KaTeX fails
    MathJax.typesetPromise([element]);
  }
  