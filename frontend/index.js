const button = document.getElementById("downloadBtn")
const videoInput = document.getElementById("videoUrl")
const statusMsg = document.getElementById("statusMsg")
const progressBar = document.getElementById("progressBar")

button.addEventListener('click', async () => {
    if (videoInput.value === "") {
        statusMsg.innerHTML = "Please enter a valid URL"
        setTimeout(() => { statusMsg.innerHTML = "" }, 3000)
        return
    }

    statusMsg.innerHTML = "Downloading..."

    const response = await fetch('/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoInput.value })
    })
    if (!response.ok) {
        const error = await response.json()
        statusMsg.innerHTML = `❌ ${error.error}`
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

    statusMsg.innerHTML = "Download Complete! ✅"
    progressBar.style.width = "100%"
})