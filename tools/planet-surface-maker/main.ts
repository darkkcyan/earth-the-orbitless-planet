const imageInput = document.getElementById("image-input") as HTMLInputElement;
const image = document.getElementById("image-file") as HTMLImageElement;

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
