const ADMIN_PASSWORD = "admin123"
const GITHUB_CONFIG = {
  owner: "vasu0987x",
  repo: "sun",
  branch: "main",
}

function saveGitHubToken() {
  const token = document.getElementById("githubToken").value.trim()
  if (!token) {
    alert("Please enter your GitHub token")
    return
  }
  localStorage.setItem("githubToken", token)
  alert("Token saved! You can now add videos.")
  document.getElementById("tokenSetupBox").style.display = "none"
  loadVideosInAdmin()
}

function getGitHubToken() {
  return localStorage.getItem("githubToken")
}

function authenticateAdmin() {
  const passwordInput = document.getElementById("passwordInput").value
  const errorMsg = document.getElementById("errorMsg")
  const token = getGitHubToken()

  if (passwordInput === ADMIN_PASSWORD) {
    if (!token) {
      document.getElementById("tokenSetupBox").style.display = "block"
      errorMsg.textContent = "Please set up your GitHub token first"
      errorMsg.classList.remove("hidden")
      return
    }

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
  const token = getGitHubToken()
  if (!token) return

  fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/videos.json`, {
    headers: {
      Authorization: `token ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message && data.message.includes("404")) {
        const videosList = document.getElementById("videosList")
        const noVideosMsg = document.getElementById("noVideosMsg")
        videosList.innerHTML = ""
        noVideosMsg.style.display = "block"
        return
      }

      const content = atob(data.content)
      const videos = JSON.parse(content).videos || []
      const videosList = document.getElementById("videosList")
      const noVideosMsg = document.getElementById("noVideosMsg")

      if (videos.length === 0) {
        videosList.innerHTML = ""
        noVideosMsg.style.display = "block"
        return
      }

      noVideosMsg.style.display = "none"
      videosList.innerHTML = ""

      videos.forEach((video, index) => {
        const item = document.createElement("div")
        item.className = "video-item"
        item.innerHTML = `
            <div class="video-item-info">
                <h3>${video.title}</h3>
                <p><strong>Type:</strong> ${video.type === "youtube" ? "YouTube" : "Google Drive"}</p>
                <p>${video.description || "No description"}</p>
            </div>
            <button class="delete-btn" onclick="deleteVideo(${index})">Delete</button>
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
  const token = getGitHubToken()

  if (!token) {
    alert("GitHub token not configured. Please login again.")
    return
  }

  if (!title || !type || !link) {
    alert("Please fill in all required fields")
    return
  }

  fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/videos.json`, {
    headers: {
      Authorization: `token ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      let videos = []
      let sha = null

      if (data.content) {
        const content = atob(data.content)
        videos = JSON.parse(content).videos || []
        sha = data.sha
      }

      videos.push({
        id: Date.now(),
        title,
        type,
        link,
        description,
      })

      const newContent = JSON.stringify({ videos }, null, 2)
      const encodedContent = btoa(newContent)

      return fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/videos.json`, {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Add video: ${title}`,
          content: encodedContent,
          sha: sha,
          branch: GITHUB_CONFIG.branch,
        }),
      })
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.message && data.message.includes("error")) {
        alert("Failed to add video: " + data.message)
        return
      }
      alert("Video added successfully! It's now visible to everyone on your portfolio.")
      document.getElementById("addVideoForm").reset()
      setTimeout(() => loadVideosInAdmin(), 1000)
    })
    .catch((error) => {
      console.log("[v0] Error:", error)
      alert("Error adding video. Make sure your GitHub token is valid.")
    })
}

function deleteVideo(index) {
  if (confirm("Are you sure you want to delete this video?")) {
    const token = getGitHubToken()
    if (!token) {
      alert("GitHub token not configured")
      return
    }

    fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/videos.json`, {
      headers: {
        Authorization: `token ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const content = atob(data.content)
        const videos = JSON.parse(content).videos || []
        videos.splice(index, 1)

        const newContent = JSON.stringify({ videos }, null, 2)
        const encodedContent = btoa(newContent)

        return fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/videos.json`, {
          method: "PUT",
          headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Delete video at index ${index}`,
            content: encodedContent,
            sha: data.sha,
            branch: GITHUB_CONFIG.branch,
          }),
        })
      })
      .then((response) => response.json())
      .then((data) => {
        alert("Video deleted successfully!")
        setTimeout(() => loadVideosInAdmin(), 1000)
      })
      .catch((error) => {
        console.log("[v0] Error:", error)
        alert("Error deleting video")
      })
  }
}
