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
  'copy'
];

const api = {};
NAMES.forEach(function (name) {
  api[name] = function () {
    return ipcRenderer.invoke('api', name, Array.prototype.slice.call(arguments));
  };
});

contextBridge.exposeInMainWorld('api', api);
