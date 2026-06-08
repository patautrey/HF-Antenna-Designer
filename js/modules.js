/* ============================================================
   HF Antenna Designer — Module Registry (Lazy Loading)
   ============================================================ */

const ModuleRegistry = {

    modules: {
        "vertical-quarterwave": "/modules/module-vertical-quarterwave.js",
        "vertical-halfwave": "/modules/module-vertical-halfwave.js",
        "vertical-fiveeighths": "/modules/module-vertical-fiveeighths.js",
        "vertical-noradial": "/modules/module-vertical-noradial.js",

        "vertical-loaded": "/modules/module-vertical-loaded.js",
        "vertical-baseloaded": "/modules/module-vertical-baseloaded.js",
        "vertical-centerloaded": "/modules/module-vertical-centerloaded.js",
        "vertical-toploaded": "/modules/module-vertical-toploaded.js",
        "vertical-slinky": "/modules/module-vertical-slinky.js",

        "vertical-yagi2": "/modules/module-vertical-yagi2.js",
        "vertical-yagi3": "/modules/module-vertical-yagi3.js",
        "vertical-moxon": "/modules/module-vertical-moxon.js",

        "vertical-array2": "/modules/module-vertical-array2.js",
        "vertical-array4square": "/modules/module-vertical-array4square.js",
        "vertical-broadside": "/modules/module-vertical-broadside.js",
        "vertical-endfire": "/modules/module-vertical-endfire.js",

        "vertical-deltaloop": "/modules/module-vertical-deltaloop.js",
        "vertical-squareloop": "/modules/module-vertical-squareloop.js",
        "vertical-loopbeam": "/modules/module-vertical-loopbeam.js",

        "vertical-41ft": "/modules/module-vertical-41ft.js",
        "vertical-70percent": "/modules/module-vertical-70percent.js",
        "vertical-rybakov": "/modules/module-vertical-rybakov.js",
        "vertical-dominator": "/modules/module-vertical-dominator.js",
        "vertical-performer": "/modules/module-vertical-performer.js",
        "vertical-foldover": "/modules/module-vertical-foldover.js",
        "vertical-endfed": "/modules/module-vertical-endfed.js",
        "vertical-special-noradial": "/modules/module-vertical-special-noradial.js",
        "vertical-dipole": "/modules/module-vertical-dipole.js"
    },

    getModulePath(name) {
        return this.modules[name] || null;
    }
};

export default ModuleRegistry;
