const windows = document.querySelectorAll(".desktop > .window");
let topZ = 1;

function focusWindow(win) {
    win.style.zIndex = ++topZ;
}

windows.forEach((win) => {
    win.addEventListener("mousedown", () => focusWindow(win));

    const titleBar = win.querySelector(".title-bar");
    titleBar.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".title-bar-controls")) return;
        if (getComputedStyle(win).position !== "absolute") return;

        focusWindow(win);
        win.classList.add("dragging");
        titleBar.setPointerCapture(e.pointerId);

        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = win.offsetLeft;
        const startTop = win.offsetTop;

        function onMove(e) {
            win.style.left = startLeft + (e.clientX - startX) + "px";
            win.style.top = startTop + (e.clientY - startY) + "px";
        }

        function onUp(e) {
            win.classList.remove("dragging");
            titleBar.releasePointerCapture(e.pointerId);
            titleBar.removeEventListener("pointermove", onMove);
            titleBar.removeEventListener("pointerup", onUp);
        }

        titleBar.addEventListener("pointermove", onMove);
        titleBar.addEventListener("pointerup", onUp);
    });
});

focusWindow(windows[0]);
