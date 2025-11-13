let allVideos = []
const itemsPerPage = 6
let currentPage = 1

function loadPortfolioData() {
  fetch("./videos.json")
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
    return
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

// Filter functionality
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"))
    this.classList.add("active")

    const filter = this.getAttribute("data-filter")
    const items = document.querySelectorAll(".video-card")

    if (filter === "all") {
      items.forEach((item) => (item.style.display = "block"))
      currentPage = 1
      renderPortfolio()
    } else {
      currentPage = 1
      allVideos = allVideos.filter((v) => v.type === filter)
      renderPortfolio()
    }
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
