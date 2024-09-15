// Tag system 
document.addEventListener('DOMContentLoaded', function() {
    // Getting all tag buttons and project boxes
    const tagButtons = document.querySelectorAll('.tag-button');
    const projectBoxes = document.querySelectorAll('.box');
    const clearFiltersButton = document.getElementById('clear-filters');

    // Function to update the project visibility
    function updateProjects() {
        // Getting active tags
        const activeTags = Array.from(tagButtons)
            .filter(button => button.classList.contains('active'))
            .map(button => button.getAttribute('data-tag'));

        // Show or hide projects based on active tags
        projectBoxes.forEach(box => {
            const projectTags = box.getAttribute('data-tags').split(' ');
            // If no tags are active, show all projects
            if (activeTags.length === 0) {
                box.parentElement.style.display = '';
            } else {
                // Check if project has any of the active tags
                const hasTag = activeTags.some(tag => projectTags.includes(tag));
                box.parentElement.style.display = hasTag ? '' : 'none';
            }
        });
    }

    // Click event listeners onto tag buttons
    tagButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Toggle active class
            button.classList.toggle('active');
            // Update project visibility
            updateProjects();
        });
    });

    // Clear filters button functionality
    clearFiltersButton.addEventListener('click', function() {
        tagButtons.forEach(button => button.classList.remove('active'));
        updateProjects();
    });
});