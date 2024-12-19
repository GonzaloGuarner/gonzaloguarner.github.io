

window.onload = () => {
    const grid = document.querySelector('.portfolio-grid');

    const masonry = new Masonry(grid, {
        itemSelector: '.box',
        columnWidth: '.box', // Uses the width of .box as the column width reference
        gutter: '.gutter-sizer',          // Space between items
        percentPosition: true
    })
}
