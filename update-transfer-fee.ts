import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { createChangeTransferFeeConfigInstruction } from './change_transfer_fee';
import {
  Connection,
  Keypair,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

const secretKeyFromString = (envVariable: string | undefined): Uint8Array => {
  if (!envVariable) {
    throw new Error('Environment variable not found');
  }
  return new Uint8Array(JSON.parse(envVariable));
};

const payer = Keypair.fromSecretKey(secretKeyFromString(process.env.PAYER));
const mintAuthority = Keypair.fromSecretKey(secretKeyFromString(process.env.MINT_AUTHORITY));
const transferFeeConfigAuthority = Keypair.fromSecretKey(secretKeyFromString(process.env.TRANSFER_FEE_CONFIG_AUTHORITY));
const mint = Keypair.fromSecretKey(secretKeyFromString(process.env.MINT_KEYPAIR));

(async () => {
  const balance = await connection.getBalance(payer.publicKey);
  if (balance < 10000000) { // 0.01 SOL
    throw new Error(
      `Not enough SOL in payer account, please fund: ${payer.publicKey.toBase58()}`
    );
  }

  const feeBasisPoints = 1000;

  const transferFeeConfig = createChangeTransferFeeConfigInstruction(
    mint.publicKey, // token mint account
    transferFeeConfigAuthority.publicKey, // authority that can update fees
    feeBasisPoints, // amount of transfer collected as fees
    0, // maximum fee to collect on transfers
    TOKEN_2022_PROGRAM_ID // SPL token program id
  );

  console.log(transferFeeConfig);

  const mintTransaction = new Transaction().add(transferFeeConfig);

  const mintTransactionSig = await sendAndConfirmTransaction(
    connection,
    mintTransaction,
    [payer, mint],
    undefined
  );

  console.log(
    'Tax Updated!',
    `https://solana.fm/tx/${mintTransactionSig}?cluster=devnet-solana`
  );
})();
