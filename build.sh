#! /bin/bash
npm exec --no tsc
npm exec --no esbuild -- usePromiseState.ts --platform=neutral --format=cjs --outfile=usePromiseState.dist.js
npm exec --no esbuild -- usePromiseState.ts --platform=browser --format=cjs --target=es2017 --minify --outfile=usePromiseState.dist.min.js
