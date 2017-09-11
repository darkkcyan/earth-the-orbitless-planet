import ctx, {celm} from "../canvas";
export default function fillWhite() {
  const d = ctx.getImageData(0, 0, celm.width, celm.height);
  for (let i = 0; i < d.data.length; i += 4) {
    if (d.data[i + 3] === 0) {
      continue;
    }
    d.data[i] = d.data[i + 1] = d.data[i + 2] = d.data[i + 3] = 255;
  }
  ctx.putImageData(d, 0, 0);
}
