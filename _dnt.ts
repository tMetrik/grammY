import { build, emptyDir } from "jsr:@deno/dnt@0.41.1";
import config from "./deno.json" with { type: "json" };

const { version, name } = config;
await emptyDir("./dist");

await build({
  entryPoints: ["mod.ts"],
  outDir: "./dist",
  typeCheck: false,
  test: true,
  shims: {},
  compilerOptions: {
    lib: ["ESNext", "DOM", "ESNext.AsyncIterable"],
  },
  packageManager: "pnpm",
  package: {
    name,
    version,
    description: "tMetrik for grammY",
    author: "Roj <rojvv@icloud.com>",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/tMetrik/grammY.git",
    },
  },
  mappings: {
    "https://deno.land/x/grammy@v1.30.0/mod.ts": {
      name: "grammy",
      version: "^1.30.0",
      peerDependency: true,
    },
    "https://deno.land/x/grammy@v1.30.0/types.ts": {
      name: "grammy",
      version: "^1.30.0",
      subPath: "types",
      peerDependency: true,
    },
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "dist/LICENSE");
    Deno.copyFileSync("README.md", "dist/README.md");
  },
});
