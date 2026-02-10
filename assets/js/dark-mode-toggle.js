(function () {
  var LIGHT = "light";
  var DARK = "dark";

  function getTheme() {
    var saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? DARK
      : LIGHT;
  }

  function applyTheme(theme) {
    var mainLink = document.querySelector('link[href*="main.css"]');
    var darkLink = document.getElementById("dark-theme");
    if (!mainLink || !darkLink) return;

    if (theme === DARK) {
      darkLink.setAttribute("rel", "stylesheet");
      setTimeout(function () {
        mainLink.setAttribute("rel", "stylesheet alternate");
      }, 10);
    } else {
      mainLink.setAttribute("rel", "stylesheet");
      setTimeout(function () {
        darkLink.setAttribute("rel", "stylesheet alternate");
      }, 10);
    }

    localStorage.setItem("theme", theme);
  }

  function toggleTheme() {
    var next = getTheme() === DARK ? LIGHT : DARK;
    applyTheme(next);
  }

  function injectToggleButton() {
    var nav = document.querySelector(".greedy-nav");
    if (!nav) return;

    var btn = document.createElement("button");
    btn.className = "theme-toggle";
    btn.type = "button";
    btn.setAttribute("aria-label", "Toggle dark mode");
    btn.setAttribute("title", "Toggle dark mode");
    btn.innerHTML = '<i class="fas fa-adjust"></i>';
    btn.addEventListener("click", toggleTheme);

    var hiddenToggle = nav.querySelector(".greedy-nav__toggle");
    if (hiddenToggle) {
      nav.insertBefore(btn, hiddenToggle);
    } else {
      nav.appendChild(btn);
    }
  }

  document.addEventListener("DOMContentLoaded", injectToggleButton);

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", function (e) {
      if (!localStorage.getItem("theme")) {
        applyTheme(e.matches ? DARK : LIGHT);
      }
    });
})();
