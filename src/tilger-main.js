import initTemplate from "./template-assets/avc-script-template.es.js";
import { initMassSpringDamperAnchorsDemo } from "./msd-anchors-demo.js";

window.addEventListener("DOMContentLoaded", () => {
  initTemplate();

  const msdAnchorDemo = document.getElementById("msd-anchor-demo");
  if (msdAnchorDemo) {
    initMassSpringDamperAnchorsDemo(msdAnchorDemo, {
      bodeTargetId: "MSD_Anchor_middle_Div",
      controlsTargetId: "MSD_Anchor_rightmost_Div",
      timeTargetId: "MSD_Anchor_time_Div",
    });
  }
});
