// Inorder to keep this tool to be simple,
// everythings is in a single file instead of multiple files
//////////////////////////////////////////////////////////////////////////////
import genPlanetSurfaceImageData, {
  IPlanetSurface,
  IPlanetSurfaceLayer,
  renderLayer,
} from "../../src/genPlanetSurfaceImageData";

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

// Declare all input and output elements
//////////////////////////////////////////////////////////////////////////////
const imageInput = document.getElementById("image-input") as HTMLInputElement;
const sourceImage = document.getElementById("source-image") as HTMLImageElement;

const saveButton = document.getElementById("save") as HTMLButtonElement;

const backgroundColorInput = document.getElementById("background-color") as HTMLInputElement;
const widthInput = document.getElementById("width") as HTMLInputElement;
const heightInput = document.getElementById("height") as HTMLInputElement;

const layerSelectInput = document.getElementById("layer-select") as HTMLSelectElement;

const addLayerButton = document.getElementById("add-layer") as HTMLButtonElement;
const deleteCurrentLayerButton = document.getElementById("del-layer") as HTMLButtonElement;
const moveLayerUpButton = document.getElementById("move-layer-up") as HTMLButtonElement;
const moveLayerDownButton = document.getElementById("move-layer-down") as HTMLButtonElement;

const numberOfLinesInput = document.getElementById("number-of-lines") as HTMLInputElement;
const layerColorInput = document.getElementById("layer-color") as HTMLInputElement;
const toolButton = document.getElementById("tool-button") as HTMLButtonElement;

const editorCanvas = document.getElementById("editor") as HTMLCanvasElement;

const outputImage = document.getElementById("output-image") as HTMLImageElement;
const hiddenCanvas = document.createElement("canvas");

// Tools enum
//////////////////////////////////////////////////////////////////////////
enum Tools {
  ERASE,
  PEN,
}

// The output object
///////////////////////////////////////////////////////////////////////////////
/* tslint:disable prefer-const */
let outputObject: IPlanetSurface = {
  background: "#000000",
  height: 100,
  layers: [],
  width: 200,
};
/* tslint:enable pre-const */

// Update functions
///////////////////////////////////////////////////////////////////////////////
function updateUI() {
  // Update size
  const list = document.getElementsByTagName("canvas");
  widthInput.value = "" + outputObject.width;
  heightInput.value = "" + outputObject.height;
  /* tslint:disable prefer-for-of */
  for (let i = 0; i < list.length; ++i) {
    list[i].width = outputObject.width;
    list[i].height = outputObject.height;
  }
  /* tslint:enable prefer-for-of */

  // Update background color
  backgroundColorInput.value = outputObject.background;

  // Update layer input elements
  const layerCount = layerSelectInput.children.length;
  const currentLayerId = layerSelectInput.selectedIndex;
  if (layerCount <= outputObject.layers.length) {
    for (let i = layerCount; i < outputObject.layers.length; ++i) {
      const e = document.createElement("option");
      e.innerHTML = "" + i;
      layerSelectInput.appendChild(e);
    }
  } else {
    for (let i = layerCount; i > outputObject.layers.length; --i) {
      layerSelectInput.removeChild(layerSelectInput.lastChild);
    }
    if (currentLayerId >= outputObject.layers.length) {
      layerSelectInput.selectedIndex = outputObject.layers.length - 1;
    }
  }

  if (currentLayerId !== -1) {
    const d = outputObject.layers[currentLayerId];
    numberOfLinesInput.value = "" + d.data.length;
    layerColorInput.value = d.color;
  }

  // Update editor canvas
  rerender();

  // Update output image
  outputImage.src = genPlanetSurfaceImageData(outputObject, hiddenCanvas);
}

function rerender() {
  const ectx = editorCanvas.getContext("2d");
  const w = outputObject.width;
  const h = outputObject.height;
  const layerId = layerSelectInput.selectedIndex;

  ectx.save();
  ectx.clearRect(0, 0, w, h);
  ectx.drawImage(sourceImage, 0, 0, w, h);

  if (layerId !== -1) {
    const currentLayer = outputObject.layers[layerId];
    renderLayer(currentLayer, editorCanvas, "butt");
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
      if (toolButton.innerHTML === Tools[1]) {
        ectx.strokeStyle = col;
      } else {
        ectx.strokeStyle = "#" + (0xFFFFFF - parseInt(col.slice(1), 16)).toString(16);
      }
      ectx.setLineDash([]);
      ectx.lineCap = "butt";
      ectx.lineWidth = tw;

      const lineY = Math.floor(mouse.downY / tw) * tw + tw / 2;
      let x1 = mouse.downX;
      let x2 = mouse.x;
      if (x1 > x2) {
        [x1, x2] = [x2, x1];
      }
      if (x1 < 0) {
        x1 = 0;
      }
      if (x2 > w) {
        x2 = w;
      }

      ectx.beginPath();
      ectx.moveTo(x1, lineY);
      ectx.lineTo(x2, lineY);
      ectx.stroke();
    }
  }
  ectx.restore();
}

function penProcess() {
  const layerId = layerSelectInput.selectedIndex;
  if (layerId === -1) {
    return;
  }
  const layer = outputObject.layers[layerId];
  const tw = outputObject.height / layer.data.length;
  const lineY = Math.floor(mouse.downY / tw);
  let x1 = mouse.downX;
  let x2 = mouse.x;
  if (x1 > x2) {
    [x1, x2] = [x2, x1];
  }
  if (x1 < 0) {
    x1 = 0;
  }
  if (x2 > outputObject.width) {
    x2 = outputObject.width;
  }

  // The line range in layer.data is integer number in range [0, 100], represents the percentage.
  // So x1 and x2 are converted to percentage.
  x1 = Math.round((x1 / outputObject.width) * 100);
  x2 = Math.round((x2 / outputObject.width) * 100);

  let newX1 = x1;
  let newX2 = x2;

  const currentLine = layer.data[lineY];
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
  const layerId = layerSelectInput.selectedIndex;
  if (layerId === -1) {
    return;
  }
  const layer = outputObject.layers[layerId];
  const tw = outputObject.height / layer.data.length;
  const lineY = Math.floor(mouse.downY / tw);
  let x1 = mouse.downX;
  let x2 = mouse.x;
  if (x1 > x2) {
    [x1, x2] = [x2, x1];
  }
  if (x1 < 0) {
    x1 = 0;
  }
  if (x2 > outputObject.width) {
    x2 = outputObject.width;
  }

  // The line range in layer.data is integer number in range [0, 100], represents the percentage.
  // So x1 and x2 are converted to percentage.
  x1 = Math.round((x1 / outputObject.width) * 100);
  x2 = Math.round((x2 / outputObject.width) * 100);

  let newLength = 0;
  const currentLine = layer.data[lineY];
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

// Editor canvas events
///////////////////////////////////////////////////////////////////////////////////
const mouse = {
  downX: -1,
  downY: -1,
  x: -1,
  y: -1,
};

function mousePos(e: MouseEvent, elm: HTMLElement): [number, number] {
  const r = elm.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  return [x, y];
}

editorCanvas.onmousedown = (e: MouseEvent) => {
  [mouse.x, mouse.y] = [mouse.downX, mouse.downY] = mousePos(e, editorCanvas);
  updateUI();
  console.log("down", mouse);
};

editorCanvas.onmousemove = (e: MouseEvent) => {
  [mouse.x, mouse.y] = mousePos(e, editorCanvas);
  updateUI();
  console.log("move", mouse);
};

editorCanvas.onmouseup = (e: MouseEvent) => {
  [mouse.x, mouse.y] = mousePos(e, editorCanvas);
  ToolsProcess[Tools[toolButton.innerHTML]]();
  mouse.x = mouse.y = mouse.downX = mouse.downY = -1;
  updateUI();
  console.log("up", mouse);
};

// Image input event
///////////////////////////////////////////////////////////////////////////////////
imageInput.onchange = (e: Event) => {
  const file = imageInput.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    sourceImage.src = reader.result;
  };
  if (file) {
    reader.readAsDataURL(file);
  }
};
sourceImage.onload = rerender;

// Background color input event
////////////////////////////////////////////////////////////////////////////////////
backgroundColorInput.onchange = () => {
  outputObject.background = backgroundColorInput.value;
  updateUI();
};

// Load and save event
///////////////////////////////////////////////////////////////////////////////////
saveButton.onclick = () => {
  download(JSON.stringify(outputObject), "file.json", "text/json");
};

// Size changing event
////////////////////////////////////////////////////////////////////////////////////
function onChangeSize() {
  outputObject.width = +widthInput.value;
  outputObject.height = +heightInput.value;
  updateUI();
}

widthInput.onchange = heightInput.onchange = onChangeSize;

// Layer controller events
//////////////////////////////////////////////////////////////////////////////////////
layerSelectInput.onchange = updateUI;

addLayerButton.onclick = () => {
  outputObject.layers.push({
    color: "#000000",
    data: [[]],
  });
  updateUI();
  layerSelectInput.selectedIndex = outputObject.layers.length - 1;

  // call the second time since the selectedIndex is change
  updateUI();
  console.log(outputObject);
};

deleteCurrentLayerButton.onclick = () => {
  const layerId = layerSelectInput.selectedIndex;
  if (layerId === -1) {
    return;
  }
  outputObject.layers.splice(layerId, 1);
  updateUI();
  console.log(outputObject);
};

moveLayerUpButton.onclick = () => {
  const layerId = layerSelectInput.selectedIndex;
  const nextId = layerId + 1;
  if (layerId === -1 || nextId === outputObject.layers.length) {
    return;
  }
  const oo = outputObject;
  [oo.layers[layerId], oo.layers[nextId]] = [oo.layers[nextId], oo.layers[layerId]];

  layerSelectInput.selectedIndex = nextId;
  updateUI();
  console.log(outputObject);
};

moveLayerDownButton.onclick = () => {
  const layerId = layerSelectInput.selectedIndex;
  const previousId = layerId - 1;
  if (layerId === -1 || previousId === -1) {
    return;
  }

  const oo = outputObject;
  [oo.layers[layerId], oo.layers[previousId]] = [oo.layers[previousId], oo.layers[layerId]];

  layerSelectInput.selectedIndex = previousId;
  updateUI();
  console.log(outputObject);
};

numberOfLinesInput.onchange = () => {
  const layerId = layerSelectInput.selectedIndex;
  if (layerId === -1) {
    setTimeout(() => numberOfLinesInput.value = "1", 0);
    return;
  }
  const layer = outputObject.layers[layerId];
  const newLineNum = +numberOfLinesInput.value;
  if (newLineNum < layer.data.length) {
    layer.data.length = newLineNum;
  } else {
    for (let i = layer.data.length; i < newLineNum; ++i) {
      layer.data.push([]);
    }
  }
  updateUI();
  console.log(outputObject);
};

layerColorInput.onchange = () => {
  const layerId = layerSelectInput.selectedIndex;
  if (layerId === -1) {
    return;
  }
  outputObject.layers[layerId].color = layerColorInput.value;
  updateUI();
  console.log(outputObject);
};

toolButton.onclick = () => {
  const currentTool = Tools[toolButton.innerHTML];
  toolButton.innerHTML = Tools[currentTool ^ 1];
};

// Output image events
////////////////////////////////////////////////////////////////////////////
outputImage.onload = () => {
  // currently nothing to do
};

// main
////////////////////////////////////////////////////////////////////////////
document.onreadystatechange = () => {
  updateUI();
};
