export class Signatures {
  CREATE_ESCROW_SIGNATURE = 'createEscrow(address[])';
  SETUP_ESCROW_SIGNATURE =
    'setup(address,address,uint256,uint256,string,string)';
  GET_ESCROW_STATUS = 'status()';
  PAY_OUT = 'bulkPayOut(address[],uint256[],string,string,uint256)';
  BULK_PAID = 'bulkPaid()';
  ESCROW_BALANCE = 'getBalance()';
}
