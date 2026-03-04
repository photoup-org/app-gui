const { JSDOM } = require("jsdom");
const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
// Just basic math: Right gap
let maskWidth = 1003;
let maskHeight = 624;
// Gap Top Right:
// The curve at x=628.327 to 659.327, y=114.45 to 145.45
// Vertical wall at x=659.327
let tr_width = maskWidth - 659.327;
let tr_width_pct = (tr_width / maskWidth) * 100;
let tr_height = 321.091; // The next gap is at 352, but the curve starts at 321
let tr_height_pct = (tr_height / maskHeight) * 100;

console.log("TR Widthpx:", tr_width, "TR Width%:", tr_width_pct);
console.log("TR Heightpx:", tr_height, "TR Height%:", tr_height_pct);

let bl_width = 343; // x=0 to 343
let bl_height = maskHeight - 385; // y=385 to 624
console.log("BL Widthpx:", bl_width, "BL Width%:", (bl_width / maskWidth) * 100);
console.log("BL Heightpx:", bl_height, "BL Height%:", (bl_height / maskHeight) * 100);
