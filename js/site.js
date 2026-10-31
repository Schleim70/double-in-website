// Load reusable HTML fragments (sidebar, back button, and mobile navigation).
(function loadComponents() {
  var scriptUrl = document.currentScript && document.currentScript.src;
  if (!scriptUrl) return;
  var componentDirectory = new URL("../components/", scriptUrl);
  document.querySelectorAll("[data-component]").forEach(function(placeholder) {
    var componentName = placeholder.getAttribute("data-component");
    // Fetch as plain text so Live Server does not inject its reload script into HTML fragments.
    fetch(new URL(componentName + ".txt", componentDirectory), { cache: "no-store" })
      .then(function(response) {
        if (!response.ok) throw new Error("Komponente konnte nicht geladen werden: " + componentName);
        return response.text();
      })
      .then(function(markup) {
        var template = document.createElement("template");
        template.innerHTML = markup.trim();
        if (componentName === "page-heading") {
          var root = template.content.querySelector("[data-heading-root]");
          var kicker = template.content.querySelector("[data-heading-kicker]");
          var title = template.content.querySelector("[data-heading-title]");
          var headingLevel = Number(placeholder.dataset.headingLevel) || 1;
          if (!root || !kicker || !title) throw new Error("Überschriften-Komponente ist unvollständig");

          var rootClass = placeholder.dataset.headingClass;
          if (rootClass) root.classList.add(rootClass);

          kicker.textContent = placeholder.dataset.kicker || "";
          var titleElement = document.createElement("h" + Math.min(6, Math.max(1, headingLevel)));
          titleElement.className = title.className;
          var titleClass = placeholder.dataset.titleClass;
          if (titleClass) titleElement.classList.add(titleClass);
          titleElement.textContent = placeholder.dataset.title || "";
          title.replaceWith(titleElement);

          if (!placeholder.dataset.kicker) kicker.hidden = true;
        }

        if (componentName === "desktop-navigation" || componentName === "mobile-navigation") {
          var nav = template.content.querySelector("nav");
          var currentPath = normalizedPagePath(window.location.pathname);
          if (nav) {
            nav.querySelectorAll("a[href]").forEach(function(link) {
              var linkPath = normalizedPagePath(new URL(link.getAttribute("href"), document.baseURI).pathname);
              if (linkPath === currentPath) {
                link.classList.add("is-current");
                link.setAttribute("aria-current", "page");
              }
            });
          }
        }

        placeholder.replaceWith(template.content);
        if (componentName === "back-button") updateHistoryButtons();
      })
      .catch(function(error) { console.error(error); });
  });
})();

// A short, screen-fixed trail stays under the pointer even when the page is zoomed.
if (window.matchMedia("(pointer: fine)").matches) {
  var cursorZoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
  var cursorTarget = { x: -100, y: -100 };
  var cursorDots = [];
  var cursorFrame = 0;
  var cursorFadeTimer = 0;
  var cursorVisible = false;
  var cursorInitialized = false;

  [22, 19, 17, 14, 11, 9, 7, 5, 4, 3].forEach(function(size, index) {
    var node = document.createElement("span");
    node.className = "cursor-trail";
    node.style.width = size + "px";
    node.style.height = size + "px";
    node.style.opacity = "0";
    document.body.appendChild(node);
    cursorDots.push({ node: node, x: -100, y: -100, strength: [0.88, 0.78, 0.67, 0.56, 0.46, 0.36, 0.27, 0.19, 0.12, 0.07][index] });
  });

  function pointerPosition(event) {
    return { x: event.clientX / cursorZoom, y: event.clientY / cursorZoom };
  }

  function drawCursorTrail() {
    var followX = cursorTarget.x;
    var followY = cursorTarget.y;
    var stillMoving = false;

    cursorDots.forEach(function(dot, index) {
      var ease = index === 0 ? 0.4 : 0.2;
      dot.x += (followX - dot.x) * ease;
      dot.y += (followY - dot.y) * ease;
      dot.node.style.transform = "translate3d(" + dot.x + "px," + dot.y + "px,0) translate(-50%,-50%)";
      dot.node.style.opacity = cursorVisible ? dot.strength : "0";
      if (Math.abs(followX - dot.x) > 0.35 || Math.abs(followY - dot.y) > 0.35) stillMoving = true;
      followX = dot.x;
      followY = dot.y;
    });

    if (stillMoving || cursorVisible) {
      cursorFrame = requestAnimationFrame(drawCursorTrail);
    } else {
      cursorFrame = 0;
    }
  }

  function startCursorFrame() {
    if (!cursorFrame) cursorFrame = requestAnimationFrame(drawCursorTrail);
  }

  document.addEventListener("pointermove", function(event) {
    if (event.pointerType === "touch") return;
    cursorTarget = pointerPosition(event);
    if (!cursorInitialized) {
      cursorDots.forEach(function(dot) {
        dot.x = cursorTarget.x;
        dot.y = cursorTarget.y;
      });
      cursorInitialized = true;
    }
    cursorVisible = true;
    clearTimeout(cursorFadeTimer);
    cursorFadeTimer = setTimeout(function() { cursorVisible = false; startCursorFrame(); }, 120);
    startCursorFrame();
  }, { passive: true });

  document.addEventListener("pointerdown", function(event) {
    if (event.pointerType === "touch" || event.button !== 0) return;
    var point = pointerPosition(event);
    var burst = document.createElement("span");
    burst.className = "cursor-burst";
    burst.style.left = point.x + "px";
    burst.style.top = point.y + "px";
    document.body.appendChild(burst);
    burst.addEventListener("animationend", function() { burst.remove(); }, { once: true });

    for (var i = 0; i < 7; i++) {
      var angle = (Math.PI * 2 * i) / 7;
      var distance = 14 + (i % 3) * 4;
      var spark = document.createElement("span");
      spark.className = "cursor-spark";
      spark.style.left = point.x + "px";
      spark.style.top = point.y + "px";
      document.body.appendChild(spark);
      spark.animate([
        { transform: "translate(-50%,-50%) scale(0.7)", opacity: 1 },
        { transform: "translate(calc(-50% + " + Math.cos(angle) * distance + "px),calc(-50% + " + Math.sin(angle) * distance + "px)) scale(0)", opacity: 0 }
      ], { duration: 360, easing: "cubic-bezier(.16,.72,.35,1)", fill: "forwards" }).onfinish = function() { this.effect.target.remove(); };
    }
  });
}

// deine anderen Funktionen bleiben unverändert
function toggleMenu() {
  const menu = document.getElementById("menu");
  if (menu.style.display === "none" || menu.style.display === "") {
    menu.style.display = "block";
  } else {
    menu.style.display = "none";
  }
}

function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  const burger = document.querySelector(".burger");
  if (!menu || !burger) return;
  const isOpen = menu.classList.toggle("show");
  burger.classList.toggle("open", isOpen);
  burger.setAttribute("aria-expanded", String(isOpen));
  burger.setAttribute("aria-label", isOpen ? "Menü schließen" : "Menü öffnen");
}

function navigateBack() {
  var availability = getHistoryAvailability();
  if (!availability.back) return;
  if (window.navigation && typeof window.navigation.back === "function") window.navigation.back();
  else window.history.back();
}

function navigateForward() {
  var availability = getHistoryAvailability();
  if (!availability.forward) return;
  if (window.navigation && typeof window.navigation.forward === "function") window.navigation.forward();
  else window.history.forward();
}

function getHistoryAvailability() {
  if (window.navigation && typeof window.navigation.canGoBack === "boolean") {
    return { back: window.navigation.canGoBack, forward: window.navigation.canGoForward };
  }

  var sameOriginReferrer = false;
  try {
    sameOriginReferrer = Boolean(document.referrer && new URL(document.referrer).origin === window.location.origin);
  } catch (error) {
    sameOriginReferrer = false;
  }
  return { back: sameOriginReferrer && window.history.length > 1, forward: false };
}

function updateHistoryButtons() {
  var buttons = document.querySelectorAll(".back-button button");
  if (!buttons.length) return;
  var availability = getHistoryAvailability();
  if (buttons[0]) buttons[0].disabled = !availability.back;
  if (buttons[1]) buttons[1].disabled = !availability.forward;
}

function normalizedPagePath(path) {
  var normalized = decodeURIComponent(path || "/").replace(/\/+$/, "").toLowerCase();
  return normalized || "/index.html";
}

window.addEventListener("pageshow", updateHistoryButtons);
if (window.navigation && typeof window.navigation.addEventListener === "function") {
  window.navigation.addEventListener("currententrychange", updateHistoryButtons);
}

document.addEventListener("click", function(event) {
  if (!event.target.closest("#mobileMenu a")) return;
  const menu = document.getElementById("mobileMenu");
  const burger = document.querySelector(".burger");
  if (!menu || !burger) return;
  menu.classList.remove("show");
  burger.classList.remove("open");
  burger.setAttribute("aria-expanded", "false");
  burger.setAttribute("aria-label", "Menü öffnen");
});
