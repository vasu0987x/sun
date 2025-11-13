const ADMIN_PASSWORD = "admin123"

function authenticateAdmin() {
  const passwordInput = document.getElementById("passwordInput").value
  const errorMsg = document.getElementById("errorMsg")

  if (passwordInput === ADMIN_PASSWORD) {
    document.getElementById("loginSection").classList.add("hidden")
    document.getElementById("dashboardSection").classList.remove("hidden")
    errorMsg.classList.add("hidden")
    loadVideosInAdmin()
  } else {
    errorMsg.textContent = "Incorrect password"
    errorMsg.classList.remove("hidden")
    document.getElementById("passwordInput").value = ""
  }
}

function logoutAdmin() {
  document.getElementById("dashboardSection").classList.add("hidden")
  document.getElementById("loginSection").classList.remove("hidden")
  document.getElementById("passwordInput").value = ""
  document.getElementById("errorMsg").classList.add("hidden")
}

document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("passwordInput")
  if (passwordInput) {
    passwordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        authenticateAdmin()
      }
    })
  }

  const videoType = document.getElementById("videoType")
  const linkLabel = document.getElementById("linkLabel")
  const helpText = document.getElementById("helpText")

  if (videoType) {
    videoType.addEventListener("change", function () {
      if (this.value === "youtube") {
        linkLabel.textContent = "YouTube Link / Video ID"
        helpText.textContent = "Paste full YouTube URL or just the video ID (e.g., dQw4w9WgXcQ)"
      } else if (this.value === "drive") {
        linkLabel.textContent = "Google Drive Link"
        helpText.textContent = "Paste the shareable link from Google Drive"
      }
    })
  }
})

function loadVideosInAdmin() {
  fetch("/api/videos")
    .then((response) => response.json())
    .then((data) => {
      const videos = data.videos || []
      const videosList = document.getElementById("videosList")
      const noVideosMsg = document.getElementById("noVideosMsg")

      if (videos.length === 0) {
        videosList.innerHTML = ""
        noVideosMsg.style.display = "block"
        return
      }

      noVideosMsg.style.display = "none"
      videosList.innerHTML = ""

      videos.forEach((video) => {
        const item = document.createElement("div")
        item.className = "video-item"
        item.innerHTML = `
            <div class="video-item-info">
                <h3>${video.title}</h3>
                <p><strong>Type:</strong> ${video.type === "youtube" ? "YouTube" : "Google Drive"}</p>
                <p>${video.description || "No description"}</p>
            </div>
            <button class="delete-btn" onclick="deleteVideo(${video.id})">Delete</button>
        `
        videosList.appendChild(item)
      })
    })
    .catch((error) => console.log("[v0] Error loading videos:", error))
}

function addVideo(event) {
  event.preventDefault()

  const title = document.getElementById("videoTitle").value
  const type = document.getElementById("videoType").value
  const link = document.getElementById("videoLink").value
  const description = document.getElementById("videoDescription").value

  if (!title || !type || !link) {
    alert("Please fill in all required fields")
    return
  }

  fetch("/api/videos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      type,
      link,
      description,
      password: ADMIN_PASSWORD,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert("Failed to add video: " + data.error)
        return
      }
      alert("Video added successfully! It's now visible to everyone.")
      document.getElementById("addVideoForm").reset()
      loadVideosInAdmin()
    })
    .catch((error) => {
      console.log("[v0] Error:", error)
      alert("Error adding video. Make sure server is running on http://localhost:3000")
    })
}

function deleteVideo(id) {
  if (confirm("Are you sure you want to delete this video?")) {
    fetch(`/api/videos/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: ADMIN_PASSWORD,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert("Failed to delete video: " + data.error)
          return
        }
        alert("Video deleted successfully!")
        loadVideosInAdmin()
      })
      .catch((error) => {
        console.log("[v0] Error:", error)
        alert("Error deleting video")
      })
  }
}
