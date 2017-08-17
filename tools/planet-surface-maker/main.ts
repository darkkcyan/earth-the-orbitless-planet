import {IPlanetSurface} from "../../src/genPlanetSurfaceImageData";
const imageInput = document.getElementById("image-input") as HTMLInputElement;
const sourceImage = document.getElementById("image-file") as HTMLImageElement;

const backgroundColorInput = document.getElementById("background-color") as HTMLInputElement;
const widthInput = document.getElementById("width") as HTMLInputElement;
const heightInput = document.getElementById("height") as HTMLInputElement;

const layerSelectInput = document.getElementById("layer") as HTMLSelectElement;
const numberOfLineInput = document.getElementById("number-of-line") as HTMLInputElement;
const layerColorInput = document.getElementById("layer-color") as HTMLInputElement;

const editorCanvas = document.getElementById("editor") as HTMLCanvasElement;

/* tslint:disable prefer-const */
let outputObject: IPlanetSurface = {
  background: "#000000",
  layers: [],
};
/* tslint:enable pre-const */

function updateUI() {
  backgroundColorInput.value = outputObject.background;
  if (layerSelectInput.size < outputObject.layers.length) {
    for (let i = layerSelectInput.size; i < outputObject.layers.length; ++i) {
      const e = document.createElement("option");
      e.innerHTML = "" + i;
      layerSelectInput.appendChild(e);
    }
  } else {
    for (let i = outputObject.layers.length - 1; i >= layerSelectInput.size; --i) {
      layerSelectInput.removeChild(layerSelectInput.lastChild);
    }
  }

  const layerId = layerSelectInput.selectedIndex;
  if (layerId !== -1) {
    const d = outputObject.layers[layerId];
    numberOfLineInput.value = "" + d.data.length;
    layerColorInput.value = d.color;
  }
}

function rerender() {
  const ectx = editorCanvas.getContext("2d");
  const w = +widthInput.value;
  const h = +heightInput.value;
  ectx.clearRect(0, 0, w, h);
  ectx.drawImage(sourceImage, 0, 0, w, h);
}

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

function onChangeSize() {
  const list = document.getElementsByTagName("canvas");
  /* tslint:disable prefer-for-of */
  for (let i = 0; i < list.length; ++i) {
    list[i].width = +widthInput.value;
    list[i].height = +heightInput.value;
  }
  /* tslint:enable prefer-for-of */
  rerender();
}

widthInput.onchange = heightInput.onchange = onChangeSize;

// main
document.onreadystatechange = () => {
  onChangeSize();
};
