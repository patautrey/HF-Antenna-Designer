import flowerpotPanel from "../ui/panels/flowerpot.js";
import dipolePanel from "../ui/panels/dipole.js";
import endFedPanel from "../ui/panels/endFed.js";
import loopPanel from "../ui/panels/loop.js";
import quadPanel from "../ui/panels/quad.js";
import moxonPanel from "../ui/panels/moxon.js";
import verticalYagiPanel from "../ui/panels/verticalYagi.js";
import jPolePanel from "../ui/panels/jPole.js";
import invertedVPanel from "../ui/panels/invertedV.js";
import yagi3Panel from "../ui/panels/yagi3.js";

const app = {
    panels: {
        flowerpot: flowerpotPanel,
        dipole: dipolePanel,
        endFed: endFedPanel,
        loop: loopPanel,
        quad: quadPanel,
        moxon: moxonPanel,
        verticalYagi: verticalYagiPanel,
        jPole: jPolePanel,
        invertedV: invertedVPanel,
        yagi3: yagi3Panel
    }
};

export default app;
