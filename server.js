const express = require("express")
const fs = require("fs")
const path = require("path")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 3000
const ADMIN_PASSWORD = "admin123" // Change this to your desired password

app.use(cors())
app.use(express.json())
app.use(express.static("./"))

const videosFile = path.join(__dirname, "videos.json")

// Ensure videos.json exists
function ensureVideosFile() {
  if (!fs.existsSync(videosFile)) {
    fs.writeFileSync(videosFile, JSON.stringify({ videos: [] }, null, 2))
  }
}

ensureVideosFile()

// Get all videos
app.get("/api/videos", (req, res) => {
  try {
    const data = fs.readFileSync(videosFile, "utf8")
    res.json(JSON.parse(data))
  } catch (error) {
    res.json({ videos: [] })
  }
})

app.post("/api/videos", (req, res) => {
  const { title, type, link, description, password } = req.body

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  if (!title || !type || !link) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  try {
    const data = JSON.parse(fs.readFileSync(videosFile, "utf8"))
    const newVideo = {
      id: Date.now(),
      title,
      type,
      link,
      description,
    }

    data.videos.push(newVideo)
    fs.writeFileSync(videosFile, JSON.stringify(data, null, 2))
    res.json({ success: true, video: newVideo })
  } catch (error) {
    res.status(500).json({ error: "Failed to add video" })
  }
})

app.delete("/api/videos/:id", (req, res) => {
  const { password } = req.body

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  try {
    const data = JSON.parse(fs.readFileSync(videosFile, "utf8"))
    data.videos = data.videos.filter((v) => v.id !== Number.parseInt(req.params.id))
    fs.writeFileSync(videosFile, JSON.stringify(data, null, 2))
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete video" })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Admin panel: http://localhost:${PORT}/admin.html`)
})
