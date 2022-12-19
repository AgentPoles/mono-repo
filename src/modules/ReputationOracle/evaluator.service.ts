import { ConsoleLogger, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { GatewayProvider } from 'src/providers/gateway.provider';
import { Constants } from 'src/utils/constants';
import { Signatures } from 'src/utils/signatures';
import { Categories } from 'src/utils/categories';
import { GlobalProvider } from 'src/providers/global.provider';
import internal from 'stream';
import { async } from 'rxjs';

@Injectable()
export class ReputationOracleServices {
  constructor(
    private readonly httpService: HttpService,
    private readonly provider: GatewayProvider,
    private readonly constants: Constants,
    private readonly signatures: Signatures,
    private readonly categories: Categories,
    private readonly globalProvider: GlobalProvider,
  ) {}

  selectWorkersTobePaid = (jobResponses: [], workerAddresses: []) => {
    return [];
  };

  calculateAmountToPayEach = (totalWorkers: number, price: number) => {
    const amount = price / totalWorkers;
    return Math.floor(amount);
  };

  payOut = async (
    escrowAddress: string,
    jobResponses: [],
    workerAddresses: [],
    resultUrl,
    resultHash,
    payout_ref,
  ) => {
    try {
      const eligibleWorkers = this.selectWorkersTobePaid(
        jobResponses,
        workerAddresses,
      );

      const price = await this.provider.getEscrowBalance(escrowAddress);

      if (price < 10) return 'insufficient funds';

      const amountToPay = this.calculateAmountToPayEach(
        eligibleWorkers.length,
        price,
      );

      const a = Array.from(
        { length: eligibleWorkers.length },
        (_, i) => (i = amountToPay),
      );

      this.provider.sendTransaction(
        this.signatures.PAY_OUT,
        [eligibleWorkers, a, resultUrl, resultHash, payout_ref],
        escrowAddress,
        this.categories.ESCROW,
      );
    } catch (error) {}
  };

  confirmPayment = (escrowAddress: string) => {
    try {
      return this.provider.checkIfPaidOut(escrowAddress);
    } catch (error) {}
  };
}
