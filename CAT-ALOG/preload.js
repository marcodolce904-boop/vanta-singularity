'use strict';

const { contextBridge, ipcRenderer } = require('electron');

const NAMES = [
  'getConfig',
  'chooseDataDir',
  'openDataDir',
  'setPrefix',
  'list',
  'get',
  'save',
  'duplicate',
  'remove',
  'getClassi',
  'saveClassi',
  'getRoot',
  'saveRoot',
  'getGlobalCss',
  'listPresets',
  'getPreset',
  'savePreset',
  'deletePreset',
  'exportItem',
  'exportCss',
  'exportTokens',
  'exportRootFormat',
  'exportAll',
  'importFolder',
  'listVersions',
  'getVersion',
  'backup',
  'restore',
  'exportPng',
  'exportResponsive',
  'listPages',
  'getPage',
  'savePage',
  'duplicatePage',
  'removePage',
  'previewPage',
  'exportPage',
  'getKit',
  'saveKit',
  'exportKit',
  'getSeo',
  'saveSeo',
  'saveTextFile',
  'listAssets',
  'addAssets',
  'removeAsset',
  'renameAsset',
  'copy'
];

const api = {};
NAMES.forEach(function (name) {
  api[name] = function () {
    return ipcRenderer.invoke('api', name, Array.prototype.slice.call(arguments));
  };
});

contextBridge.exposeInMainWorld('api', api);
