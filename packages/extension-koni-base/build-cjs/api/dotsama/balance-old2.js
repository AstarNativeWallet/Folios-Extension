"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFreeBalance = getFreeBalance;
exports.subscribeBalance = subscribeBalance;
exports.subscribeEVMBalance = subscribeEVMBalance;

var _rxjs = require("rxjs");

var _web = _interopRequireDefault(require("web3"));

var _KoniTypes = require("@polkadot/extension-base/background/KoniTypes");

var _apiHelper = require("@polkadot/extension-koni-base/api/dotsama/api-helper");

var _registry = require("@polkadot/extension-koni-base/api/dotsama/registry");

var _balance = require("@polkadot/extension-koni-base/api/web3/balance");

var _web2 = require("@polkadot/extension-koni-base/api/web3/web3");

var _handlers = require("@polkadot/extension-koni-base/background/handlers");

var _constants = require("@polkadot/extension-koni-base/constants");

var _utils = require("@polkadot/extension-koni-base/utils/utils");

var _util = require("@polkadot/util");

var _utilCrypto = require("@polkadot/util-crypto");

/* eslint-disable header/header */

/* eslint-disable no-inner-declarations */

/* eslint-disable @typescript-eslint/no-floating-promises */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unused-vars */
// Copyright 2019-2022 @polkadot/extension-koni-base authors & contributors
// SPDX-License-Identifier: Apache-2.0
// console.log('Arth TEST 123456!!!!');
// import { DeriveBalancesAll } from '@polkadot/api-derive/types';
console.log('ethereumChains: ');
console.log(_apiHelper.ethereumChains);
console.log('moonbeamBaseChains: ');
console.log(_apiHelper.moonbeamBaseChains); // async function getBalanceAstarEvm (networkKey: string) {
//   //  let address: string = '0x3908f5b9f831c1e74C0B1312D0f06126a58f4Ac0';
//   // let address: string = '0x46ebddef8cd9bb167dc30878d7113b7e168e6f06';
//   let wssURL = '';
//   if (networkKey === 'astarEvm') {
//     wssURL = 'wss://rpc.astar.network';
//   } else if (networkKey === 'shidenEvm') {
//     wssURL = 'wss://rpc.shiden.astar.network';
//   } else if (networkKey === 'shibuyaEvm') {
//     wssURL = 'wss://rpc.shibuya.astar.network';
//   }
//   const ss58Address = 'ZM24FujhBK3XaDsdkpYBf4QQAvRkoMq42aqrUQnxFo3qrAw'; // test address
//   const address = u8aToHex(addressToEvm(ss58Address));
//   const web3 = new Web3(new Web3.providers.WebsocketProvider(wssURL));
//   const balance = await web3.eth.getBalance(address);
//   console.log('Arth await balance: ' + networkKey + ', SS58:' + ss58Address + ' -> H160:' + address + ', ' + balance);
//   return balance;
// }
// getBalanceAstarEvm('astarEvm');
// getBalanceAstarEvm('shibuyaEvm');
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// @ts-ignore

console.log('Arth TEST 123456!!!!');
/*
function subscribeWithDerive (addresses: string[], networkKey: string, networkAPI: ApiProps, callback: (networkKey: string, rs: BalanceItem) => void) {
  const freeMap: Record<string, BN> = {};
  const reservedMap: Record<string, BN> = {};
  const miscFrozenMap: Record<string, BN> = {};
  const feeFrozenMap: Record<string, BN> = {};

  const unsubProms = addresses.map((address) => {
    return networkAPI.api.derive.balances?.all(address, (balance: DeriveBalancesAll) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      freeMap[address] = balance.freeBalance?.toBn() || new BN(0);
      reservedMap[address] = balance.reservedBalance?.toBn() || new BN(0);
      miscFrozenMap[address] = balance.frozenMisc?.toBn() || new BN(0);
      feeFrozenMap[address] = balance.frozenFee?.toBn() || new BN(0);

      const balanceItem = {
        state: APIItemState.READY,
        free: sumBN(Object.values(freeMap)).toString(),
        reserved: sumBN(Object.values(reservedMap)).toString(),
        miscFrozen: sumBN(Object.values(miscFrozenMap)).toString(),
        feeFrozen: sumBN(Object.values(feeFrozenMap)).toString()
      } as BalanceItem;

      callback(networkKey, balanceItem);
    });
  });

  return async () => {
    const unsubs = await Promise.all(unsubProms);

    unsubs.forEach((unsub) => {
      unsub && unsub();
    });
  };
}
*/

function subscribeERC20Interval(addresses, networkKey, api, originBalanceItem, callback) {
  let tokenList = {};
  const ERC20ContractMap = {};
  const tokenBalanceMap = {};

  const getTokenBalances = () => {
    Object.values(tokenList).map(async _ref => {
      let {
        decimals,
        symbol
      } = _ref;
      let free = new _util.BN(0);

      try {
        const contract = ERC20ContractMap[symbol];
        const bals = await Promise.all(addresses.map(address => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
          return contract.methods.balanceOf(address).call();
        }));
        free = (0, _utils.sumBN)(bals.map(bal => new _util.BN(bal || 0))); // console.log('TokenBals', symbol, addresses, bals, free);

        tokenBalanceMap[symbol] = {
          reserved: '0',
          frozen: '0',
          free: free.toString(),
          decimals
        };
      } catch (err) {
        console.log('There is problem when fetching ' + symbol + ' token balance', err);
      }
    });
    originBalanceItem.children = tokenBalanceMap;
    callback && callback(networkKey, originBalanceItem);
  };

  (0, _registry.getRegistry)(networkKey, api).then(_ref2 => {
    let {
      tokenMap
    } = _ref2;
    tokenList = Object.values(tokenMap).filter(_ref3 => {
      let {
        erc20Address
      } = _ref3;
      return !!erc20Address;
    });
    tokenList.forEach(_ref4 => {
      let {
        erc20Address,
        symbol
      } = _ref4;

      if (erc20Address) {
        ERC20ContractMap[symbol] = (0, _web2.getERC20Contract)(networkKey, erc20Address);
      }
    });
    getTokenBalances();
  }).catch(console.error);
  const interval = setInterval(getTokenBalances, _constants.MOONBEAM_REFRESH_BALANCE_INTERVAL);
  return () => {
    clearInterval(interval);
  };
}

function subscribeTokensBalance(addresses, networkKey, api, originBalanceItem, callback, includeMainToken) {
  let forceStop = false;

  let unsubAll = () => {
    forceStop = true;
  };

  originBalanceItem.children = originBalanceItem.children || {};
  (0, _registry.getRegistry)(networkKey, api).then(_ref5 => {
    let {
      tokenMap
    } = _ref5;

    if (forceStop) {
      return;
    }

    let tokenList = Object.values(tokenMap);

    if (!includeMainToken) {
      tokenList = tokenList.filter(t => !t.isMainToken);
    }

    if (tokenList.length > 0) {
      console.log('Get tokens balance of', networkKey, tokenList);
    }

    const unsubList = tokenList.map(_ref6 => {
      let {
        decimals,
        specialOption,
        symbol
      } = _ref6;
      const observable = new _rxjs.Observable(subscriber => {
        // Get Token Balance
        // @ts-ignore
        const apiCall = api.query.tokens.accounts.multi(addresses.map(address => [address, options]), balances => {
          const tokenBalance = {
            reserved: (0, _utils.sumBN)(balances.map(b => b.reserved || new _util.BN(0))).toString(),
            frozen: (0, _utils.sumBN)(balances.map(b => b.frozen || new _util.BN(0))).toString(),
            free: (0, _utils.sumBN)(balances.map(b => b.free || new _util.BN(0))).toString(),
            decimals
          };
          subscriber.next(tokenBalance);
        });
      });
      const options = specialOption || {
        Token: symbol
      };
      return observable.subscribe({
        next: childBalance => {
          if (includeMainToken && tokenMap[symbol].isMainToken) {
            originBalanceItem.state = _KoniTypes.APIItemState.READY;
            originBalanceItem.free = childBalance.free;
            originBalanceItem.reserved = childBalance.reserved;
            originBalanceItem.feeFrozen = childBalance.frozen;
          } else {
            // @ts-ignore
            originBalanceItem.children[symbol] = childBalance;
          }

          callback(originBalanceItem);
        }
      });
    });

    unsubAll = () => {
      unsubList.forEach(unsub => {
        unsub && unsub.unsubscribe();
      });
    };
  }).catch(console.error);
  return unsubAll;
}

function subscribeWithAccountMulti(addresses, networkKey, networkAPI, callback) {
  const balanceItem = {
    state: _KoniTypes.APIItemState.PENDING,
    free: '0',
    reserved: '0',
    miscFrozen: '0',
    feeFrozen: '0',
    children: undefined
  }; // @ts-ignore

  let unsub;

  if (!['kintsugi', 'interlay', 'kintsugi_test'].includes(networkKey)) {
    unsub = networkAPI.api.query.system.account.multi(addresses, balances => {
      let [free, reserved, miscFrozen, feeFrozen] = [new _util.BN(0), new _util.BN(0), new _util.BN(0), new _util.BN(0)];
      balances.forEach(balance => {
        var _balance$data, _balance$data$free, _balance$data2, _balance$data2$reserv, _balance$data3, _balance$data3$miscFr, _balance$data4, _balance$data4$feeFro;

        free = free.add(((_balance$data = balance.data) === null || _balance$data === void 0 ? void 0 : (_balance$data$free = _balance$data.free) === null || _balance$data$free === void 0 ? void 0 : _balance$data$free.toBn()) || new _util.BN(0));
        reserved = reserved.add(((_balance$data2 = balance.data) === null || _balance$data2 === void 0 ? void 0 : (_balance$data2$reserv = _balance$data2.reserved) === null || _balance$data2$reserv === void 0 ? void 0 : _balance$data2$reserv.toBn()) || new _util.BN(0));
        miscFrozen = miscFrozen.add(((_balance$data3 = balance.data) === null || _balance$data3 === void 0 ? void 0 : (_balance$data3$miscFr = _balance$data3.miscFrozen) === null || _balance$data3$miscFr === void 0 ? void 0 : _balance$data3$miscFr.toBn()) || new _util.BN(0));
        feeFrozen = feeFrozen.add(((_balance$data4 = balance.data) === null || _balance$data4 === void 0 ? void 0 : (_balance$data4$feeFro = _balance$data4.feeFrozen) === null || _balance$data4$feeFro === void 0 ? void 0 : _balance$data4$feeFro.toBn()) || new _util.BN(0));
      });
      balanceItem.state = _KoniTypes.APIItemState.READY;
      balanceItem.free = free.toString();
      balanceItem.reserved = reserved.toString();
      balanceItem.miscFrozen = miscFrozen.toString(); // balanceItem.feeFrozen = feeFrozen.toString();

      callback(networkKey, balanceItem);
    });
  }

  async function getBalanceAstarEvm(_networkKey) {
    const wssURL = 'wss://rpc.astar.network';
    const ss58Address = addresses[0]; // 'ZM24FujhBK3XaDsdkpYBf4QQAvRkoMq42aqrUQnxFo3qrAw'; // test address

    const address = (0, _util.u8aToHex)((0, _utilCrypto.addressToEvm)(ss58Address));
    const web3 = new _web.default(new _web.default.providers.WebsocketProvider(wssURL));
    balanceItem.feeFrozen = await web3.eth.getBalance(address);
    console.log('Arth subscribeWithAccountMulti');
  }

  if (networkKey === 'astar') {
    getBalanceAstarEvm('astar');
  } else {// eslint-disable-next-line @typescript-eslint/no-unsafe-call
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    // balanceItem.feeFrozen = feeFrozen.toString();
  }

  let unsub2;

  if (['bifrost', 'acala', 'karura'].includes(networkKey)) {
    unsub2 = subscribeTokensBalance(addresses, networkKey, networkAPI.api, balanceItem, balanceItem => {
      callback(networkKey, balanceItem);
    });
  } else if (['kintsugi', 'interlay', 'kintsugi_test'].includes(networkKey)) {
    unsub2 = subscribeTokensBalance(addresses, networkKey, networkAPI.api, balanceItem, balanceItem => {
      callback(networkKey, balanceItem);
    }, true);
  } else if (_apiHelper.moonbeamBaseChains.indexOf(networkKey) > -1) {
    unsub2 = subscribeERC20Interval(addresses, networkKey, networkAPI.api, balanceItem, callback);
  }

  return async () => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    unsub && (await unsub)();
    unsub2 && unsub2();
  };
}

function subscribeEVMBalance(networkKey, api, addresses, callback) {
  const balanceItem = {
    state: _KoniTypes.APIItemState.PENDING,
    free: '0',
    reserved: '0',
    miscFrozen: '0',
    feeFrozen: '0'
  };

  function getBalance() {
    (0, _balance.getEVMBalance)(networkKey, addresses).then(balances => {
      balanceItem.free = (0, _utils.sumBN)(balances.map(b => new _util.BN(b || '0'))).toString();
      balanceItem.state = _KoniTypes.APIItemState.READY;
      callback(networkKey, balanceItem);
    }).catch(console.error);
  }

  getBalance();
  const interval = setInterval(getBalance, _constants.ASTAR_REFRESH_BALANCE_INTERVAL);
  const unsub2 = subscribeERC20Interval(addresses, networkKey, api, balanceItem, callback);
  return () => {
    clearInterval(interval);
    unsub2 && unsub2();
  };
}

function subscribeBalance(addresses, dotSamaAPIMap, callback) {
  const [substrateAddresses, evmAddresses] = (0, _utils.categoryAddresses)(addresses);
  return Object.entries(dotSamaAPIMap).map(async _ref7 => {
    let [networkKey, apiProps] = _ref7;
    const networkAPI = await apiProps.isReady;
    const useAddresses = _apiHelper.ethereumChains.indexOf(networkKey) > -1 ? evmAddresses : substrateAddresses;

    if (networkKey === 'astarEvm' || networkKey === 'shidenEvm') {
      return subscribeEVMBalance(networkKey, networkAPI.api, useAddresses, callback);
    }

    if (!useAddresses || useAddresses.length === 0 || _constants.IGNORE_GET_SUBSTRATE_FEATURES_LIST.indexOf(networkKey) > -1) {
      // Return zero balance if not have any address
      const zeroBalance = {
        state: _KoniTypes.APIItemState.READY,
        free: '0',
        reserved: '0',
        miscFrozen: '0',
        feeFrozen: '0'
      };
      callback(networkKey, zeroBalance);
      return undefined;
    } // eslint-disable-next-line @typescript-eslint/no-misused-promises


    return subscribeWithAccountMulti(useAddresses, networkKey, networkAPI, callback);
  });
}

async function getFreeBalance(networkKey, address, token) {
  const apiProps = await _handlers.dotSamaAPIMap[networkKey].isReady;
  const api = apiProps.api;

  if (token) {
    const tokenInfo = await (0, _registry.getTokenInfo)(networkKey, api, token);

    if (!(tokenInfo !== null && tokenInfo !== void 0 && tokenInfo.isMainToken)) {
      if (_apiHelper.moonbeamBaseChains.indexOf(networkKey) > -1 && tokenInfo !== null && tokenInfo !== void 0 && tokenInfo.erc20Address) {
        const contract = (0, _web2.getERC20Contract)(networkKey, tokenInfo.erc20Address); // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access

        const free = await contract.methods.balanceOf(address).call(); // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return

        return (free === null || free === void 0 ? void 0 : free.toString()) || '0';
      } else {
        var _balance$free;

        // @ts-ignore
        const balance = await api.query.tokens.accounts(address, (tokenInfo === null || tokenInfo === void 0 ? void 0 : tokenInfo.specialOption) || {
          Token: token
        });
        return ((_balance$free = balance.free) === null || _balance$free === void 0 ? void 0 : _balance$free.toString()) || '0';
      }
    }
  }

  if (networkKey === 'kintsugi') {
    var _api$derive$balances, _balance$freeBalance;

    const balance = await ((_api$derive$balances = api.derive.balances) === null || _api$derive$balances === void 0 ? void 0 : _api$derive$balances.all(address));
    return ((_balance$freeBalance = balance.freeBalance) === null || _balance$freeBalance === void 0 ? void 0 : _balance$freeBalance.toString()) || '0';
  } else {
    var _balance$data5, _balance$data5$free;

    const balance = await api.query.system.account(address);
    return ((_balance$data5 = balance.data) === null || _balance$data5 === void 0 ? void 0 : (_balance$data5$free = _balance$data5.free) === null || _balance$data5$free === void 0 ? void 0 : _balance$data5$free.toString()) || '0';
  }
}