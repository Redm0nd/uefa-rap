// script.js
window.addEventListener('DOMContentLoaded', (event) => {
    let lastActiveMenuItem = null;

    window.showSubMenu = function (submenuId) {
        // Hide any previously shown submenu
        if (lastActiveMenuItem && lastActiveMenuItem !== submenuId) {
            document.getElementById(lastActiveMenuItem).style.display = 'none';
            document.querySelector(`li.active`).classList.remove('active');
        }

        // Toggle the display of the submenu
        const submenu = document.getElementById(submenuId);
        if (submenu.style.display === 'none') {
            submenu.style.display = 'block';
            document.querySelector(`li[onclick="showSubMenu('${submenuId}');"]`).classList.add('active');
        } else {
            submenu.style.display = 'none';
            document.querySelector(`li[onclick="showSubMenu('${submenuId}');"]`).classList.remove('active');
        }

        lastActiveMenuItem = submenuId; // Keep track of the last active menu item
    };

    window.loadContent = function (contentId) {
        // Load content for the selected submenu item
        // You can use AJAX here or just simple content swapping
        console.log('Load content for:', contentId);
        // Implement content loading logic...
    };
});

