/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2024 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
// import fsExtra from 'fs-extra';
import fs from 'node:path';
// import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
// @ts-ignore
import { DynamicPublicDirectory } from 'vite-multiple-assets';

import { getAssets } from './getAssets.js';

export function copyAssetsPlugin(): Plugin {
  // let rootPath = fileURLToPath(import.meta.url);

  return DynamicPublicDirectory(getAssets(fs.join(process.cwd(), 'package.json')).map(v => `${v}/**`)) as any;
  // return {
  //   name: 'copy-assets',
  //   configResolved(config) {
  //     rootPath = config.root;
  //   },
  //   async buildStart() {
  //     const assets = getAssets(fs.join(rootPath, '..', 'package.json'));

  //     for (const asset of assets) {
  //       fsExtra.copySync(asset, './src/public/', { overwrite: true });
  //     }
  //   },
  // };
}
