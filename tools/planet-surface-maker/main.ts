const imageInput = document.getElementById("image-input") as HTMLInputElement;
const sourceImage = document.getElementById("image-file") as HTMLImageElement;

const widthInput = document.getElementById("width") as HTMLInputElement;
const heightInput = document.getElementById("height") as HTMLInputElement;

const editorCanvas = document.getElementById("editor") as HTMLCanvasElement;

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
