module.exports = {
  "globDirectory": "./",
  "importWorkboxFrom": "local",
  "skipWaiting": true,
  "globIgnores": [
    "images/**/*",
    "node_modules/**/*",
    "package*",
    "workbox-4.2.0",
    "workbox-config.js"
  ],
  "runtimeCaching": [
    {
      "urlPattern": /\.(?:png|gif|jpg|jpeg|svg)$/,
      "handler": "CacheFirst",
      "options": {
        "cacheName": "node_modules/idb",
      }
    }
  ],
  "globPatterns": [
    "**/*.{json,jpg,png,html,js,css}",
    "./node_modules/idb/build/esm/index.js",
    "./node_modules/idb/build/esm/chunk.js",
    "./node_modules/lit-element/**/*.js",
    "./node_modules/lit-html/**/*.js",
  ],
  "swDest": "service-worker.js"
};