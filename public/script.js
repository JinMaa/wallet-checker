document.getElementById('address-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent form submission

    const address = document.getElementById('address').value;
    const resultsElement = document.getElementById('results');

    resultsElement.textContent = 'Loading...';

    try {
        const response = await fetch(`/utxos?address=${address}`);
        const data = await response.json();

        if (response.ok) {
            resultsElement.textContent = JSON.stringify(data, null, 2);
        } else {
            resultsElement.textContent = `Error: ${data.message}`;
        }
    } catch (error) {
        resultsElement.textContent = `Error: ${error.message}`;
    }
});
