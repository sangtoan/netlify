$(document).ready(function () {
    $('#uploadForm').on('submit', function (e) {
        e.preventDefault();
        let fileInput = document.getElementById('uploadFile');
        let file = fileInput ? fileInput.files[0] : null;
        let school = $('#school').val();
        let teacher = $('#teacher').val();
        let exam = $('#exam').val();
        let subject = $('#subject').val();
        let time = $('#time').val();
        let made = $('#made').val().split(',').map(item => item.trim());
        let numFiles = document.getElementById('numFiles') ? document.getElementById('numFiles').value : null;
        let hoanViType = document.getElementById('hoanViType') ? document.getElementById('hoanViType').value : 'ngoac';
        let headerType = document.getElementById('headerType') ? document.getElementById('headerType').value : 'default';

        if (file) {
            let reader = new FileReader();
            reader.onload = function (event) {
                let content = event.target.result;
                parseFile(content, school, teacher, exam, subject, time, made, numFiles, hoanViType, headerType);
            };
            reader.readAsText(file);
        }
    });

    $('#permuteButton').on('click', function () {
        let content = collectContentFromTable();
        let numFiles = document.getElementById('numFiles') ? document.getElementById('numFiles').value : null;
        let hoanViType = document.getElementById('hoanViType') ? document.getElementById('hoanViType').value : 'ngoac';
        let headerType = document.getElementById('headerType') ? document.getElementById('headerType').value : 'default';

        let school = $('#school').val();
        let teacher = $('#teacher').val();
        let exam = $('#exam').val();
        let subject = $('#subject').val();
        let time = $('#time').val();
        let made = $('#made').val().split(',').map(item => item.trim());

        if (content && numFiles) {
            let results = generateFiles(content, numFiles, hoanViType, headerType, school, teacher, exam, subject, time, made);
            displayResults(results);
            alert('Hoán vị xong!');
        }
    });

    $('#pasteForm').on('submit', function (e) {
        e.preventDefault();
        let content = $('#pasteContent').val();
        let numFiles = document.getElementById('numPasteFiles') ? document.getElementById('numPasteFiles').value : null;
        let hoanViType = document.getElementById('hoanViTypePaste') ? document.getElementById('hoanViTypePaste').value : 'ngoac';
        let headerType = document.getElementById('headerTypePaste') ? document.getElementById('headerTypePaste').value : 'default';

        let school = $('#school').val();
        let teacher = $('#teacher').val();
        let exam = $('#exam').val();
        let subject = $('#subject').val();
        let time = $('#time').val();
        let made = $('#made').val().split(',').map(item => item.trim());

        if (content && numFiles) {
            let results = generateFiles(content, numFiles, hoanViType, headerType, school, teacher, exam, subject, time, made);
            displayResults(results);
            alert('Hoán vị xong!');
        }
    });

    function parseFile(content, school, teacher, exam, subject, time, made, numFiles, hoanViType, headerType) {
        let sentences = content.match(/\\begin{ex}[\s\S]+?\\end{ex}/g);
        let tableBody = $('#latexTable tbody');
        tableBody.empty();

        sentences.forEach((sentence, index) => {
            let idPattern = /([6-9|0-2])([A-Z])([0-9])([YBKGTNHVC])([0-9])-([0-9])/g;
            let ids = Array.from(sentence.matchAll(idPattern)).map(match => match[0]).join(', ');
            let id_meaning = "ID Ý NGHĨA";  // Thay đổi tùy theo ý nghĩa của ID

            let row = $('<tr></tr>');
            row.append(`<td>${index + 1}</td>`);
            row.append(`<td>${ids}</td>`);
            row.append(`<td>${id_meaning}</td>`);

            let textArea = $('<textarea class="form-control"></textarea>');
            textArea.val(sentence);
            let cell = $('<td></td>');
            cell.append(textArea);
            row.append(cell);

            let checkbox = $('<input type="checkbox">');
            let checkboxCell = $('<td></td>');
            checkboxCell.append(checkbox);
            row.append(checkboxCell);

            // Apply colors based on group
            if (sentence.includes('choice') && !sentence.includes('choiceTF')) {
                row.css('background-color', '#FFEB3B'); // Yellow for choice
            } else if (sentence.includes('choiceTF')) {
                row.css('background-color', '#8BC34A'); // Green for choiceTF
            } else {
                row.css('background-color', '#03A9F4'); // Blue for others
            }

            tableBody.append(row);
        });

        $('#resultSection').show();
    }

    function collectContentFromTable() {
        let tableBody = $('#latexTable tbody');
        let content = '';

        tableBody.find('tr').each(function () {
            let textArea = $(this).find('textarea');
            let sentence = textArea.val();
            content += sentence + '\n';
        });

        return content;
    }

    function displayResults(results) {
        $('#results').empty();
        results.forEach(function(result, index) {
            let resultHtml = `
                <h3>File ${index + 1}</h3>
                <textarea class="form-control mb-3" rows="10" readonly>${result.content}</textarea>
                <a href="${result.download_url}" class="btn btn-success mb-3" download="hoanvi_${index + 1}.tex">Tải về file đã hoán vị</a>
                <button class="btn btn-primary mb-3" onclick="copyToClipboard(\`${result.content.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r')}\`)">Copy nội dung</button>
            `;
            $('#results').append(resultHtml);
        });
        $('#resultSection').show();
    }

    function copyToClipboard(text) {
        let tempTextarea = document.createElement('textarea');
        tempTextarea.value = text;
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextarea);
        alert('Đã copy nội dung vào clipboard!');
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

    function hoanViCacNgoacLon(noiDung) {
        let cacVitriNgoacLon = layCacNgoacLon(noiDung).slice(0, 4);

        if (cacVitriNgoacLon.length === 4) {
            let cacNgoacLonGoc = cacVitriNgoacLon.map(([dau, cuoi]) => noiDung.slice(dau, cuoi + 1));
            let cacNgoacLonHoanVi = [...cacNgoacLonGoc];

            // Phương pháp hoán vị mạnh hơn
            for (let i = cacNgoacLonHoanVi.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [cacNgoacLonHoanVi[i], cacNgoacLonHoanVi[j]] = [cacNgoacLonHoanVi[j], cacNgoacLonHoanVi[i]];
            }

            cacNgoacLonGoc.forEach((goc, index) => {
                noiDung = noiDung.replace(goc, cacNgoacLonHoanVi[index]);
            });
        }

        return noiDung;
    }

    function hoanViNgoacLonNgauNhien(text) {
        let sentences = text.match(/\\begin{ex}[\s\S]+?\\end{ex}/g);

        let groupChoice = [];
        let groupchoiceTF = [];
        let groupNone = [];

        sentences.forEach(sentence => {
            if (sentence.includes('choice') && !sentence.includes('choiceTF')) {
                groupChoice.push(sentence);
            } else if (sentence.includes('choiceTF')) {
                groupchoiceTF.push(sentence);
            } else {
                groupNone.push(sentence);
            }
        });

        function processGroup(group) {
            return group.map(sentence => {
                let indexChoice = sentence.search(/\\choice|\\choiceTF|\\choiceTFt|\\choiceTF\[t\]|\\choiceTF\[n\]/);
                if (indexChoice !== -1) {
                    let noiDungTruocChoice = sentence.slice(0, indexChoice);
                    let noiDungSauChoice = sentence.slice(indexChoice);
                    noiDungSauChoice = hoanViCacNgoacLon(noiDungSauChoice);

                    return noiDungTruocChoice + noiDungSauChoice;
                }
                return sentence;
            });
        }

        groupChoice = processGroup(groupChoice);
        groupchoiceTF = processGroup(groupchoiceTF);
        groupNone = groupNone.map(sentence => sentence); // giữ nguyên

        return {
            groupChoice: groupChoice.join('\n'),
            groupchoiceTF: groupchoiceTF.join('\n'),
            groupNone: groupNone.join('\n'),
            countChoice: groupChoice.length,
            countchoiceTF: groupchoiceTF.length,
            countNone: groupNone.length
        };
    }

    function hoanViCauTruc(text) {
        let sentences = text.match(/\\begin{ex}[\s\S]+?\\end{ex}/g);

        sentences.sort(() => Math.random() - 0.5);

        let groupChoice = [];
        let groupchoiceTF = [];
        let groupNone = [];

        sentences.forEach(sentence => {
            if (sentence.includes('choice') && !sentence.includes('choiceTF')) {
                groupChoice.push(sentence);
            } else if (sentence.includes('choiceTF')) {
                groupchoiceTF.push(sentence);
            } else {
                groupNone.push(sentence);
            }
        });

        function processGroup(group) {
            return group.map(sentence => {
                let indexChoice = sentence.search(/\\choice|\\motcot|\\haicot|\\choice\[2\]|\\choiceTF|\\choiceTFt|\\choiceTF\[t\]|\\choiceTF\[n\]/);
                if (indexChoice !== -1) {
                    let noiDungTruocChoice = sentence.slice(0, indexChoice);
                    let noiDungSauChoice = sentence.slice(indexChoice);
                    noiDungSauChoice = hoanViCacNgoacLon(noiDungSauChoice);

                    return noiDungTruocChoice + noiDungSauChoice;
                }
                return sentence;
            });
        }

        groupChoice = processGroup(groupChoice);
        groupchoiceTF = processGroup(groupchoiceTF);
        groupNone = processGroup(groupNone);

        return {
            groupChoice: groupChoice.join('\n'),
            groupchoiceTF: groupchoiceTF.join('\n'),
            groupNone: groupNone.join('\n'),
            countChoice: groupChoice.length,
            countchoiceTF: groupchoiceTF.length,
            countNone: groupNone.length
        };
    }

    function getHeaderContent(type, school, teacher, exam, subject, time) {
        const headers = {
            default: `
\\documentclass[12pt,a4paper]{article}
\\usepackage{amsmath,amssymb,makecell,fancyhdr,enumerate,arcs,physics,tasks,mathrsfs,graphics}
\\usepackage{tikz,tikz-3dplot,tkz-euclide,tkz-tab,tkz-linknodes,tabvar,pgfplots,esvect}
\\usepackage[top=1.5cm, bottom=1.5cm, left=2cm, right=1.5cm]{geometry}
\\usepackage[hidelinks,unicode]{hyperref}
\\usepackage[utf8]{vietnam}
\\usepackage[dethi]{ex_test}
\\usetikzlibrary{shapes.geometric,shadings,calc,snakes,patterns,arrows,intersections,angles,backgrounds,quotes}
\\usepgfplotslibrary{fillbetween}
\\pgfplotsset{compat=newest}
\\tikzset{point style/.append style={color=white}}
\\def\\vec{\\overrightarrow}
\\newcommand{\\hoac}[1]{\\left[\\begin{aligned}#1\\end{aligned}\\right.}
\\newcommand{\\heva}[1]{\\left\\{\\begin{aligned}#1\\end{aligned}\\right.}
\\newcommand{\\hetde}{\\centerline{\\rule[0.5ex]{2cm}{1pt} HẾT \\rule[0.5ex]{2cm}{1pt}}}
\\newcommand{\\tentruong}{${school}}
\\newcommand{\\tengv}{${teacher}}
\\newcommand{\\tenkythi}{${exam}}
\\newcommand{\\tenmonthi}{${subject}}
\\newcommand{\\thoigian}{${time}}
\\newcommand{\\tieude}[3]{
	\\noindent
	%Trái
	\\begin{minipage}[b]{7cm}
		\\centerline{\\textbf{\\fontsize{13}{0}\\selectfont \\tentruong}}
		\\centerline{\\textbf{\\fontsize{13}{0}\\selectfont \\tengv}}
		\\centerline{(\\textit{Đề thi có #1\\ trang})}
		\\centerline{\\textit{ }}
	\\end{minipage}\\hspace{1.5cm}
	%Phải
	\\begin{minipage}[b]{9cm}
		\\centerline{\\textbf{\\fontsize{13}{0}\\selectfont \\tenkythi}}
		\\centerline{\\textbf{\\fontsize{13}{0}\\selectfont \\tenmonthi}}
		\\centerline{\\textit{\\fontsize{12}{0}\\selectfont Thời gian làm bài \\thoigian \\ phút }}
		\\centerline{\\textit{\\fontsize{12}{0}\\selectfont (Đề có 11 câu trắc nghiệm,11 câu đúng sai,11 câu điền đáp án)}}
	\\end{minipage}
	\\begin{minipage}[b]{13cm}
		\\vspace*{.75cm}
		\\textbf{Họ và tên thí sinh: }{\\tiny\\dotfill}\\\\
		\\textbf{Số Báo Danh: }{\\tiny\\dotfill}
	\\end{minipage}
	\\begin{minipage}[b]{8cm}
		\\hspace*{1cm}\\fbox{\\bf Mã đề thi #3}
	\\end{minipage}
}
\\newcommand{\\chantrang}[2]{\\rfoot{Trang \\thepage/#1 $-$ Mã đề #2}}
\\pagestyle{fancy}
`,
            option1: `
\\documentclass[12pt,a4paper,twoside]{article}
\\usepackage{amsmath,amssymb,makecell,fancyhdr,enumerate,arcs,physics,tasks,mathrsfs,graphics}
\\usepackage{tikz,tikz-3dplot,tkz-euclide,tkz-tab,tkz-linknodes,tabvar,pgfplots,esvect}
\\usepackage[top=2cm, bottom=2cm, left=2cm, right=2cm]{geometry}
\\usepackage[hidelinks,unicode]{hyperref}
\\usepackage[utf8]{vietnam}
\\usepackage[dethi]{ex_test}
\\usetikzlibrary{shapes.geometric,shadings,calc,snakes,patterns,arrows,intersections,angles,backgrounds,quotes}
\\usepgfplotslibrary{fillbetween}
\\pgfplotsset{compat=newest}
\\tikzset{point style/.append style={color=white}}
\\def\\vec{\\overrightarrow}
\\newcommand{\\hoac}[1]{\\left[\\begin{aligned}#1\\end{aligned}\\right.}
\\newcommand{\\heva}[1]{\\left\\{\\begin{aligned}#1\\end{aligned}\\right.}
\\newcommand{\\hetde}{\\centerline{\\rule[0.5ex]{2cm}{1pt} HẾT \\rule[0.5ex]{2cm}{1pt}}}
\\newcommand{\\tentruong}{${school}}
\\newcommand{\\tengv}{${teacher}}
\\newcommand{\\tenkythi}{${exam}}
\\newcommand{\\tenmonthi}{${subject}}
\\newcommand{\\thoigian}{${time}}
\\newcommand{\\tieude}[2]{
\\noindent
%Trái
\\begin{minipage}[b]{7cm}
\\centerline{\\textbf{\\fontsize{13}{0}\\selectfont \\tentruong}}
\\centerline{\\textbf{\\fontsize{13}{0}\\selectfont \\tengv}}
\\centerline{(\\textit{ĐỀ CHÍNH THỨC})}
\\end{minipage}\\hspace={1.5cm}
%Phải
\\begin{minipage}[b]{9cm}
\\centerline{\\textbf{\\fontsize{13}{0}\\selectfont \\tenkythi}}
\\centerline{\\textbf{\\fontsize{13}{0}\\selectfont \\tenmonthi}}
\\centerline{\\textit{\\fontsize{12}{0}\\selectfont Thời gian làm bài \\thoigian \\ phút (#1 câu trắc nghiệm)}}
\\end{minipage}
\\begin{minipage}[b]{10cm}
\\textbf{Họ và tên thí sinh: }{\\tiny\\dotfill}
\\end{minipage}
\\begin{minipage}[b]{8cm}
\\hspace*={4cm}\\fbox{\\bf Mã đề thi #2}
\\end{minipage}\\vspace={3pt}
}
\\newcommand{\\chantrang}[2]{\\rfoot{Trang \\thepage/#1 $-$ Mã đề #2}}
\\pagestyle{fancy}
`,
            option2: `
\\documentclass[12pt,a4paper,twoside]{article}
\\usepackage{amsmath,amssymb,makecell,fancyhdr,enumerate,arcs,physics,tasks,mathrsfs,graphics}
\\usepackage{tikz,tikz-3dplot,tkz-euclide,tkz-tab,tkz-linknodes,tabvar,pgfplots,esvect}
\\usepackage[top=1.5cm, bottom=1.5cm, left=1.5cm, right=1.5cm]{geometry}
\\usepackage[hidelinks,unicode]{hyperref}
\\usepackage[utf8]{vietnam}
\\usepackage[dethi]{ex_test}
\\usetikzlibrary{shapes.geometric,shadings,calc,snakes,patterns,arrows,intersections,angles,backgrounds,quotes}
\\usepgfplotslibrary{fillbetween}
\\pgfplotsset{compat=newest}
\\tikzset{point style/.append style={color=white}}
\\def\\vec{\\overrightarrow}
\\newcommand{\\hoac}[1]{\\left[\\begin{aligned}#1\\end{aligned}\\right.}
\\newcommand{\\heva}[1]{\\left\\{\\begin{aligned}#1\\end{aligned}\\right.}
\\newcommand{\\hetde}{\\centerline{\\rule[0.5ex]{2cm}{1pt} HẾT \\rule[0.5ex]{2cm}{1pt}}}
\\newcommand{\\tentruong}{${school}}
\\newcommand{\\tengv}{${teacher}}
\\newcommand{\\tenkythi}{${exam}}
\\newcommand{\\tenmonthi}{${subject}}
\\newcommand{\\thoigian}{${time}}
\\newcommand{\\tieude}[2]{
\\noindent
%Trái
\\begin{minipage}[b]{7cm}
\\centerline{\\textbf{\\fontsize{13}{0}\\selectfont \\tentruong}}
\\centerline{\\textbf{\\fontsize{13}{0}\\selectfont \\tengv}}
\\centerline{(\\textit{ĐỀ CHÍNH THỨC})}
\\end{minipage}\\hspace={1.5cm}
%Phải
\\begin{minipage}[b]{9cm}
\\centerline{\\textbf{\\fontsize{13}{0}\\selectfont \\tenkythi}}
\\centerline{\\textbf{\\fontsize{13}{0}\\selectfont \\tenmonthi}}
\\centerline{\\textit{\\fontsize{12}{0}\\selectfont Thời gian làm bài \\thoigian \\ phút (#1 câu trắc nghiệm)}}
\\end{minipage}
\\begin{minipage}[b]{10cm}
\\textbf{Họ và tên thí sinh: }{\\tiny\\dotfill}
\\end{minipage}
\\begin{minipage}[b]{8cm}
\\hspace*={4cm}\\fbox{\\bf Mã đề thi #2}
\\end{minipage}\\vspace={3pt}
}
\\newcommand{\\chantrang}[2]{\\rfoot{Trang \\thepage/#1 $-$ Mã đề #2}}
\\pagestyle{fancy}
`
        };

        return headers[type] || headers['default'];
    }

    function generateFiles(content, numFiles, hoanViType, headerType, school, teacher, exam, subject, time, made) {
        let results = [];
        let headerContent = getHeaderContent(headerType, school, teacher, exam, subject, time);

        for (let i = 0; i < numFiles; i++) {
            let resultContent;
            let hoanViKetQua;
            let currentMade = made[i % made.length];

            if (hoanViType === 'ngoac') {
                hoanViKetQua = hoanViNgoacLonNgauNhien(content);
            } else if (hoanViType === 'cau_truc') {
                hoanViKetQua = hoanViCauTruc(content);
            } else if (hoanViType === 'giu_nguyen') {
                hoanViKetQua = {
                    groupChoice: content,
                    groupchoiceTF: '',
                    groupNone: '',
                    countChoice: 0,
                    countchoiceTF: 0,
                    countNone: 0
                };
            }

            resultContent = `
${headerContent}
\\newcommand{\\made}{${currentMade}}
\\begin{document}
\\tieude{\\pageref{${currentMade}}}{0}{${currentMade}}
\\chantrang{\\pageref{${currentMade}}}{${currentMade}}
\\subsection*{PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn. Thí sinh trả lời từ câu 1 đến câu ${hoanViKetQua.countChoice}. Mỗi câu hỏi thí sinh chỉ chọn một phương án.}
\\setcounter{ex}{0}
\\Opensolutionfile{ans}[ans/ans-phanI]
${hoanViKetQua.groupChoice}
\\Closesolutionfile{ans}

\\subsection*{PHẦN II. Câu trắc nghiệm đúng sai. Thí sinh trả lời từ câu 1 đến câu ${hoanViKetQua.countchoiceTF}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.}
\\setcounter{ex}{0}
\\Opensolutionfile{ans}[ans/ans-phanII]
${hoanViKetQua.groupchoiceTF}
\\Closesolutionfile{ans}

\\subsection*{PHẦN III. Câu trắc nghiệm trả lời ngắn. Thí sinh trả lời từ câu 1 đến câu ${hoanViKetQua.countNone}.}
\\setcounter{ex}{0}
\\Opensolutionfile{ans}[ans/ans-phanIII]
${hoanViKetQua.groupNone}
\\Closesolutionfile{ans}
\\hetde\\label{${currentMade}}
\\newpage
\\begin{center}
\\textbf{\\large BẢNG ĐÁP ÁN}
\\end{center}
\\noindent\\textbf{A. ĐÁP ÁN PHẦN I}
\\inputansbox{10}{ans/ans-phanI}
\\noindent\\textbf{B. ĐÁP ÁN PHẦN II}
\\inputansbox[2]{2}{ans/ans-phanII}
\\noindent\\textbf{C. ĐÁP ÁN PHẦN III}
\\inputansbox[3]{6}{ans/ans-phanIII}
\\end{document}
`;

            results.push({
                content: resultContent,
                download_url: `data:text/plain;charset=utf-8,${encodeURIComponent(resultContent)}`
            });
        }

        return results;
    }
});
