// Shared desktop sidebar: keep its markup and content in one partial.
document.querySelectorAll("[data-sidebar]").forEach(function(placeholder) {
  fetch("sidebar.html")
    .then(function(response) {
      if (!response.ok) throw new Error("Sidebar konnte nicht geladen werden.");
      return response.text();
    })
    .then(function(markup) {
      placeholder.outerHTML = markup;
    })
    .catch(function(error) {
      console.error(error);
    });
});

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
  menu.classList.toggle("show");
  burger.classList.toggle("open");
}
