import Masonry from "masonry-layout";

window.onload = () => {
    const grid = document.querySelector('.portfolio-grid');

    const masonry = new Masonry(grid, {
        itemSelector: '.box',
        columnWidth: '.box', // Uses the width of .box as the column width reference
        gutter: 50,          // Space between items
        percentPosition: true
    })
    masonry.on('layoutComplete', ()=>console.log('Layout Complete'));
}