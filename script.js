let allVideos = []
const itemsPerPage = 6
let currentPage = 1

function loadPortfolioData() {
  fetch("videos.json")
    .then((response) => response.json())
    .then((data) => {
      allVideos = data.videos || []
      renderPortfolio()
    })
    .catch((error) => {
      console.log("[v0] Error loading videos:", error)
      allVideos = []
      renderPortfolio()
    })
}

function renderPortfolio() {
  const startIndex = 0
  const endIndex = itemsPerPage * currentPage
  const visibleVideos = allVideos.slice(startIndex, endIndex)

  const grid = document.getElementById("portfolioGrid")
  grid.innerHTML = ""

  if (visibleVideos.length === 0) {
    grid.innerHTML =
      '<p style="grid-column: 1/-1; text-align: center; color: #a8ff35;">No videos added yet. Check back soon!</p>'
  }

  visibleVideos.forEach((video) => {
    const card = createVideoCard(video)
    grid.appendChild(card)
  })

  const loadMoreBtn = document.getElementById("loadMoreBtn")
  if (endIndex >= allVideos.length) {
    loadMoreBtn.classList.add("hidden")
  } else {
    loadMoreBtn.classList.remove("hidden")
  }
}

function createVideoCard(video) {
  const card = document.createElement("div")
  card.className = "video-card"

  let embedContent = ""
  if (video.type === "youtube") {
    const videoId = video.link.includes("youtu.be/")
      ? video.link.split("youtu.be/")[1].split("?")[0]
      : video.link.includes("watch?v=")
        ? new URL(video.link).searchParams.get("v")
        : video.link
    embedContent = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
  } else if (video.type === "drive") {
    const fileId = video.link.includes("/d/") ? video.link.split("/d/")[1].split("/")[0] : video.link
    embedContent = `<iframe src="https://drive.google.com/file/d/${fileId}/preview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
  }

  card.innerHTML = `
        <div class="video-thumbnail">
            ${embedContent}
        </div>
        <div class="video-info">
            <h3>${video.title}</h3>
            <p>${video.description}</p>
        </div>
    `

  return card
}

function loadPortfolio() {
  const videos = JSON.parse(localStorage.getItem("portfolioVideos")) || []
  const portfolioGrid = document.getElementById("portfolioGrid")
  const noVideos = document.getElementById("noVideos")

  if (videos.length === 0) {
    noVideos.style.display = "block"
    portfolioGrid.innerHTML = ""
    return
  }

  portfolioGrid.innerHTML = ""
  noVideos.style.display = "none"

  videos.forEach((video) => {
    const item = createVideoElement(video)
    portfolioGrid.appendChild(item)
  })
}

function createVideoElement(video) {
  const item = document.createElement("div")
  item.className = "portfolio-item"
  item.setAttribute("data-type", video.type)

  let videoEmbed = ""

  if (video.type === "youtube") {
    const videoId = extractYouTubeId(video.link)
    videoEmbed = `<div class="video-container">
            <iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>
        </div>`
  } else if (video.type === "drive") {
    const fileId = extractGDriveId(video.link)
    videoEmbed = `<div class="video-container">
            <iframe src="https://drive.google.com/file/d/${fileId}/preview" allowfullscreen></iframe>
        </div>`
  }

  item.innerHTML = `
        ${videoEmbed}
        <div class="portfolio-info">
            <h3>${video.title}</h3>
            <p>${video.description || "Professional video content"}</p>
        </div>
    `

  return item
}

function extractYouTubeId(url) {
  if (url.includes("youtu.be/")) {
    return url.split("youtu.be/")[1].split("?")[0]
  }
  if (url.includes("youtube.com/watch")) {
    return new URL(url).searchParams.get("v")
  }
  return url
}

function extractGDriveId(url) {
  if (url.includes("/d/")) {
    return url.split("/d/")[1].split("/")[0]
  }
  if (url.includes("id=")) {
    return new URL(url).searchParams.get("id")
  }
  return url
}

// Filter functionality
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"))
    this.classList.add("active")

    const filter = this.getAttribute("data-filter")
    const items = document.querySelectorAll(".portfolio-item")

    items.forEach((item) => {
      if (filter === "all" || item.getAttribute("data-type") === filter) {
        item.style.display = "block"
        setTimeout(() => (item.style.opacity = "1"), 10)
      } else {
        item.style.display = "none"
      }
    })
  })
})

// Load portfolio on page load
document.addEventListener("DOMContentLoaded", () => {
  loadPortfolioData()

  const loadMoreBtn = document.getElementById("loadMoreBtn")
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      currentPage++
      renderPortfolio()
      document.getElementById("portfolio").scrollIntoView({ behavior: "smooth" })
    })
  }

  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      navMenu.style.display = navMenu.style.display === "flex" ? "none" : "flex"
    })
  }
})
