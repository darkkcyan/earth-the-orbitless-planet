const imageInput = document.getElementById("image-input") as HTMLInputElement;
const image = document.getElementById("image-file") as HTMLImageElement;
const widthInput = document.getElementById("width") as HTMLInputElement;
const heightInput = document.getElementById("height") as HTMLInputElement;

imageInput.onchange = (e: Event) => {
  const file = imageInput.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    image.src = reader.result;
  };
  if (file) {
    reader.readAsDataURL(file);
  }
};

function onChangeSize() {
  const list = document.getElementsByTagName("canvas");
  /* tslint:disable prefer-for-of */
  for (let i = 0; i < list.length; ++i) {
    list[i].width = +widthInput.value;
    list[i].height = +heightInput.value;
  }
  /* tslint:enable prefer-for-of */
}

widthInput.onchange = heightInput.onchange = onChangeSize;

// main
document.onreadystatechange = () => {
  onChangeSize();
};
