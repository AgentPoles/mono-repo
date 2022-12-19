export class Constants {
  HMT_ADDRESS =
    process.env.REACT_APP_HMT_ADDRESS ||
    '0x444c45937D2202118a0FF9c48d491cef527b59dF';
  ESCROW_FACTORY_ADDRESS =
    process.env.REACT_APP_ESCROW_FACTORY_ADDRESS ||
    '0x3FF93a3847Cd1fa62DD9BcfE351C4b6BcCcF10cB';
  REC_ORACLE_ADDRESS =
    process.env.REACT_APP_REC_ORACLE_ADDRESS ||
    '0x61F9F0B31eacB420553da8BCC59DC617279731Ac';
  REP_ORACLE_ADDRESS =
    process.env.REACT_APP_REP_ORACLE_ADDRESS ||
    '0xD979105297fB0eee83F7433fC09279cb5B94fFC6';
  EXCHANGE_ORACLE_ADDRESS =
    process.env.REACT_APP_EXCHANGE_ORACLE_ADDRESS ||
    '0x6b7E3C31F34cF38d1DFC1D9A8A59482028395809';
  RECORDING_ORACLE_STAKE = 10;
  REPUTATION_ORACLE_STAKE = 10;

  //
  TrusteeA = '';
  TrusteeB = '';
  TrusteeC = '';
  TRUSTEES = [this.TrusteeA, this.TrusteeB, this.TrusteeC];

  statusesMap = [
    'Launched',
    'Pending',
    'Partial',
    'Paid',
    'Complete',
    'Cancelled',
  ];
}
