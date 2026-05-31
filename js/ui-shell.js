/* ---------------------------------------------------------
   Antenna Workbench — Global UI Shell
   Adds, in this order:
   1) Home button to every module
   2) Antenna tags (DX, NVIS, multiband, portable, etc.)
   3) Favorites panel (stored in localStorage)
   4) Side-by-side compare view
   5) VHF/UHF Workbench entry point (stub)
   6) Export/Print summary buttons
--------------------------------------------------------- */

const AW_HOME_MODULE = "./master-index.js";
const AW_FAVORITES_KEY = "antennaWorkbench_favorites_v1";

const AW_TAGS = {
    // HF dipoles & wires
    "hf-fan-dipole": ["HF", "Dipole", "Multiband"],
    "hf-multiband-dipole": ["HF", "Dipole", "Multiband"],
    "hf-ocf-dipole": ["HF", "Dipole", "Off-center"],
    "hf-doublet": ["HF", "Doublet", "Ladder-line", "Multiband"],
    "hf-extended-double-zepp": ["HF", "DX", "Wire"],
    "hf-random-wire": ["HF", "Random", "Portable"],
    "hf-efhw": ["HF", "EFHW", "Multiband", "Portable"],
    "hf-rybakov": ["HF", "Vertical", "Wire"],

    // Loops
    "hf-horizontal-loop": ["HF", "Loop", "NVIS", "Multiband"],
    "hf-fullwave-loop": ["HF", "Loop", "DX"],
    "hf-vertical-delta-loop": ["HF", "Loop", "DX"],
    "hf-quad-loop": ["HF", "Loop", "Beamish"],

    // Verticals
    "hf-quarter-wave-vertical": ["HF", "Vertical", "Simple"],
    "hf-half-wave-vertical": ["HF", "Vertical"],
    "hf-five-eighths-vertical": ["HF", "Vertical", "DX"],
    "hf-loaded-vertical": ["HF", "Vertical", "Compromise"],
    "hf-trap-vertical": ["HF", "Vertical", "Multiband"],
    "hf-multiband-vertical": ["HF", "Vertical", "Multiband"],
    "hf-dx-commander": ["HF", "Vertical", "DX", "Multiband"],
    "hf-passive-radiator-vertical": ["HF", "Vertical", "Passive"],

    // Beams
    "hf-moxon": ["HF", "Beam", "Compact", "DX"],
    "hf-hexbeam": ["HF", "Beam", "Multiband", "DX"],

    // Arrays
    "hf-lazy-h": ["HF", "Array", "Broadside", "DX"],
    "hf-sterba-curtain": ["HF", "Array", "Curtain", "DX"],
    "hf-bobtail-curtain": ["HF", "Array", "Vertical", "DX"],
    "hf-2el-vertical-array": ["HF", "Array", "Vertical", "DX"],
    "hf-phased-verticals": ["HF", "Array", "Vertical", "DX"],

    // NVIS
    "hf-nvis-dipole": ["HF", "NVIS", "Dipole"],
    "hf-nvis-inverted-v": ["HF", "NVIS", "Inverted-V"],
    "hf-nvis-loop": ["HF", "NVIS", "Loop"],
    "hf-nvis-reflector": ["HF", "NVIS", "Reflector"],

    // Designers & tools
    "vertical-designer": ["Designer", "Vertical"],
    "doublet-designer": ["Designer", "Doublet"],
    "nvis-designer": ["Designer", "NVIS"],
    "feedline-calculator": ["Tool", "Feedline"],
    "dx-propagation": ["Tool", "DX"],

    // VHF/UHF (stub entry)
    "vhf-uhf-workbench": ["VHF/UHF", "Workbench"]
};

function awLoadFavorites() {
    try {
        const raw = localStorage.getItem(AW_FAVORITES_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function awSaveFavorites(list) {
    try {
        localStorage.setItem(AW_FAVORITES_KEY, JSON.stringify(list));
    } catch {
        // ignore
    }
}

function awToggleFavorite(id, label) {
    const favs = awLoadFavorites();
    const idx = favs.findIndex(f => f.id === id);
    if (idx >= 0) {
        favs.splice(idx, 1);
    } else {
        favs.unshift({ id, label });
    }
    awSaveFavorites(favs);
    return favs;
}

function awIsFavorite(id) {
    return awLoadFavorites().some(f => f.id === id);
}

function awRenderFavoritesPanel(root) {
    let panel = document.getElementById("aw-favorites-panel");
    if (!panel) {
        panel = document.createElement("div");
        panel.id = "aw-favorites-panel";
        panel.className = "aw-favorites-panel";
        panel.innerHTML = `
            <h3>Favorites</h3>
            <ul class="aw-favorites-list"></ul>
        `;
        root.appendChild(panel);
    }
    const list = panel.querySelector(".aw-favorites-list");
    list.innerHTML = "";
    const favs = awLoadFavorites();
    if (!favs.length) {
        const li = document.createElement("li");
        li.textContent = "(no favorites yet)";
        list.appendChild(li);
        return;
    }
    favs.forEach(f => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.textContent = f.label;
        btn.addEventListener("click", () => {
            awLoadModule(f.id, root);
        });
        li.appendChild(btn);
        list.appendChild(li);
    });
}

function awAttachShell(root, moduleId, moduleLabel) {
    const content = document.querySelector("#content") || root;
    if (!content) return;

    // Wrap existing content in a shell container
    if (!content.querySelector(".aw-shell")) {
        const shell = document.createElement("div");
        shell.className = "aw-shell";

        const header = document.createElement("div");
        header.className = "aw-shell-header";
        header.innerHTML = `
            <div class="aw-shell-left">
                <button id="aw-home-btn">🏠 Home</button>
                <span class="aw-shell-title"></span>
            </div>
            <div class="aw-shell-right">
                <span class="aw-shell-tags"></span>
                <button id="aw-fav-btn" title="Toggle favorite">☆</button>
                <button id="aw-export-btn" title="Export summary">⬇</button>
                <button id="aw-print-btn" title="Print summary">🖨</button>
                <button id="aw-compare-side-btn" title="Side-by-side compare">⇄</button>
                <button id="aw-vhfuhf-btn" title="VHF/UHF Workbench">VHF/UHF</button>
            </div>
        `;

        const body = document.createElement("div");
        body.className = "aw-shell-body";

        // Move existing children into body
        while (content.firstChild) {
            body.appendChild(content.firstChild);
        }

        shell.appendChild(header);
        shell.appendChild(body);
        content.appendChild(shell);
    }

    const titleSpan = content.querySelector(".aw-shell-title");
    const tagsSpan = content.querySelector(".aw-shell-tags");
    const homeBtn = content.querySelector("#aw-home-btn");
    const favBtn = content.querySelector("#aw-fav-btn");
    const exportBtn = content.querySelector("#aw-export-btn");
    const printBtn = content.querySelector("#aw-print-btn");
    const compareSideBtn = content.querySelector("#aw-compare-side-btn");
    const vhfuhfBtn = content.querySelector("#aw-vhfuhf-btn");

    if (titleSpan) {
        titleSpan.textContent = moduleLabel || "Antenna Workbench";
    }

    // Tags
    const tags = AW_TAGS[moduleId] || [];
    if (tagsSpan) {
        tagsSpan.innerHTML = tags.map(t => `<span class="aw-tag">${t}</span>`).join(" ");
    }

    // Home button
    if (homeBtn) {
        homeBtn.onclick = () => {
            import(AW_HOME_MODULE).then(mod => {
                if (typeof mod.default === "function") {
                    mod.default(root);
                }
            });
        };
    }

    // Favorite button
    if (favBtn) {
        const updateFavIcon = () => {
            favBtn.textContent = awIsFavorite(moduleId) ? "★" : "☆";
        };
        updateFavIcon();
        favBtn.onclick = () => {
            awToggleFavorite(moduleId, moduleLabel || moduleId);
            updateFavIcon();
            awRenderFavoritesPanel(document.body);
        };
    }

    // Export summary
    if (exportBtn) {
        exportBtn.onclick = () => {
            const summary = content.querySelector(".summary");
            if (!summary) {
                alert("No summary found to export.");
                return;
            }
            const blob = new Blob([summary.innerText], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${moduleId || "antenna"}-summary.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
    }

    // Print summary
    if (printBtn) {
        printBtn.onclick = () => {
            const summary = content.querySelector(".summary");
            if (!summary) {
                alert("No summary found to print.");
                return;
            }
            const w = window.open("", "_blank", "width=800,height=600");
            if (!w) return;
            w.document.write(`
                <html>
                <head><title>${moduleLabel || "Antenna Summary"}</title></head>
                <body>
                    <h1>${moduleLabel || ""}</h1>
                    <pre>${summary.innerText}</pre>
                </body>
                </html>
            `);
            w.document.close();
            w.focus();
            w.print();
        };
    }

    // Side-by-side compare
    if (compareSideBtn) {
        compareSideBtn.onclick = () => {
            const otherId = prompt("Enter module ID to compare side-by-side (e.g., hf-moxon):", "");
            if (!otherId) return;
            awOpenSideBySide(moduleId, otherId, root);
        };
    }

    // VHF/UHF Workbench entry (stub)
    if (vhfuhfBtn) {
        vhfuhfBtn.onclick = () => {
            awOpenVhfUhfWorkbench(root);
        };
    }

    // Global favorites panel (once)
    awEnsureShellStyles();
    awRenderFavoritesPanel(document.body);
}

function awOpenSideBySide(idA, idB, root) {
    const content = document.querySelector("#content") || root;
    if (!content) return;

    const wrapper = document.createElement("div");
    wrapper.className = "aw-side-by-side-wrapper";
    wrapper.innerHTML = `
        <div class="aw-side-by-side-header">
            <span>Side-by-side: ${idA} ⇄ ${idB}</span>
            <button id="aw-side-close">Close</button>
        </div>
        <div class="aw-side-by-side-columns">
            <div class="aw-side-col" id="aw-side-a"></div>
            <div class="aw-side-col" id="aw-side-b"></div>
        </div>
    `;

    // Clear content and mount wrapper
    content.innerHTML = "";
    content.appendChild(wrapper);

    const colA = wrapper.querySelector("#aw-side-a");
    const colB = wrapper.querySelector("#aw-side-b");
    const closeBtn = wrapper.querySelector("#aw-side-close");

    closeBtn.onclick = () => {
        import(AW_HOME_MODULE).then(mod => {
            if (typeof mod.default === "function") {
                mod.default(root);
            }
        });
    };

    awLoadModule(idA, colA);
    awLoadModule(idB, colB);
}

function awOpenVhfUhfWorkbench(root) {
    const content = document.querySelector("#content") || root;
    if (!content) return;

    content.innerHTML = `
        <section class="tool">
            <h2>VHF/UHF Workbench (Coming Online)</h2>
            <p>This will host 2m/70cm Yagis, Moxons, Slim Jims, J-poles, collinears, and satellite antennas.</p>
            <p>For now, this is a stub entry point wired into the global shell.</p>
            <button id="aw-vhf-back">Back to Home</button>
        </section>
    `;

    const backBtn = content.querySelector("#aw-vhf-back");
    if (backBtn) {
        backBtn.onclick = () => {
            import(AW_HOME_MODULE).then(mod => {
                if (typeof mod.default === "function") {
                    mod.default(root);
                }
            });
        };
    }

    awAttachShell(root, "vhf-uhf-workbench", "VHF/UHF Workbench");
}

function awLoadModule(moduleId, mountRoot) {
    import(`./${moduleId}.js`).then(mod => {
        if (typeof mod.default === "function") {
            mod.default(mountRoot);
            // Try to infer label from document
            const h2 = (document.querySelector("#content") || mountRoot).querySelector("h2");
            const label = h2 ? h2.textContent.trim() : moduleId;
            awAttachShell(mountRoot, moduleId, label);
        }
    }).catch(err => {
        console.error("Failed to load module", moduleId, err);
        alert(`Failed to load module: ${moduleId}`);
    });
}

function awEnsureShellStyles() {
    if (document.getElementById("aw-shell-style")) return;
    const css = `
        .aw-shell {
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .aw-shell-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.3rem 0.5rem;
            background: #f5f5f5;
            border-bottom: 1px solid #ddd;
            gap: 0.5rem;
        }
        .aw-shell-left {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .aw-shell-right {
            display: flex;
            align-items: center;
            gap: 0.3rem;
        }
        .aw-shell-title {
            font-weight: 600;
        }
        .aw-shell-body {
            padding: 0.5rem 0.75rem;
        }
        .aw-tag {
            display: inline-block;
            padding: 0.05rem 0.3rem;
            margin-right: 0.15rem;
            border-radius: 3px;
            background: #e0ecff;
            font-size: 0.75rem;
        }
        #aw-favorites-panel {
            position: fixed;
            right: 0.5rem;
            bottom: 0.5rem;
            width: 220px;
            max-height: 260px;
            overflow: auto;
            background: #ffffff;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 0.4rem 0.5rem;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            font-size: 0.85rem;
            z-index: 9999;
        }
        #aw-favorites-panel h3 {
            margin: 0 0 0.25rem 0;
            font-size: 0.9rem;
        }
        .aw-favorites-list {
            list-style: none;
            padding-left: 0;
            margin: 0;
        }
        .aw-favorites-list li {
            margin-bottom: 0.2rem;
        }
        .aw-favorites-list button {
            width: 100%;
            text-align: left;
            padding: 0.15rem 0.3rem;
            font-size: 0.8rem;
        }
        .aw-side-by-side-wrapper {
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .aw-side-by-side-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.3rem 0.5rem;
            background: #f5f5f5;
            border-bottom: 1px solid #ddd;
            font-size: 0.9rem;
        }
        .aw-side-by-side-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
            padding: 0.5rem;
        }
        .aw-side-col {
            border: 1px solid #eee;
            border-radius: 4px;
            padding: 0.4rem;
            max-height: 80vh;
            overflow: auto;
        }
        @media (max-width: 900px) {
            .aw-side-by-side-columns {
                grid-template-columns: 1fr;
            }
        }
    `;
    const style = document.createElement("style");
    style.id = "aw-shell-style";
    style.textContent = css;
    document.head.appendChild(style);
}

// Auto-hook: if master index is loaded, we don't interfere.
// Individual modules can call awAttachShell via awLoadModule wrapper.
// If you want to globally wrap after any module load, you can call
// awAttachShell from each module after rendering, but this file
// is designed to be used primarily via awLoadModule and the master index.
