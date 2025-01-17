"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
// Copyright 2017-2022 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0
// structs need to be in order

/* eslint-disable sort-keys */
const definitions = {
  types: [{
    // on all versions
    minmax: [0, undefined],
    types: {
      Address: 'MultiAddress',
      LookupSource: 'MultiAddress',
      DataRequest: {
        para_id: 'Option<ParaId>',
        account_id: 'Option<AccountId>',
        requested_block_number: 'BlockNumber',
        processed_block_number: 'Option<BlockNumber>',
        requested_timestamp: 'u128',
        processed_timestamp: 'Option<u128>',
        payload: 'Text',
        feed_name: 'Text',
        is_query: 'bool',
        url: 'Option<Text>'
      }
    }
  }]
};
var _default = definitions;
exports.default = _default;