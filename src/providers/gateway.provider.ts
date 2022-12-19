import { Injectable } from '@nestjs/common';
import { Signatures } from 'src/utils/signatures';
import { Constants } from 'src/utils/constants';
import { async } from 'rxjs';
declare function require(name: string);
const Web3 = require('web3');
const url = process.env.PROVIDER_URL || 'http://192.168.215.48:8541';
const web3 = new Web3(url);
const Tx = require('ethereumjs-tx').Transaction;
const Common = require('ethereumjs-common');
const escrow_factory = require('../../abis/EscrowFactory.json');
const escrow = require('../../abis/Escrow.json');

@Injectable()
export class GatewayProvider {
  private readonly chainID = 5;

  constructor(
    private readonly constants: Constants,
    private readonly signatures: Signatures,
    private readonly privateKey,
  ) {}

  sendTransaction = async (
    functionSignature: string,
    functionInputs: any,
    contractAddress: any,
    functionCategory: any,
  ) => {
    try {
      const contractInstance = await this.selectContractInstance(
        functionCategory,
        contractAddress,
      );

      const encoded = await contractInstance.methods[functionSignature](
        ...functionInputs,
      ).encodeABI();

      const rawSerialized = await this._getSignedTransaction(
        encoded,
        this.privateKey,
        contractAddress,
      );
      const finalresult = await web3.eth.sendSignedTransaction(rawSerialized);
      return {
        error: false,
        data: finalresult,
      };
    } catch (error) {
      return { error: true, data: this._handleErrorsB(error) };
    }
  };

  getValue = async (
    functionSignature: string,
    functionInputs: any,
    contractAddress: any,
    functionCategory: any,
  ) => {
    try {
      const contractInstance = await this.selectContractInstance(
        functionCategory,
        contractAddress,
      );

      const zoneAccount = this._getRequestorAccount(this.privateKey);

      const result = await contractInstance.methods[functionSignature](
        ...functionInputs,
      ).call({ from: zoneAccount.address });

      console.log(result);
      // const finalOutput = this.hexToAscii(rawSerialized);
      return {
        error: false,
        data: result,
      };
    } catch (error) {
      return { error: true, data: this._handleErrorsB(error) };
    }
  };

  getMainEventsB = async (
    eventName: string,
    eventCategory: string,
    contractAddress: string,
  ) => {
    try {
      const contractInstance = await this.selectContractInstance(
        eventCategory,
        contractAddress,
      );
      const result = await contractInstance
        .getPastEvents(
          eventName,
          {
            // Using an array means OR: e.g. 20 or 23
            fromBlock: 0,
            toBlock: 'latest',
          },
          function (error, events) {
            console.log(events);
            return { error: false, data: events };
          },
        )
        .then(function (events) {
          console.log(events); // same results as the optional callback above

          return { error: false, data: events };
        })
        .catch((error) => {
          return { error: true, data: error };
        });
      return { error: false, data: result };
    } catch (e) {
      return { error: true, data: this._handleErrors(e) };
    }
  };

  selectContractInstance = async (functionCategory, contractAddress) => {
    switch (functionCategory) {
      case 'escrow': {
        return await new web3.eth.Contract(escrow.abi, contractAddress);
      }
      case 'escrow-factory': {
        return await new web3.eth.Contract(escrow_factory.abi, contractAddress);
      }

      default:
        return await new web3.eth.Contract(escrow_factory.abi, contractAddress);
    }
  };

  _handleErrors = (error) => {
    console.log(error);
    if (typeof error.receipt != 'undefined') {
      if (
        typeof error.receipt.revertReason != 'undefined' &&
        error.receipt.revertReason != null
      ) {
        const output = error.receipt.revertReason.toString();
        console.log(output);
        const resultA = this.hexToAscii(output);
        return resultA.toString();
      }
    } else {
      if (typeof error.data != 'undefined' && error.data != null) {
        if (
          typeof error.data.message != 'undefined' &&
          error.data.message != null
        ) {
          return error.data.message;
        }
      }
    }
    return error;
  };

  hexToAscii = (hexString) => {
    const hex = hexString.toString();
    let str = '';
    for (let n = 0; n < hex.length; n += 2) {
      str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
  };

  _getRequestorAccount = (privateKey) => {
    return web3.eth.accounts.privateKeyToAccount(privateKey);
  };

  _getSignedTransaction = async (encoded, privateKey, contractAddress) => {
    const zoneAccount = this._getRequestorAccount(privateKey);
    const result = await web3.eth
      .getTransactionCount(zoneAccount.address, 'pending')
      .then(async (txCount) => {
        const gasPrice = await web3.eth.getGasPrice();
        const txObj = {
          nonce: web3.utils.toHex(txCount),
          gasPrice: web3.utils.toHex(gasPrice),
          gasLimit: web3.utils.toHex(3000000),
          data: encoded,
          chainId: this.chainID,
          to: contractAddress,
        };

        const custom = Common.default.forCustomChain(
          'mainnet',
          { chainId: this.chainID, name: 'zone-network' },
          'istanbul',
        );
        if (privateKey.substring(0, 2) == '0x') {
          privateKey = privateKey.slice(2);
        }
        const tx = new Tx(txObj, { common: custom });
        const privaten = Buffer.from(privateKey, 'hex');
        tx.sign(privaten);
        const serialized = tx.serialize();
        const rawSerialized = '0x' + serialized.toString('hex');
        return rawSerialized;
      });
    return result;
  };

  _getUnSignedTransaction = async (encoded, privateKey, contractAddress) => {
    try {
      const zoneAccount = this._getRequestorAccount(privateKey);
      const result = await web3.eth
        .getTransactionCount(zoneAccount.address, 'pending')
        .then(async (txCount) => {
          const txObj = {
            from: zoneAccount.address,
            data: encoded,
            chainId: this.chainID,
            to: contractAddress,
          };
          return txObj;
        });
      return result;
    } catch (e) {
      return e;
    }
  };

  _handleErrorsB = (error) => {
    console.log(error);
    if (typeof error.receipt != 'undefined') {
      if (
        typeof error.receipt.revertReason != 'undefined' &&
        error.receipt.revertReason != null
      ) {
        const output = error.receipt.revertReason.toString();
        console.log(output);
        const resultA = this.hexToAscii(output);
        console.log(resultA);
        const resultB = resultA.slice(4);
        const resultC = resultB.replace(/[\u{0000}]/gu, '');
        const resultD = resultC.replace(/^\s+|\s+$/gm, '');
        const resultE = this.encode_utf8(resultD);
        return resultE.toString();
      }
    } else {
      if (typeof error.data != 'undefined' && error.data != null) {
        if (
          typeof error.data.message != 'undefined' &&
          error.data.message != null
        ) {
          return error.data.message;
        } else {
          const output = error.data.toString();
          // console.log(output);
          const resultA = this.hexToAscii(output);
          console.log(resultA);
          const resultB = resultA.slice(10);
          const resultC = resultB.replace(/[\u{0000}]/gu, '');
          const resultD = resultC.replace(/^\s+|\s+$/gm, '');
          const resultE = this.encode_utf8(resultD);
          return resultE.toString();
        }
      }
    }
    return error;
  };

  encode_utf8(s) {
    return unescape(encodeURIComponent(s));
  }

  //peculiar

  checkIfAddressIsStandardAddress = (input) => {
    return web3.utils.isAddress(input);
  };

  getEscrowStatus = async (escrowAddress: string) => {
    const result = await this.getValue(
      this.signatures.GET_ESCROW_STATUS,
      [],
      escrowAddress,
      'escrow',
    );
    return result.data;
  };

  getManifestUrl = async (escrowAddress: string) => {
    const result = await this.getValue(
      this.signatures.GET_ESCROW_STATUS,
      [],
      escrowAddress,
      'escrow',
    );
    return result.data;
  };

  checkIfPaidOut = async (escrowAddress: string) => {
    const result = await this.getValue(
      this.signatures.BULK_PAID,
      [],
      escrowAddress,
      'escrow',
    );
    return result.data;
  };

  getEscrowBalance = async (escrowAddress: string) => {
    const result = await this.getValue(
      this.signatures.ESCROW_BALANCE,
      [],
      escrowAddress,
      'escrow',
    );
    return result.data;
  };
}
