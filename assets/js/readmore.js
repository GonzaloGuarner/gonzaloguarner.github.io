document.addEventListener("DOMContentLoaded", function() {
    const TRUNCATED_HEIGHT = 150; // Match the CSS max-height
    const boxes = document.querySelectorAll('.box');
  
    boxes.forEach(box => {
      const textContent = box.querySelector('.text-content');
      const readMoreBtn = box.querySelector('.read-more-button');
      if (!textContent || !readMoreBtn) return;
  
      requestAnimationFrame(() => {
        if (textContent.scrollHeight > TRUNCATED_HEIGHT) {
          // There's more text than fits in the truncated height
          readMoreBtn.style.display = 'inline-block';
        } else {
          // Content fits in truncated height
          readMoreBtn.style.display = 'none';
        }
      });
  
      readMoreBtn.addEventListener('click', function() {
        if (textContent.classList.contains('expanded')) {
          // Currently expanded; revert to truncated
          textContent.classList.remove('expanded');
          this.textContent = 'Read More';
        } else {
          // Currently truncated; expand content
          textContent.classList.add('expanded');
          this.textContent = 'Read Less';
        }
      });
    });
  });
  