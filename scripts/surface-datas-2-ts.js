// Usage:
// node ./scripts/surface-datas-2-ts.js [path to the folder contains surface datas]
let input = process.argv[2];
if (!input) {
  console.error("Usage");
  console.error("   node ./scripts/surface-datas-2-ts.js [path to the folder contains surface datas]");
  process.exit();
}

let glob = require("glob");
let fs = require("fs");
let path = require("path");

let output = 'import {IPlanetSurface} from "./genPlanetSurfaceImageData";\n';
output += '/* tslint:disable max-line-length object-literal-key-quotes whitespace*/\n'
glob(path.join(input, "*.json"), {}, (err, files) => {
  if (err) {
    throw err;
  }
  for (const name of files) {
    const bname = path.basename(name, ".json");
    const obj = JSON.parse(fs.readFileSync(name, 'utf8')); 
    for (const layer of obj.layers) {
      const fixedData = [];
      let numEmpty = 0;
      for (const d of layer.data) {
        if (!d.length) {
          ++numEmpty;
          continue;
        }
        if (numEmpty) {
          fixedData.push(numEmpty);
        }
        fixedData.push(d);
        numEmpty = 0;
      }
      if (numEmpty) {
        fixedData.push(numEmpty);
      }
      layer.data = fixedData;
    }
    output += `\nexport let ${bname}: IPlanetSurface = ${JSON.stringify(obj)};`;
  }
  console.log(output);
});
