/* ============================================================
   HF Antenna Designer — Layout Engine
   ============================================================ */

const Layout = {

    createLayout() {
        const root = document.getElementById("app");
        if (!root) return;

        root.innerHTML = `
            <div id="topbar" class="topbar">
                <div class="topbar-title">HF Antenna Designer</div>
                <div id="themeToggle" class="theme-toggle">🌓</div>
            </div>

            <div id="body" class="body-container">
                <div id="sidebar" class="sidebar"></div>
                <div id="main" class="main"></div>
            </div>

            <div id="footer" class="footer">
                © HF Antenna Designer
            </div>
        `;
    },

    getMainContainer() {
        return document.getElementById("main");
    },

    applyThemeClasses(theme) {
        const root = document.documentElement;

        root.classList.remove("theme-light", "theme-dark");

        if (theme === "dark") {
            root.classList.add("theme-dark");
        } else {
            root.classList.add("theme-light");
        }
    }
};

export default Layout;
