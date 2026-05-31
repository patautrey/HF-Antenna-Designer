/* ---------------------------------------------------------
   HF Workbench — DOM Helpers
   These functions MUST return HTML STRINGS, not DOM nodes.
--------------------------------------------------------- */

export function infoBox(html) {
    return `
        <div class="info-box" style="
            background:#e8f4ff;
            border:1px solid #b5d7ff;
            padding:1rem;
            border-radius:6px;
            margin-top:1rem;
        ">
            ${html}
        </div>
    `;
}

export function warnBox(html) {
    return `
        <div class="warn-box" style="
            background:#fff4e5;
            border:1px solid #ffcc80;
            padding:1rem;
            border-radius:6px;
            margin-top:1rem;
        ">
            ${html}
        </div>
    `;
}
