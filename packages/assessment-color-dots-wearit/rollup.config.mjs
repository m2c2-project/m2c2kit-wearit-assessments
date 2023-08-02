import esbuild from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";

export default (commandLineArgs) => {
  const isDebug = commandLineArgs.configServe ? true : false;

  let outputFolder = "build";
  if (commandLineArgs.configProd) {
    outputFolder = "dist";
  }

  const finalConfig = [
    {
      input: "./src/index.ts",
      output: [
        {
          file: `./${outputFolder}/index.js`,
          format: "es",
          sourcemap: isDebug,
        },
      ],
      plugins: [
        nodeResolve(),
        esbuild(),
        copy({
          targets: [
            {
              src: "../../node_modules/@m2c2kit/core/assets/",
              dest: outputFolder,
            },
            {
              src: "../../node_modules/@m2c2kit/core/index.html",
              dest: outputFolder,
            },
            {
              src: "../../node_modules/@m2c2kit/assessment-color-dots/assets/*",
              dest: `${outputFolder}/assets/symbol-search`,
            },
          ],
        }),
        commandLineArgs.configServe &&
          serve({
            /**
             * Start development server and automatically open browser with
             *   npm run serve -- --configOpen
             * However, to debug and hit breakpoints, you must launch
             * the browser through vs code.
             */
            open: commandLineArgs.configOpen && true,
            verbose: true,
            contentBase: [`./${outputFolder}`],
            historyApiFallback: true,
            host: "localhost",
            port: 3000,
          }),
        commandLineArgs.configServe &&
          /**
           * Try a shorter delay for quicker reloads, but increase it if
           * the browser reloads before the new build is fully ready.
           */
          livereload({ watch: "build", delay: 250 }),
      ],
    },
  ];

  return finalConfig;
};
