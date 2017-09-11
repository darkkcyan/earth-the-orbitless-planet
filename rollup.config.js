import sourcemaps from 'rollup-plugin-sourcemaps';
export default {
  entry: "./build/src/main.js",
  dest: "./build/main.compiled.js",
  sourceMap: "inline",
  format: "iife",
  plugins: [
    sourcemaps()
  ],
  globals: {
    dat: "dat",
  },
};