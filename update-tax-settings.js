import { createChangeTransferFeeConfigInstruction } from './change_transfer_fee.js';
import {
    Connection,
    Keypair,  
    Transaction,
    clusterApiUrl,
    sendAndConfirmTransaction,
  } from '@solana/web3.js';
import {
    TOKEN_2022_PROGRAM_ID,
    } from '@solana/spl-token';


import dotenv from 'dotenv';
dotenv.config();

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
const payer = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(process.env.PAYER))
  );

const mintAuthority = Keypair.fromSecretKey(
new Uint8Array(JSON.parse(process.env.MINT_AUTHORITY))
);

const transferFeeConfigAuthority = Keypair.fromSecretKey(
new Uint8Array(JSON.parse(process.env.TRANSFER_FEE_CONFIG_AUTHORITY))
);


const mint = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(process.env.MINT_KEYPAIR))
    );


const balance = await connection.getBalance(payer.publicKey);
if (balance < 10000000) { // 0.01 SOL
throw new Error(
    'Not enough SOL in payer account, please fund: ',
    payer.publicKey.toBase58()
);
}


const feeBasisPoints = 6000;

const transferFeeConfig =
createChangeTransferFeeConfigInstruction(
      mint.publicKey, // token mint account
      transferFeeConfigAuthority.publicKey, // authority that can update fees
      feeBasisPoints, // amount of transfer collected as fees
      BigInt(0), // maximum fee to collect on transfers
      TOKEN_2022_PROGRAM_ID // SPL token program id
    );


console.log(transferFeeConfig);

const mintTransaction = new Transaction().add(
    transferFeeConfig
    );
    
const mintTransactionSig = await sendAndConfirmTransaction(
connection,
mintTransaction,
[payer],
undefined
);

console.log(
'Tax Updated!',
`https://solana.fm/tx/${mintTransactionSig}?cluster=devnet-solana`
);


