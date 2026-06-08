/* ============================================================
   HF Antenna Designer — Application Bootstrap
   ============================================================ */

import Layout from "./layout.js";
import Sidebar from "./sidebar.js";
import Theme from "./theme.js";
import Router from "./router.js";

const App = {

    async init() {
        Layout.createLayout();
        Theme.init();
        Sidebar.renderSidebar();

        await Router.navigate("vertical-quarterwave");
    }
};

window.addEventListener("DOMContentLoaded", () => {
    App.init();
});

export default App;
