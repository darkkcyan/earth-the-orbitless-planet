// Inorder to keep this tool to be simple,
// everythings is in a single file instead of multiple files
//////////////////////////////////////////////////////////////////////////////
import genPlanetSurfaceImageData, {
  IPlanetSurface,
  renderLayer,
} from "../../src/genPlanetSurfaceImageData";

// Declare all input and output elements
//////////////////////////////////////////////////////////////////////////////
const imageInput = document.getElementById("image-input") as HTMLInputElement;
const sourceImage = document.getElementById("source-image") as HTMLImageElement;

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

  ectx.clearRect(0, 0, w, h);
  ectx.drawImage(sourceImage, 0, 0, w, h);

  if (layerId !== -1) {
    const currentLayer = outputObject.layers[layerId];
    renderLayer(currentLayer, editorCanvas);

    ectx.setLineDash([5, 5]);
    ectx.lineWidth = 3;
    ectx.lineCap = "butt";
    // draw lines separators
    const tw = h / currentLayer.data.length;
    for (let i = tw; i < h; i += tw) {
      ectx.beginPath();
      ectx.moveTo(0, i);
      ectx.lineTo(w, i);
      ectx.stroke();
    }
  }
}

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

  let t = outputObject.layers[layerId];
  outputObject.layers[layerId] = outputObject.layers[nextId];
  outputObject.layers[nextId] = t;

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

  let t = outputObject.layers[layerId];
  outputObject.layers[layerId] = outputObject.layers[previousId];
  outputObject.layers[previousId] = t;

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
