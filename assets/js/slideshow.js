class Slideshow {
  constructor(container, slides, defaultInterval = 4000) {
    // Accept either element or string ID
    this.container = typeof container === "string" ? document.getElementById(container) : container;
    if (!this.container) {
      console.error("Slideshow container not found:", container);
      return;
    }

    this.slides = slides;
    this.index = 0;
    this.defaultInterval = defaultInterval;
    this.timeoutId = null;

    this.showSlide();
  }

  showSlide() {
    // Clear previous content
    this.container.innerHTML = "";
    let slide = this.slides[this.index];

    if (slide.type === "image") {
      let img = document.createElement("img");
      img.src = slide.src;
      img.alt = slide.alt || "";
      img.style.width = "100%";
      this.container.appendChild(img);
    } else if (slide.type === "video") {
      let video = document.createElement("video");
      video.src = slide.src;
      video.poster = slide.poster || "";
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.controls = true;
      video.style.width = "100%";
      this.container.appendChild(video);
    }

    // Determine interval for this slide
    let interval = slide.interval || this.defaultInterval;

    // Schedule next slide
    this.index = (this.index + 1) % this.slides.length;
    this.timeoutId = setTimeout(() => this.showSlide(), interval);
  }

  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('[data-slides]').forEach(container => {
    let slides = JSON.parse(container.getAttribute('data-slides'));
    new Slideshow(container, slides);
  });
});