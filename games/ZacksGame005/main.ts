import { startIslandGame } from "./map";

const canvas = document.createElement("canvas");
canvas.width = 960;
canvas.height = 640;

document.body.style.margin = "0";
document.body.style.background = "#111";
document.body.appendChild(canvas);

startIslandGame(canvas);
