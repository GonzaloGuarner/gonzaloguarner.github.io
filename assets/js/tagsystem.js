// Tag system 
document.addEventListener('DOMContentLoaded', function() {
    // Get all tag buttons, project boxes, and clear filters button
    const tagButtons = document.querySelectorAll('.tag-button');
    const projectBoxes = document.querySelectorAll('.box');
    const clearFiltersButton = document.getElementById('clear-filters');

    // Collapsible elements
    const collapsibleButtons = document.querySelectorAll('.collapsible');

    // Object to store active tags per group
    const activeTags = {
        type: [],
        technology: []
    };

    let msnryInstance = null;

    document.addEventListener('masonryLayoutComplete', function(e) {
        msnryInstance = e.detail.msnry;
    });

    // Function to update the project visibility
    function updateProjects() {
        // Show or hide projects based on active tags
        projectBoxes.forEach(box => {
            const projectTags = box.getAttribute('data-tags').split(' ');

            // Flags to determine if project matches active tags
            let matchesType = activeTags.type.length === 0;
            let matchesTechnology = activeTags.technology.length === 0;

            // Check for matching type tags
            if (activeTags.type.length > 0) {
                matchesType = activeTags.type.some(tag => projectTags.includes(tag));
            }

            // Check for matching technology tags
            if (activeTags.technology.length > 0) {
                matchesTechnology = activeTags.technology.some(tag => projectTags.includes(tag));
            }

            // Show project if it matches all active tag categories
            if (matchesType && matchesTechnology) {
                box.style.display = '';
            } else {
                box.style.display = 'none';
            }
        });
        // Now recreate the Masonry instance to reflect the changes
        layoutAndDispatchMasonry();
    }

    // Add click event listeners to tag buttons
    tagButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tag = button.getAttribute('data-tag');
            const group = button.getAttribute('data-group');

            // Toggle active class
            button.classList.toggle('active');

            // Update active tags
            if (button.classList.contains('active')) {
                activeTags[group].push(tag);
            } else {
                activeTags[group] = activeTags[group].filter(t => t !== tag);
            }

            // Update project visibility
            updateProjects();
        });
    });

    // Clear filters button functionality
    clearFiltersButton.addEventListener('click', function() {
        tagButtons.forEach(button => button.classList.remove('active'));
        activeTags.type = [];
        activeTags.technology = [];
        updateProjects();
    });

    // Collapsible sections functionality
    collapsibleButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.parentElement.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
});