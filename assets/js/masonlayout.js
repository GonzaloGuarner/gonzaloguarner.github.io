let msnryInstance = null;

function createMasonry() {
    const grid = document.querySelector('.portfolio-grid');

    // Ensure the grid exists
    if (!grid) {
        console.error("Portfolio grid not found.");
        return;
    }

    // Destroy any existing Masonry instance
    if (msnryInstance) {
        msnryInstance.destroy();
        msnryInstance = null;
    }

    // Wait for all images within the grid to load
    imagesLoaded(grid, function() {
        // Initialize Masonry after images have loaded
        msnryInstance = new Masonry(grid, {
            itemSelector: '.box',
            columnWidth: '.grid-sizer',    // Uses the width of .grid-sizer as the column width reference
            gutter: '.gutter-sizer',       // Space between items
            percentPosition: true
        });
        setTimeout(layoutAndDispatchMasonry, 5);//Timeout waiting for resize
    });
}

function layoutAndDispatchMasonry() {
    const grid = document.querySelector('.portfolio-grid');

    if (!grid) {
        console.error("Portfolio grid not found.");
        return;
    }

    if (msnryInstance) {
        msnryInstance.layout();


        // Dispatch Masonry layout complete event
        document.dispatchEvent(new CustomEvent('masonryLayoutComplete', { detail: { msnry: msnryInstance } }));
    } else {
        console.warn("Masonry instance is not initialized. Ensure createMasonry is called first.");
    }
}
function addVideoEventListeners() {
    const videos = document.querySelectorAll('.portfolio-grid video');

    videos.forEach(video => {
        video.addEventListener('pause', () => {
            layoutAndDispatchMasonry();
        });
    });
}


window.addEventListener('resize', () => {
    layoutAndDispatchMasonry();
});

// Initialize after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    addVideoEventListeners();
    createMasonry();
});