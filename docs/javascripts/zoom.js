/* Click an image to open it in a viewer. Mouse wheel (or trackpad pinch) zooms at the cursor, drag
   pans, double-click toggles fit and actual size, the buttons and + / - / 0 / Esc work, and two-finger
   pinch works on touch. No dependencies. Written for the organ map, which is 3736 px wide inside a
   column about a quarter of that. */
(function () {
  "use strict";

  var MAX_SCALE = 4;
  var MIN_IMAGE_PX = 64;

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  function button(label, title, onClick) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.title = title;
    b.setAttribute("aria-label", title);
    b.addEventListener("click", function (e) { e.stopPropagation(); onClick(); });
    return b;
  }

  function openViewer(source) {
    var overlay = document.createElement("div");
    overlay.className = "zv";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", source.alt || "Image viewer");

    var stage = document.createElement("img");
    stage.className = "zv-img";
    stage.alt = source.alt || "";
    stage.draggable = false;

    var scale = 1, tx = 0, ty = 0, fit = 1;
    var pointers = new Map();
    var travelled = 0;

    // Resize the box and translate it. A CSS scale() on a 3736 px image made the browser re-raster
    // the whole scaled layer on every wheel step (about a second a frame, measured); resizing lets
    // it draw only the visible part.
    function apply() {
      stage.style.width = stage.naturalWidth * scale + "px";
      stage.style.height = stage.naturalHeight * scale + "px";
      stage.style.transform = "translate(" + tx + "px," + ty + "px)";
    }

    function zoomAt(cx, cy, factor) {
      var next = clamp(scale * factor, Math.min(fit, 1) * 0.5, MAX_SCALE);
      tx = cx - (cx - tx) * (next / scale);
      ty = cy - (cy - ty) * (next / scale);
      scale = next;
      apply();
    }

    function zoomCentre(factor) { zoomAt(innerWidth / 2, innerHeight / 2, factor); }

    function fitToScreen() {
      var w = stage.naturalWidth, h = stage.naturalHeight;
      fit = Math.min(1, (innerWidth / w) * 0.96, (innerHeight / h) * 0.96);
      scale = fit;
      tx = (innerWidth - w * scale) / 2;
      ty = (innerHeight - h * scale) / 2;
      apply();
    }

    function actualSize(cx, cy) { zoomAt(cx, cy, 1 / scale); }

    function close() {
      overlay.remove();
      document.documentElement.classList.remove("zv-lock");
      removeEventListener("keydown", onKey, true);
      removeEventListener("resize", fitToScreen);
      source.focus({ preventScroll: true });
    }

    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "+" || e.key === "=") { e.preventDefault(); zoomCentre(1.25); }
      else if (e.key === "-" || e.key === "_") { e.preventDefault(); zoomCentre(0.8); }
      else if (e.key === "0") { e.preventDefault(); fitToScreen(); }
    }

    overlay.addEventListener("wheel", function (e) {
      e.preventDefault();
      var rate = e.ctrlKey ? 0.01 : 0.0015; // a trackpad pinch arrives as ctrl + wheel
      zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * rate));
    }, { passive: false });

    overlay.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".zv-bar")) return;
      overlay.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) travelled = 0;
      overlay.classList.add("zv-dragging");
    });

    overlay.addEventListener("pointermove", function (e) {
      var prev = pointers.get(e.pointerId);
      if (!prev) return;
      var next = { x: e.clientX, y: e.clientY };
      if (pointers.size === 1) {
        tx += next.x - prev.x;
        ty += next.y - prev.y;
        travelled += Math.abs(next.x - prev.x) + Math.abs(next.y - prev.y);
        apply();
      } else if (pointers.size === 2) {
        var other = null;
        pointers.forEach(function (v, id) { if (id !== e.pointerId) other = v; });
        var before = dist(prev, other), after = dist(next, other);
        if (before > 0) zoomAt((next.x + other.x) / 2, (next.y + other.y) / 2, after / before);
        tx += (next.x - prev.x) / 2;
        ty += (next.y - prev.y) / 2;
        travelled = 99;
        apply();
      }
      pointers.set(e.pointerId, next);
    });

    function release(e) {
      pointers.delete(e.pointerId);
      if (!pointers.size) overlay.classList.remove("zv-dragging");
    }
    overlay.addEventListener("pointerup", release);
    overlay.addEventListener("pointercancel", release);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay && travelled < 4) close(); // a click on the backdrop, not the end of a drag
    });

    overlay.addEventListener("dblclick", function (e) {
      if (e.target.closest(".zv-bar")) return;
      if (scale > fit * 1.05) fitToScreen(); else actualSize(e.clientX, e.clientY);
    });

    var bar = document.createElement("div");
    bar.className = "zv-bar";
    bar.appendChild(button("+", "Zoom in (+)", function () { zoomCentre(1.25); }));
    bar.appendChild(button("−", "Zoom out (-)", function () { zoomCentre(0.8); }));
    bar.appendChild(button("Fit", "Fit to screen (0)", fitToScreen));
    bar.appendChild(button("1:1", "Actual size", function () { actualSize(innerWidth / 2, innerHeight / 2); }));
    var closeButton = button("× Close", "Close (Esc)", close);
    bar.appendChild(closeButton);

    var hint = document.createElement("div");
    hint.className = "zv-hint";
    hint.textContent = "Scroll to zoom · drag to pan · double-click for actual size · Esc to close";

    overlay.appendChild(stage);
    overlay.appendChild(bar);
    overlay.appendChild(hint);
    document.body.appendChild(overlay);
    document.documentElement.classList.add("zv-lock");
    addEventListener("keydown", onKey, true);
    addEventListener("resize", fitToScreen);

    stage.addEventListener("load", fitToScreen);
    stage.src = source.currentSrc || source.src;
    closeButton.focus({ preventScroll: true });
  }

  function init() {
    document.querySelectorAll(".md-content img").forEach(function (img) {
      if (img.dataset.zv || img.closest("a")) return;
      var arm = function () {
        if (img.naturalWidth && img.naturalWidth < MIN_IMAGE_PX) return;
        img.dataset.zv = "1";
        img.classList.add("zv-target");
        img.tabIndex = 0; // keyboard users open it with Enter; no title, so alt stays the accessible name
        img.addEventListener("click", function () { openViewer(img); });
        img.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openViewer(img); }
        });
        // Only say so when the picture is shown smaller than it is: that is when enlarging helps.
        if (img.naturalWidth > img.clientWidth * 1.3 && img.parentElement) {
          var note = document.createElement("p");
          note.className = "zv-note";
          note.textContent = "Click the picture to enlarge it: scroll to zoom, drag to pan.";
          img.parentElement.insertAdjacentElement("afterend", note);
        }
      };
      if (img.complete) arm(); else img.addEventListener("load", arm, { once: true });
    });
  }

  if (window.document$ && window.document$.subscribe) window.document$.subscribe(init);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
