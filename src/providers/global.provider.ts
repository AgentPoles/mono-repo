import { Injectable } from '@nestjs/common';
import { Signatures } from 'src/utils/signatures';
import { Constants } from 'src/utils/constants';

@Injectable()
export class GlobalProvider {
  constructor(
    private readonly constants: Constants,
    private readonly signatures: Signatures,
    private readonly privateKey,
  ) {}

  //1
  getManifestDetails = (url: string) => {
    return { responseLength: 1, totalDemandedResponse: 2 };
  };

  //2
  storeNewResponse = (jobResponse, workerAddress, escrowAddress) => {
    return 1;
  };

  //3
  getStoredResponses = (escrowAddress) => {
    return { jobresponses: [], workerAddresses: [] };
  };

  payOut = (escrowAddress: string, storedResponses: [], workers: []) => {
    return 1;
  };

  //4
  checkIfIsExistingEscrow = (input) => {
    if (input) return true;
  };

  checkIfStringIsNotEmpty = (input: string) => {
    return input.length > 0 && input != null;
  };

  //5
  checkIfWorkerHadSubmittedAResponse = (
    workerAddress: string,
    escrowAddress: string,
  ) => {
    return true;
  };
}
