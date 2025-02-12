/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2024 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
/// <reference types="node" />
import react from '@vitejs/plugin-react';
import { assetResolverPlugin } from '@wroud/vite-plugin-asset-resolver';
import { tscPlugin } from '@wroud/vite-plugin-tsc';
import type { PluginOption } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import { baseHtmlPlugin } from './baseHtmlPlugin.js';
import { copyAssetsPlugin } from './copy-assets/copyAssetsPlugin.js';
import { manualChunks } from './manualChunks.js';

export function baseConfigurationPlugin(mode: string, packageJson: any): PluginOption {
  const isProduction = mode === 'production';
  const envServer = process.env['server'];
  const productVersion = isProduction ? withTimestamp(packageJson.version) : packageJson.version;

  return [
    tscPlugin({
      tscArgs: ['-b'],
      enableOverlay: true,
      prebuild: true,
    }),
    manualChunks(),
    assetResolverPlugin({}),
    baseHtmlPlugin({
      version: productVersion,
      title: packageJson.product?.name || 'CloudBeaver',
      rootUri: '/',
    }),
    copyAssetsPlugin(),
    {
      name: 'base-configuration',
      enforce: 'pre',
      config(config) {
        return {
          ...config,
          root: 'src',
          define: {
            ...config.define,
            _VERSION_: JSON.stringify(productVersion),
            _DEV_: !isProduction,
          },
          server: {
            ...config.server,
            strictPort: true,
            host: 'localhost',
            port: 8080,
            origin: 'http://localhost:8080',
            proxy: {
              '/api': {
                target: envServer,
                changeOrigin: true,
                secure: false,
              },
              '/api/ws': {
                target: envServer?.replace('http:', 'ws:'),
                ws: true,
                rewriteWsOrigin: true,
                secure: false,
              },
            },
          },
          build: {
            ...config.build,
            outDir: '../lib',
            minify: isProduction,
            emptyOutDir: true,
            modulePreload: false,

            rollupOptions: {
              ...config.build?.rollupOptions,
              input: {
                ...(config.build?.rollupOptions?.input as Record<string, string>),
                main: 'src/index.html',
                sso: 'src/sso.html',
                ssoError: 'src/ssoError.html',
              },
            },
          },
        };
      },
    },
    react(),
    isProduction
      ? [
          VitePWA({
            srcDir: '.',
            filename: 'service-worker.ts',
            strategies: 'injectManifest',
            injectRegister: false,
            manifest: false,
            injectManifest: {
              maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
              globIgnores: [
                '**/license.txt',
                '**/*.map',
                '**/manifest.*.js',
                '**/*.{ts,tsx}',
                '**/*.tsbuildinfo',
                '**/.DS_Store',
                '**/*.{svg,png,jpg,gif,jpeg}',
                '**/*.{woff,woff2,eot,ttf,otf}',
              ],
            },
          }),
        ]
      : [],
  ];
}

function withTimestamp(version: string) {
  return `${version}.${new Date().toISOString().substr(0, 19).replace('T', '').split(/[-:]+/).join('').slice(0, -2)}`;
}
