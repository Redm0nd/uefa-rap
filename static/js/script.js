function toggleSubMenu(submenuId) {
    var submenus = document.getElementsByClassName('submenu');
    for (var i = 0; i < submenus.length; i++) {
        submenus[i].style.display = 'none'; // Hide all submenus
    }

    var activeSubMenu = document.getElementById(submenuId);
    var isDisplayed = activeSubMenu.style.display === 'block';
    activeSubMenu.style.display = isDisplayed ? 'none' : 'block'; // Toggle display of the active submenu
}
