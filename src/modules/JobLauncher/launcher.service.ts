//@dev to remove all console.logs
//@dev to emit name not found
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { GatewayProvider } from 'src/providers/gateway.provider';
import { Constants } from 'src/utils/constants';
import { Signatures } from 'src/utils/signatures';
import { Categories } from 'src/utils/categories';
import { GlobalProvider } from 'src/providers/global.provider';

@Injectable()
export class JobLauncherService {
  constructor(
    private readonly httpService: HttpService,
    private readonly provider: GatewayProvider,
    private readonly constants: Constants,
    private readonly signatures: Signatures,
    private readonly categories: Categories,
    private readonly privateKey,
    private readonly globalProvider: GlobalProvider,
  ) {}

  initializHumanJob = async () => {
    try {
      const result = await this.provider.sendTransaction(
        this.signatures.CREATE_ESCROW_SIGNATURE,
        [this.constants.TRUSTEES],
        this.constants.ESCROW_FACTORY_ADDRESS,
        this.categories.ESCROW_FACTORY,
      );
      return result;
    } catch (error) {
      return { error };
    }
  };

  setUpInitializedJob = async (
    escrowAddress: string,
    manifesUrl: string,
    manifestHash: string,
  ) => {
    if (!this.globalProvider.checkIfIsExistingEscrow(escrowAddress))
      return 'invalid address';

    if (!this.globalProvider.checkIfStringIsNotEmpty(manifesUrl))
      return 'empty manifest url';

    if (!this.globalProvider.checkIfStringIsNotEmpty(manifestHash))
      return 'empty manifest hash';
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
