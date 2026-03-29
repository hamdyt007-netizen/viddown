const button = document.getElementById("downloadBtn")
const videoInput = document.getElementById("videoUrl")
const statusMsg = document.getElementById("statusMsg")
const progressBar = document.getElementById("progressBar")
const formatSelect = document.getElementById("formatSelect")
const formatSection = document.getElementById("formatSection")


const fetchBtn = document.getElementById("fetchBtn")

fetchBtn.addEventListener('click', async () => {
    if (videoInput.value === "") {
        statusMsg.innerHTML = "Please enter a valid URL"
        setTimeout(() => { statusMsg.innerHTML = "" }, 3000)
        return
    }

    statusMsg.innerHTML = "Fetching formats..."
    fetchBtn.disabled = true
    fetchBtn.textContent = "Loading..."
    formatSection.style.display = "none"

    try {
        const response = await fetch('/formats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: videoInput.value })
        })

        if (!response.ok) {
            let errorMsg = "Something went wrong!"
            try {
                const error = await response.json()
                errorMsg = error.error
            } catch { }
            statusMsg.innerHTML = `❌ ${errorMsg}`
            return
        }
        formatSelect.innerHTML = ""
        const data = await response.json()
        data.formats.forEach(format => {
            const option = document.createElement('option')
            option.value = format.format_id
            option.innerHTML = `${format.ext} - ${format.resolution}`
            formatSelect.appendChild(option)
        })

        formatSection.style.display = "block"
        statusMsg.innerHTML = "✅ Pick a format and download!"

    } catch (err) {
        statusMsg.innerHTML = "❌ Could not connect to server"
    } finally {
        fetchBtn.disabled = false
        fetchBtn.textContent = "Fetch →"
    }
})

button.addEventListener('click', async () => {
    const formatId = formatSelect.value
    const url = videoInput.value
    if (!url || !formatId) {
        statusMsg.innerHTML = "Please fetch formats first"
        return
    }

    statusMsg.innerHTML = "Downloading..."
    progressWrap.style.display = "block"
    downloadBtn.disabled = true

    try {
        const response = await fetch('/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, formatId })
        })

        if (!response.ok) {
            let errorMsg = "Something went wrong!"
            try {
                const error = await response.json()
                errorMsg = error.error
            } catch { }
            statusMsg.innerHTML = `❌ ${errorMsg}`
            progressWrap.style.display = "none"
            return
        }

        const blob = await response.blob()

        const downloadUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = 'video.mp4'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(downloadUrl)

        progressBar.style.width = "100%"
        statusMsg.innerHTML = "✅ Download complete!"

    } catch (err) {
        statusMsg.innerHTML = "❌ Download failed. Try again."
        progressWrap.style.display = "none"
    } finally {
        downloadBtn.disabled = false
    }
})
