import { ConsoleLogger, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { GatewayProvider } from 'src/providers/gateway.provider';
import { Constants } from 'src/utils/constants';
import { Signatures } from 'src/utils/signatures';
import { Categories } from 'src/utils/categories';
import { GlobalProvider } from 'src/providers/global.provider';

@Injectable()
export class RecordingOracleServices {
  constructor(
    private readonly httpService: HttpService,
    private readonly provider: GatewayProvider,
    private readonly constants: Constants,
    private readonly signatures: Signatures,
    private readonly categories: Categories,
    private readonly globalProvider: GlobalProvider,
  ) {}

  submitJobResponse = async (
    jobResponse: [],
    escrowAddress: string,
    workerAddress: string,
  ) => {
    if (jobResponse.length == 0) return 'job response can not be empty';
    if (!this.globalProvider.checkIfIsExistingEscrow(escrowAddress))
      return 'invalid escrow Address';
    if (!this.provider.checkIfAddressIsStandardAddress(workerAddress))
      return 'invalid worker address';
    try {
      const escrowStatus = await this.provider.getEscrowStatus(escrowAddress);
      if (this.constants.statusesMap[escrowStatus] !== 'pending')
        return 'escrow is not active';
      const manifestUrl = await this.provider.getManifestUrl(escrowAddress);
      const { responseLength, totalDemandedResponse } =
        this.globalProvider.getManifestDetails(manifestUrl);

      if (jobResponse.length != responseLength)
        return 'invalid number of responses';

      const totalResponse = await this.globalProvider.storeNewResponse(
        jobResponse,
        workerAddress,
      );

      if (totalResponse == totalDemandedResponse) {
        const { jobresponses, workerAddresses } =
          this.globalProvider.getStoredResponses(escrowAddress);
        this.globalProvider.payOut(
          escrowAddress,
          jobresponses,
          workerAddresses,
        );
      }
    } catch (error) {
      return { error };
    }
  };

  setUpInitializedJob = async (
    escrowAddress: string,
    manifesUrl: string,
    manifestHash: string,
  ) => {
    try {
      await this.provider.sendTransaction(
        this.signatures.SETUP_ESCROW_SIGNATURE,
        [
          this.constants.REPUTATION_ORACLE_STAKE,
          this.constants.REC_ORACLE_ADDRESS,
          this.constants.REPUTATION_ORACLE_STAKE,
          this.constants.RECORDING_ORACLE_STAKE,
          manifesUrl,
          manifestHash,
        ],
        escrowAddress,
        this.categories.ESCROW,
      );
    } catch (error) {}
  };
}
