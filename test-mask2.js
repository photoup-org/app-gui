const { JSDOM } = require("jsdom");
const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);

// Let's compute Top Right Card absolute % positions
// Base width 1003, height 624.
let cx = 1003, cy = 624;

// The card occupying the gap ending at (659.327, 321) -> (690.327, 352.091)
// So its left edge is exactly 659.327. 
// Its bottom edge is exactly 352.091.
// Its right edge is 1003 (unless it has a margin? The mask goes to 971, then curves to 1002 at y=383. But the top right card might just go to right=0).
// Let's check the Right boundary of the mask: The mask is 1003px wide.

let tr_left = 659.327;
let tr_bottom = 352.091;
let tr_top = 0;
let tr_width = cx - tr_left;
let tr_height = tr_bottom - tr_top; // 352

console.log("TR Card Left%:", (tr_left / cx * 100).toFixed(4) + "%");
console.log("TR Card Top%:", (tr_top / cy * 100).toFixed(4) + "%");
console.log("TR Card Width%:", (tr_width / cx * 100).toFixed(4) + "%");
console.log("TR Card Height%:", (tr_height / cy * 100).toFixed(4) + "%");

// Bottom Left Card
// Inverted corner: (343, 416.95) to (312, 385.95)
// This means the gap has top-right perfectly fitting.
// The Right Edge of the gap is 343.
// The Top Edge of the gap is 385.95.
// Left edge is 0. Bottom edge is 624.
let bl_right = 343;
let bl_top = 385.95;
let bl_width = bl_right;
let bl_height = cy - bl_top;

console.log("BL Card Left%: 0%");
console.log("BL Card Bottom%: 0%");
console.log("BL Card Width%:", (bl_width / cx * 100).toFixed(4) + "%");
console.log("BL Card Height%:", (bl_height / cy * 100).toFixed(4) + "%");

// What about the other gap? 
// Between x=256 and x=628, there's a horizontal line at y=114.
// Its left curve is (225, 83) to (256, 114).
// Its right curve is (628, 114) to (659, 145).
// Bounding box of this hole: Top=0, Bottom=114. Left=225, Right=659.
// But the user only has Top-Right and Bottom-Left cards.
