document.getElementById('recognize').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select an image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        const dataUrl = event.target.result;
        const response = await fetch('https://stex-aeeae.firebaseapp.com/api/recognize', {
            method: 'POST',
            body: JSON.stringify({ image: dataUrl }),
            headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        document.getElementById('output').textContent = result.latex;
    };
    reader.readAsDataURL(file);
});
