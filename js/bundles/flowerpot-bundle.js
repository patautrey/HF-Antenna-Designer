/* ---------------------------------------------------------
   HF Workbench — Flowerpot Bundle Loader
--------------------------------------------------------- */

import { installFlowerpotModules } from "../install/flowerpot-install.js";

export function loadFlowerpotBundle(app) {
    installFlowerpotModules(app.router);
}
