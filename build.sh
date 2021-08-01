#! /bin/bash
npm exec --no esbuild -- usePromiseState.ts --platform=neutral --format=cjs --outfile=usePromiseState.js
npm exec --no esbuild -- usePromiseState.ts --platform=browser --format=cjs --target=es2017 --minify --outfile=usePromiseState.min.js
