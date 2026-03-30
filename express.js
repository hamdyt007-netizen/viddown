import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import YTDlpWrapModule from 'yt-dlp-wrap'
const YTDlpWrap = YTDlpWrapModule.default || YTDlpWrapModule

const ytDlp = new YTDlpWrap()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, 'frontend')))

app.post('/download', (req, res) => {
    const { url, formatId } = req.body
    if (!url || !formatId) {
        return res.status(400).json({ error: 'URL and format are required' })
    }

    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"')
    res.setHeader('Content-Type', 'video/mp4')

    const stream = ytDlp.execStream([
        url,
        '--format', formatId,
        '--geo-bypass',            // ✅ added
        '--no-check-certificate',
        '-o', '-'
    ])

    stream.on('error', (err) => {
        console.error('yt-dlp error:', err.message)
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to download. Check the URL.' })
        }
    })

    stream.pipe(res)
})

app.post('/formats', async (req, res) => {
    const url = req.body.url

    if (!url) {
        return res.status(400).json({ error: 'URL is required' })
    }
    try {
        new URL(url)
    } catch (err) {
        return res.status(400).json({ error: 'Invalid URL. Please enter a valid YouTube link.' })
    }

    try {
        const stdout = await ytDlp.execPromise([   // ✅ switched to execPromise
            url,
            '--dump-json',
            '--geo-bypass',                        // ✅ added
            '--no-check-certificate'
        ])

        const info = JSON.parse(stdout)            // ✅ manually parse the JSON
        const formats = info.formats
            .filter(f => f.ext === 'mp4' && f.resolution && f.fps)
            .map(f => ({
                format_id: f.format_id,
                ext: f.ext,
                resolution: f.format_note,
                fps: f.fps
            }))
        res.json({ formats })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch formats' })
    }
})

app.listen(process.env.PORT || 8000, () => {
    console.log("Server started")
})
