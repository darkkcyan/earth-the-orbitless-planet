type Data = [number, number, (ctx: CanvasRenderingContext2D) => void];
const datas: Array<string | Data> = [];

export default {
  add(id: number, w: number, h: number, cb: (ctx: CanvasRenderingContext2D) => void) {
    datas[id] = [w, h, cb];
    return this;
  },

  addSrc(id: number, dataURL: string) {
    datas[id] = dataURL;
  },

  load(cvs: HTMLCanvasElement, cb: (images: HTMLImageElement[]) => void) {
    const ctx = cvs.getContext("2d");
    const images: HTMLImageElement[] = [];
    let numloaded = 0;
    const imageOnloadCallback = () => {
      ++numloaded;
      if (numloaded === datas.length) {
        cb(images);
      }
    };
    for (let i = 0; i < datas.length; ++i) {
      const d = datas[i];
      if (!d) {
        images[i] = null;
        ++numloaded;
        continue;
      }
      images[i] = new Image();
      images[i].onload = imageOnloadCallback;
      if (typeof d === "string") {
        images[i].src = d;
      } else {
        cvs.width = d[0];
        cvs.height = d[1];
        d[2](ctx);
        images[i].src = cvs.toDataURL();
      }
    }
  },
};
