document.addEventListener('DOMContentLoaded', function () {
    const treeContainer = document.getElementById('tree-container');

    const choiceContainer = document.createElement('div');
    choiceContainer.id = 'choice-container';
    const choiceTFContainer = document.createElement('div');
    choiceTFContainer.id = 'choiceTF-container';
    const othersContainer = document.createElement('div');
    othersContainer.id = 'others-container';

    treeContainer.appendChild(choiceContainer);
    treeContainer.appendChild(choiceTFContainer);
    treeContainer.appendChild(othersContainer);

    const resultContainer = document.getElementById('result-container');

    console.log('Loading tex_files.json...');
    fetch('tex_files.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(files => {
            console.log('Files:', files);
            const fetchedFiles = [];

            let filePromises = files.map(file => 
                fetchFileContent(file).then(content => {
                    console.log('Fetched content for:', file);
                    fetchedFiles.push({ path: file, content: content });
                }).catch(error => {
                    console.error('Error fetching file:', file, error);
                })
            );

            Promise.all(filePromises).then(() => {
                const { choiceTree, choiceTFTree, othersTree } = buildTrees(fetchedFiles);
                console.log('Choice tree:', choiceTree);  
                console.log('ChoiceTF tree:', choiceTFTree);
                console.log('Others tree:', othersTree);

                buildTreeView(choiceContainer, choiceTree, 'Trắc Nghiệm');
                buildTreeView(choiceTFContainer, choiceTFTree, 'Câu True/False');
                buildTreeView(othersContainer, othersTree, 'Câu Tự Luận');
            });
        }).catch(error => {
            console.error('Error loading file list:', error);
        });

    function buildTrees(files) {
        const choiceTree = {};
        const choiceTFTree = {};
        const othersTree = {};

        files.forEach(file => {
            const exPattern = /\\begin{ex}.*?\\end{ex}/gs;
            const idPattern = /\[(\d[A-Z]\d[YBKGTNHVC]\d-\d)\]/;
            let match;
            while ((match = exPattern.exec(file.content)) !== null) {
                const element = match[0];
                const idMatch = idPattern.exec(element);
                if (idMatch) {
                    const id = idMatch[0].replace(/[\[\]-]/g, ''); // Loại bỏ dấu gạch nối và dấu ngoặc để hiển thị gọn
                    const parts = id.split('');
                    let currentTree;

                    if (element.includes('choice')) {
                        currentTree = choiceTree;
                    } else if (element.includes('choicTF')) {
                        currentTree = choiceTFTree;
                    } else {
                        currentTree = othersTree;
                    }

                    let current = currentTree;
                    parts.forEach((part, index) => {
                        if (!current[part]) {
                            current[part] = { _files: [] };
                        }
                        if (index === parts.length - 1) {
                            current[part]._files.push({ path: file.path, id: id, content: element });
                        }
                        current = current[part];
                    });
                }
            }
        });

        return { choiceTree, choiceTFTree, othersTree };
    }

    function buildTreeView(container, data, title) {
        const titleEl = document.createElement('h2');
        titleEl.textContent = title;
        container.appendChild(titleEl);

        const ul = document.createElement('ul');
        container.appendChild(ul);

        buildTreeBranch(ul, data);
    }

    function buildTreeBranch(container, data) {
        for (const key in data) {
            if (key === '_files') {
                data[key].forEach(file => {
                    const fileLi = document.createElement('li');
                    fileLi.className = 'file';
                    fileLi.textContent = file.id; // Hiển thị ID không có dấu gạch nối
                    fileLi.addEventListener('click', (event) => {
                        event.stopPropagation(); // Ngăn sự kiện click lan lên phần tử cha
                        displayFileContent(file);
                    });
                    container.appendChild(fileLi);
                });
            } else {
                const dirLi = document.createElement('li');
                dirLi.textContent = key;
                dirLi.classList.add('directory');
                dirLi.addEventListener('click', function (event) {
                    event.stopPropagation();
                    this.classList.toggle('expanded');
                    const childUl = this.querySelector('ul');
                    if (childUl) {
                        childUl.classList.toggle('hidden');
                    }
                });

                const childUl = document.createElement('ul');
                childUl.classList.add('hidden');
                buildTreeBranch(childUl, data[key]);
                dirLi.appendChild(childUl);
                container.appendChild(dirLi);
            }
        }
    }

    function displayFileContent(file) {
        const fileContentDiv = document.createElement('div');
        fileContentDiv.className = 'file-content';
        fileContentDiv.innerHTML = `
            <h2>${file.id}</h2>
            <pre>${file.content}</pre>
            <button class="copy-btn">Copy</button>
            <button class="close-btn">X</button>
        `;
        fileContentDiv.querySelector('.copy-btn').addEventListener('click', () => {
            copyToClipboard(file.content);
        });
        fileContentDiv.querySelector('.close-btn').addEventListener('click', () => {
            resultContainer.removeChild(fileContentDiv);
        });
        resultContainer.appendChild(fileContentDiv);
    }

    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Copied to clipboard');
    }

    function fetchFileContent(path) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open('GET', path, true);
            request.onload = function () {
                if (request.status >= 200 && request.status < 400) {
                    resolve(request.responseText);
                } else {
                    reject(new Error(`Failed to load file: ${path}`));
                }
            };
            request.onerror = function () {
                reject(new Error(`Failed to load file: ${path}`));
            };
            request.send();
        });
    }

    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download All';
    downloadButton.addEventListener('click', downloadAllFiles);
    document.body.appendChild(downloadButton);

    function downloadAllFiles() {
        let allContent = '';
        const fileContents = document.querySelectorAll('.file-content pre');
        fileContents.forEach(pre => {
            allContent += pre.textContent + '\n\n';
        });

        const blob = new Blob([allContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'all_questions.tex';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});