// Inorder to keep this tool to be simple,
// everythings is in a single file instead of multiple files
//////////////////////////////////////////////////////////////////////////////
import * as dat from "dat-gui";
import {Events} from "../../src/EventListener";
import {gameloop} from "../../src/game";
import genPlanetSurfaceImageData, {
  IPlanetSurface,
  IPlanetSurfaceLayer,
  renderLayer,
} from "../../src/genPlanetSurfaceImageData";
import {clamp} from "../../src/math";
import Planet from "../../src/Planet";

// Function to download data to a file
// Code get from here: https://stackoverflow.com/questions/13405129/javascript-create-and-save-file
////////////////////////////////////////////////////////////////////////////////
function download(data: any, filename: string, type: string) {
    const file = new Blob([data], {type});
    const a = document.createElement("a");
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

const mouse = {
  downX: -1,
  downY: -1,
  x: -1,
  y: -1,
};

function mousePos(e: MouseEvent, elm: HTMLElement, forceInside = false): [number, number] {
  const r = elm.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  if (forceInside && (x < 0 || y < 0 || x > r.width || y > r.height)) {
    return [-1, -1];
  }
  return [x, y];
}

window.addEventListener("mousedown", (e: MouseEvent) => {
  [mouse.downX, mouse.downY] = mousePos(e, editorCanvas, true);
  rerender();
}, false);

window.addEventListener("mousemove", (e: MouseEvent) => {
  [mouse.x, mouse.y] = mousePos(e, editorCanvas);
  rerender(false);
}, false);

window.addEventListener("mouseup", (e: MouseEvent) => {
  if (mouse.downX !== -1 && mouse.downY !== -1) {
    ToolsProcess[Tools[controllObject.tool]]();
    rerender();
  }
  mouse.x = mouse.y = mouse.downX = mouse.downY = -1;
}, false);

// Declare all input and output elements
//////////////////////////////////////////////////////////////////////////////

// tslint:disable object-literal-sort-keys
const editorCanvas = document.getElementById("editor") as HTMLCanvasElement;
const outputImage = document.getElementById("output-image") as HTMLImageElement;
const sampleCanvas = document.getElementById("c") as HTMLCanvasElement;
const hiddenCanvas = document.createElement("canvas");

// Tools enum
//////////////////////////////////////////////////////////////////////////
enum Tools {
  ERASE,
  PEN,
}

function copyIPlanetSurface(a: IPlanetSurface, b: IPlanetSurface) {
  a.background = b.background;
  a.height = b.height;
  a.width = b.width;
  for (let i = 0; i < b.layers.length; ++i) {
    if (!a.layers[i]) {
      a.layers[i] = {
        color: "",
        data: [],
      };
    }
    a.layers[i].color = b.layers[i].color;
    a.layers[i].data.length = b.layers[i].data.length;
    for (let j = 0; j < b.layers[i].data.length; ++j) {
      a.layers[i].data[j] = b.layers[i].data[j];
    }
  }
  a.layers.length = b.layers.length;
}

// The output object
///////////////////////////////////////////////////////////////////////////////
/* tslint:disable prefer-const */
let controllObject = {
  output: ({
    background: "#000000",
    height: 100,
    layers: [{
      color: "#000000",
      data: [[]],
    }],
    width: 200,
  } as IPlanetSurface),
  new() {
    copyIPlanetSurface(this.output, {
      background: "#000000",
      height: 100,
      layers: [{
        color: "#000000",
        data: [[]],
      }],
      width: 200,
    });
    this.fixSelectLayerController();
    this.changeLayer(0);
    for (const i in g.__controllers) {
      if (g.hasOwnProperty(i)) {
        g.__controllers[i].updateDisplay();
      }
    }
    updateCanvasSize();
    rerender();
  },
  loadImage() {
    const sourceImage = document.getElementById("source-image") as HTMLImageElement;
    const t = document.createElement("input");
    t.type = "file";
    t.accept = "image/*";
    t.onchange = () => {
      const file = t.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        sourceImage.src = reader.result;
      };
      if (file) {
        reader.readAsDataURL(file);
      }
    };
    t.click();
  },
  saveData() {
    download(JSON.stringify(this.output), "file.json", "text/json");
  },
  loadData() {
    const t = document.createElement("input");
    t.type = "file";
    t.onchange = () => {
      const file = t.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        copyIPlanetSurface(this.output, JSON.parse(reader.result) as IPlanetSurface);
        this.fixSelectLayerController();
        this.changeLayer(0);
        for (const i in g.__controllers) {
          if (g.hasOwnProperty(i)) {
            g.__controllers[i].updateDisplay();
          }
        }
        updateCanvasSize();
        rerender();
      };
      if (file) {
        reader.readAsText(file);
      }
    };
    t.click();
  },
  doubleSize() {
    this.output.width *= 2;
    this.output.height *= 2;
    updateCanvasSize();
  },
  halfSize() {
    this.output.width >>= 1;
    this.output.height >>= 1;
    updateCanvasSize();
  },
  selectLayerController: [] as dat.GUIController[],
  selectLayerData: [] as boolean[],
  layerColorController: null as dat.GUIController,
  layerNumberOfLineController: null as dat.GUIController,
  getCurrentLayer() {
    return this.selectLayerData.indexOf(true);
  },
  fixSelectLayerController() {
    const layers = this.output.layers;
    const controller = this.selectLayerController;
    const data = this.selectLayerData;
    for (let i = data.length; i < layers.length; ++i) {
      data[i] = false;
      const u = selectLayer.add(this.selectLayerData, "" + i);
      this.selectLayerController[i] = u;
      u.onChange(() => {
        this.changeLayer(i);
      });
    }
    for (let i = layers.length; i < data.length; ++i) {
      selectLayer.remove(this.selectLayerController[i]);
    }
    data.length = controller.length = layers.length;
  },
  changeLayer(i: number) {
    if (i < 0 || i >= this.output.layers.length) {
      return;
    }
    for (let j = 0; j < this.selectLayerData.length; ++j) {
      this.selectLayerData[j] = i === j;
      this.selectLayerController[j].updateDisplay();
    }
    if (this.layerColorController) {
      layerController.remove(this.layerColorController);
    }
    this.layerColorController = layerController.addColor(this.output.layers[i], "color").listen();
    if (this.layerNumberOfLineController) {
      layerController.remove(this.layerNumberOfLineController);
    }
    this.layerNumberOfLineController = layerController
      .add(this.output.layers[i].data, "length", 1, 100)
      .step(1);
    this.layerNumberOfLineController.onChange(() => {
      const t = this.output.layers[i].data;
      for (let j = t.length; j--; ) {
        if (!t[j]) {
          t[j] = [];
        }
      }
      rerender();
    });
    rerender();
  },
  addLayer() {
    const newLayer: IPlanetSurfaceLayer = {
      color: "#000000",
      data: [[]],
    };
    const id = this.output.layers.length;
    this.output.layers.push(newLayer);
    this.fixSelectLayerController();
    this.changeLayer(id);
    rerender();
  },
  removeLayer() {
    let id = this.getCurrentLayer();
    if (id === -1 || this.output.layers.length === 1) {
      return false;
    }
    this.output.layers.splice(id, 1);
    if (id >= this.output.layers.length) {
      id = this.output.layers.length - 1;
    }
    this.fixSelectLayerController();
    this.changeLayer(id);
    rerender();
    return true;
  },
  moveLayerUp() {
    let id = this.getCurrentLayer();
    if (id >= this.output.layers.length - 1) {
      return;
    }
    const l = this.output.layers;
    [l[id], l[id + 1]] = [l[id + 1], l[id]];
    this.changeLayer(id + 1);
    rerender();
  },
  moveLayerDown() {
    let id = this.getCurrentLayer();
    if (id <= 0) {
      return;
    }
    const l = this.output.layers;
    [l[id], l[id - 1]] = [l[id - 1], l[id]];
    this.changeLayer(id - 1);
    rerender();
  },

  tool: Tools[1],
};
function updateCanvasSize() {
  const list = document.getElementsByTagName("canvas");
  /* tslint:disable prefer-for-of */
  for (let i = 0; i < list.length; ++i) {
    list[i].width = controllObject.output.width;
    list[i].height = controllObject.output.height;
  }
  /* tslint:enable prefer-for-of */
  rerender();
  wcontroller.updateDisplay();
  hcontroller.updateDisplay();
}

const g = new dat.GUI();
g.add(controllObject, "loadImage");
g.add(controllObject, "new");
g.add(controllObject, "saveData");
g.add(controllObject, "loadData");
g.addColor(controllObject.output, "background").listen().onChange(rerender);
const wcontroller = g.add(controllObject.output, "width").step(1);
wcontroller.onChange(updateCanvasSize);
const hcontroller = g.add(controllObject.output, "height").step(1);
hcontroller.onChange(updateCanvasSize);
g.add(controllObject, "doubleSize");
g.add(controllObject, "halfSize");
g.add(controllObject, "addLayer");
g.add(controllObject, "removeLayer");
g.add(controllObject, "moveLayerUp");
g.add(controllObject, "moveLayerDown");
g.add(controllObject, "tool", [Tools[0], Tools[1]]);
const layerController = g.addFolder("Layer controller");
const selectLayer = g.addFolder("Select layer");
layerController.open();
selectLayer.open();

controllObject.new();

/* tslint:enable pre-const */

// Update functions
///////////////////////////////////////////////////////////////////////////////

function getToolMousePosition(useToDraw = false) {
  const layerId = controllObject.getCurrentLayer();
  const currentLayer = controllObject.output.layers[layerId];
  const {width, height} = controllObject.output;
  const tw = height / currentLayer.data.length;
  let x1 = clamp(0, mouse.downX, width);
  let x2 = clamp(0, mouse.x, width);
  if (x1 > x2) {
    [x1, x2] = [x2, x1];
  }
  let lineY = Math.floor(mouse.downY / tw);
  if (useToDraw) {
    lineY = lineY * tw + tw / 2;
  } else {
    x1 = Math.floor(x1 / width * 100);
    x2 = Math.floor(x2 / width * 100);
  }
  return [x1, x2, lineY];
}

function rerender(readloadImage = true) {
  const ectx = editorCanvas.getContext("2d");
  const w = controllObject.output.width;
  const h = controllObject.output.height;
  const layerId = controllObject.getCurrentLayer();

  editorCanvas.width ^= 0;
  ectx.save();
  ectx.drawImage(document.getElementById("source-image") as HTMLImageElement, 0, 0, w, h);

  if (layerId !== -1) {
    const currentLayer = controllObject.output.layers[layerId];
    renderLayer(currentLayer, editorCanvas.getContext("2d"), "butt");
    ectx.globalAlpha = 0.5;

    ectx.setLineDash([5, 5]);
    ectx.lineWidth = 2;
    ectx.lineCap = "butt";
    ectx.strokeStyle = "black";
    // draw lines separators
    const tw = h / currentLayer.data.length;
    for (let i = tw; i < h; i += tw) {
      ectx.beginPath();
      ectx.moveTo(0, i);
      ectx.lineTo(w, i);
      ectx.stroke();
    }

    // render drawing line
    if (mouse.downX !== -1 || mouse.downY !== -1) {
      const col = currentLayer.color;
      if (controllObject.tool === Tools[1]) {
        ectx.strokeStyle = col;
      } else {
        ectx.strokeStyle = "#" + (0xFFFFFF - parseInt(col.slice(1), 16)).toString(16);
      }
      ectx.setLineDash([]);
      ectx.lineCap = "butt";
      ectx.lineWidth = tw;

      let [x1, x2, lineY] = getToolMousePosition(true);
      ectx.beginPath();
      ectx.moveTo(x1, lineY);
      ectx.lineTo(x2, lineY);
      ectx.stroke();
    }
  }
  ectx.restore();
  if (readloadImage) {
    outputImage.src = genPlanetSurfaceImageData(controllObject.output, hiddenCanvas);
  }
}


rerender();

function penProcess() {
  const layerId = controllObject.getCurrentLayer();
  if (layerId === -1) {
    return;
  }
  const layer = controllObject.output.layers[layerId];
  const [x1, x2, lineY] = getToolMousePosition();

  let newX1 = x1;
  let newX2 = x2;

  const currentLine = layer.data[lineY] as number[][];
  let newLength = 0;
  for (const lineRange of currentLine) {
    // if new line and one of the old line range is not intersect
    const lrx1 = lineRange[0];
    const lrx2 = lineRange[1];
    if (lrx1 > x2 || lrx2 < x1) {
      currentLine[newLength++] = lineRange;
      continue;
    }
    newX1 = Math.min(newX1, lrx1);
    newX2 = Math.max(newX2, lrx2);
  }
  currentLine.length = newLength;
  currentLine.push([newX1, newX2]);
}

function eraseProcess() {
  const layerId = controllObject.getCurrentLayer();
  if (layerId === -1) {
    return;
  }
  const layer = controllObject.output.layers[layerId];
  const [x1, x2, lineY] = getToolMousePosition();

  let newLength = 0;
  const currentLine = layer.data[lineY] as number[][];
  const newLineRange: number[][] = [];
  for (const lineRange of currentLine) {
    const lrx1 = lineRange[0];
    const lrx2 = lineRange[1];

    if (lrx1 > x2 || lrx2 < x1) {
    // erased line and one of the old line range is not intersect
      currentLine[newLength++] = lineRange;
      continue;
    }

    if (x1 <= lrx1 && lrx2 <= x2) {
    // old line range is inside the erased line
      continue;
    }

    if (lrx1 <= x1 && x2 <= lrx2) {
    // the erased line is inside the old line range
      lineRange[1] = x1;
      newLineRange.push([x2, lrx2]);
    } else if (x1 < lrx1) {
    // the erased line is intersect with the old line range in the leftside
      lineRange[0] = x2;
    } else {
    // the erased line is intersect with the old line range in the right side
      lineRange[1] = x1;
    }

    currentLine[newLength++] = lineRange;
  }
  currentLine.length = newLength;
  currentLine.push(...newLineRange);
}

const ToolsProcess = {
  [Tools.PEN]: penProcess,
  [Tools.ERASE]: eraseProcess,
};


// Output image events
////////////////////////////////////////////////////////////////////////////
let planet: Planet = null;
function updatePlanet() {
  requestAnimationFrame(updatePlanet);
  if (!planet) {
    return ;
  }
  sampleCanvas.width ^= 0;
  planet.x = controllObject.output.width / 2;
  planet.y = controllObject.output.height / 2;
  planet[Events.process]();
  planet[Events.render]();
}

gameloop();

updatePlanet();

outputImage.onload = () => {
  planet = new Planet(outputImage);
};

updateCanvasSize();