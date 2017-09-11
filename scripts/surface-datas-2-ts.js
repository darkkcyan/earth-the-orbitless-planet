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
      layer.data = layer.data.reduce((ans, cur) => {
        if (cur.length) ans.push(cur);
        else {
          if (!ans.length || typeof ans[ans.length - 1] !== "number") {
            ans.push(0);
          } 
          ans[ans.length - 1]++;
        }
        return ans;
      }, []);
    }
    output += `\nexport let ${bname}: IPlanetSurface = ${JSON.stringify(obj)};`;
  }
  console.log(output);
});
