import { build, emptyDir } from "https://deno.land/x/dnt@0.28.0/mod.ts";

const outDir = "./dist/npm";

await emptyDir(outDir);

const [version] = Deno.args;
if (!version) {
  throw new Error("a version argument is required to build the npm package");
}

await build({
  entryPoints: ["./main.ts"],
  outDir,
  shims: {
    deno: false,
  },
  test: false,
  typeCheck: false,
  compilerOptions: {
    target: "ES2020",
    sourceMap: true,
  },
  package: {
    // package.json properties
    name: "formulaic",
    version,
    description: "A hacky excel-like formula engine",
    license: "MIT",
    repository: {
      author: "JAForbes",
      type: "git",
      url: "git+https://github.com/JAForbes/formulaic.git",
    },
    bugs: {
      url: "https://github.com/JAForbes/formulaic/issues",
    },
    engines: {
      node: ">= 20",
    },
  }
});

await Deno.copyFile("README.md", `${outDir}/README.md`);