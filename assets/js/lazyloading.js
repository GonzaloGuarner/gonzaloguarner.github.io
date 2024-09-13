document.addEventListener("DOMContentLoaded", function() {
    var lazyVideos = [].slice.call(document.querySelectorAll("video"));

    if ("IntersectionObserver" in window) {
        var lazyVideoObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var video = entry.target;
                    var sources = video.querySelectorAll("source");
                    sources.forEach(function(source) {
                        source.src = source.dataset.src;
                    });
                    video.load();
                    lazyVideoObserver.unobserve(video);
                }
            });
        });

        lazyVideos.forEach(function(lazyVideo) {
            lazyVideoObserver.observe(lazyVideo);
        });
    } else {
        // Fallback for browsers that do not support IntersectionObserver
        lazyVideos.forEach(function(lazyVideo) {
            var sources = lazyVideo.querySelectorAll("source");
            sources.forEach(function(source) {
                source.src = source.dataset.src;
            });
            lazyVideo.load();
        });
    }
});