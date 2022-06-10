"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defaults = require("@polkadot/extension-base/defaults");

var _SubscribableStore = _interopRequireDefault(require("@polkadot/extension-koni-base/stores/SubscribableStore"));

// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0
class CurrentAccountStore extends _SubscribableStore.default {
  constructor() {
    super(_defaults.EXTENSION_PREFIX ? `${_defaults.EXTENSION_PREFIX}current_account` : null);
  }

}

exports.default = CurrentAccountStore;