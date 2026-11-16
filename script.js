(function () {
  var root = document.documentElement;
  var accents = ["gold", "mint", "sky", "lilac", "pink", "coral"];
  var accent = "gold";

  try {
    var saved = window.localStorage.getItem("hesperian-accent");
    if (accents.indexOf(saved) !== -1) {
      accent = saved;
    }
  } catch (error) {
    accent = "gold";
  }

  function paint(name) {
    accent = name;
    if (name === "gold") {
      root.removeAttribute("data-accent");
    } else {
      root.setAttribute("data-accent", name);
    }
  }

  paint(accent);
  root.classList.add("js");

  function start() {
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var picker = document.querySelector("[data-accent-picker]");
  if (picker) {
    var toggle = picker.querySelector(".accent__toggle");
    var panel = picker.querySelector(".accent__panel");
    var swatches = [].slice.call(picker.querySelectorAll(".swatch"));
    var theme = document.querySelector("meta[name=theme-color]");

    var sync = function () {
      swatches.forEach(function (swatch) {
        swatch.setAttribute("aria-checked", swatch.dataset.set === accent ? "true" : "false");
      });
      if (theme) {
        window.requestAnimationFrame(function () {
          theme.setAttribute("content", window.getComputedStyle(root).getPropertyValue("--surface").trim());
        });
      }
    };

    var show = function (open) {
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };

    toggle.addEventListener("click", function () {
      show(panel.hidden);
    });

    swatches.forEach(function (swatch) {
      swatch.addEventListener("click", function () {
        paint(swatch.dataset.set);
        sync();
        try {
          window.localStorage.setItem("hesperian-accent", accent);
        } catch (error) {
          return;
        }
      });
    });

    document.addEventListener("click", function (event) {
      if (!picker.contains(event.target)) {
        show(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) {
        show(false);
        toggle.focus();
      }
    });

    sync();
  }

  var title = document.querySelector("[data-title]");
  if (title && !calm) {
    title.classList.add("is-pre");
    var settle = function () {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          title.classList.remove("is-pre");
        });
      });
    };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(settle);
      window.setTimeout(settle, 1500);
    } else {
      settle();
    }
  }

  var revealables = [].slice.call(document.querySelectorAll("[data-reveal]"));
  if ("IntersectionObserver" in window && !calm) {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          seen.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    revealables.forEach(function (node) {
      seen.observe(node);
    });
  } else {
    revealables.forEach(function (node) {
      node.classList.add("is-in");
    });
  }

  var astra = document.querySelector("[data-astra]");
  if (astra) {
    var tabs = [].slice.call(astra.querySelectorAll("[role=tab]"));
    var shots = [].slice.call(astra.querySelectorAll("picture"));

    var choose = function (index) {
      tabs.forEach(function (tab, i) {
        tab.setAttribute("aria-selected", i === index ? "true" : "false");
        tab.tabIndex = i === index ? 0 : -1;
      });
      shots.forEach(function (shot, i) {
        shot.classList.toggle("is-on", i === index);
        if (i === index) {
          shot.querySelector("img").loading = "eager";
        }
      });
    };

    tabs.forEach(function (tab, index) {
      tab.tabIndex = index === 0 ? 0 : -1;
      tab.addEventListener("click", function () {
        choose(index);
      });
      tab.addEventListener("keydown", function (event) {
        var step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
        if (step) {
          event.preventDefault();
          var next = (index + step + tabs.length) % tabs.length;
          choose(next);
          tabs[next].focus();
        }
      });
    });
  }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();

const initCompare = () => {
  for (const frame of document.querySelectorAll('[data-compare]')) {
    const view = frame.querySelector('.versus__view')
    const range = frame.querySelector('.versus__range')
    if (!view || !range) continue
    const set = (v) => {
      view.style.setProperty('--pos', `${v}%`)
    }
    range.addEventListener('input', () => set(range.value))
    range.addEventListener('pointerdown', () => view.classList.add('is-drag'))
    window.addEventListener('pointerup', () => view.classList.remove('is-drag'))
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (calm || !('IntersectionObserver' in window)) continue
    let touched = false
    range.addEventListener('pointerdown', () => {
      touched = true
    })
    const hint = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      hint.disconnect()
      const start = performance.now()
      const step = (now) => {
        if (touched) return
        const t = Math.min(1, (now - start) / 1800)
        const v = 50 + Math.sin(t * Math.PI * 2) * 18 * (1 - t)
        set(v)
        range.value = String(v)
        if (t < 1) requestAnimationFrame(step)
      }
      setTimeout(() => requestAnimationFrame(step), 400)
    }, { threshold: 0.5 })
    hint.observe(frame)
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCompare)
else initCompare()
