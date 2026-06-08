/* ============================================================
   HF Antenna Designer — Theme Engine
   ============================================================ */

import Layout from "./layout.js";

const Theme = {

    current: "light",

    init() {
        const saved = localStorage.getItem("hfTheme");
        this.current = saved || "light";

        Layout.applyThemeClasses(this.current);

        const toggle = document.getElementById("themeToggle");
        if (toggle) {
            toggle.addEventListener("click", () => this.toggleTheme());
        }
    },

    setTheme(theme) {
        this.current = theme;
        localStorage.setItem("hfTheme", theme);
        Layout.applyThemeClasses(theme);
    },

    toggleTheme() {
        const newTheme = this.current === "light" ? "dark" : "light";
        this.setTheme(newTheme);
    }
};

export default Theme;
