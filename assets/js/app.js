const win = document.querySelector(".window");
const titleBar = win.querySelector(".title-bar");
const [minimize, maximize, close] = win.querySelectorAll(".title-bar-controls button");
const isDesktop = () => matchMedia("(min-width: 701px)").matches;
const POS_PROPS = ["position", "left", "top", "margin", "width", "height"];

function withPointerDrag(el, e, onMove, onEnd) {
    el.setPointerCapture(e.pointerId);
    const ac = new AbortController();
    const { signal } = ac;
    el.addEventListener("pointermove", onMove, { signal });
    for (const type of ["pointerup", "pointercancel"]) {
        el.addEventListener(type, () => { onEnd(); ac.abort(); }, { signal });
    }
}

minimize.addEventListener("click", (e) => {
    e.preventDefault();
    win.classList.add("minimizing");
    win.addEventListener("transitionend", function onEnd(e) {
        if (e.target !== win || e.propertyName !== "opacity") return;
        win.removeEventListener("transitionend", onEnd);
        win.classList.add("closed");
    });
});

let preMaximize = null;
maximize.addEventListener("click", (e) => {
    e.preventDefault();
    const maximized = win.classList.toggle("maximized");
    maximize.setAttribute("aria-label", maximized ? "Restore" : "Maximize");
    if (maximized) {
        preMaximize = Object.fromEntries(POS_PROPS.map((p) => [p, win.style[p]]));
        for (const p of POS_PROPS) win.style[p] = "";
    } else if (preMaximize) {
        Object.assign(win.style, preMaximize);
        preMaximize = null;
    }
});

close.addEventListener("click", (e) => {
    e.preventDefault();
    win.classList.add("closed");
});

titleBar.addEventListener("pointerdown", (e) => {
    if (!isDesktop() || win.classList.contains("maximized") || e.target.closest(".title-bar-controls")) return;

    const rect = win.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    Object.assign(win.style, { position: "fixed", left: rect.left + "px", top: rect.top + "px", margin: "0" });
    win.classList.add("dragging");

    withPointerDrag(win, e, (e) => {
        win.style.left = e.clientX - offsetX + "px";
        win.style.top = e.clientY - offsetY + "px";
    }, () => win.classList.remove("dragging"));
});

let wasDesktop = isDesktop();
addEventListener("resize", () => {
    const nowDesktop = isDesktop();
    if (nowDesktop === wasDesktop) return;
    wasDesktop = nowDesktop;
    if (!nowDesktop) for (const p of POS_PROPS) win.style[p] = "";
});
