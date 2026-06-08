/* ============================================================
   HF Antenna Designer — Global State Engine
   ============================================================ */

const State = {

    data: {
        currentModule: null,
        parameters: {},
        theme: "light",
        preferences: {}
    },

    setState(key, value) {
        this.data[key] = value;
    },

    getState(key) {
        return this.data[key];
    },

    setParam(name, value) {
        this.data.parameters[name] = value;
    },

    getParam(name) {
        return this.data.parameters[name];
    },

    resetParameters() {
        this.data.parameters = {};
    },

    resetAll() {
        this.data = {
            currentModule: null,
            parameters: {},
            theme: "light",
            preferences: {}
        };
    }
};

export default State;
