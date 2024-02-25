import { Connection, Keypair, clusterApiUrl, PublicKey, Transaction } from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  createAccount,
  mintTo,
  transferCheckedWithFee,
  transferChecked,
  getAssociatedTokenAddressSync
} from '@solana/spl-token';


import { createTransferInstruction } from '@solana/spl-token';
import { sendAndConfirmTransaction } from '@solana/web3.js';




import { addKeypairToEnvFile } from '@solana-developers/node-helpers';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.PAYER || !process.env.MINT_AUTHORITY || !process.env.MINT_KEYPAIR) {
  throw new Error('Necessary keypairs not found, have you run the create-token script?');
}

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  );

function findAssociatedTokenAddress(
    walletAddress,
    tokenMintAddress
) {
    return PublicKey.findProgramAddressSync(
        [
            walletAddress.toBuffer(),
            TOKEN_2022_PROGRAM_ID.toBuffer(),
            tokenMintAddress.toBuffer(),
        ],
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    )[0];
}

let recipientKeypair = ""

if (!process.env.RECIPIENT_KEYPAIR) {
    recipientKeypair = Keypair.generate();
    await addKeypairToEnvFile(recipientKeypair, 'RECIPIENT_KEYPAIR');
}
else {
    recipientKeypair = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(process.env.RECIPIENT_KEYPAIR))
      );
};


const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

const payer = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(process.env.PAYER))
);

const mintAuthority = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(process.env.MINT_AUTHORITY))
);

const mint = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(process.env.MINT_KEYPAIR))
).publicKey;

const balance = await connection.getBalance(payer.publicKey);
if (balance < 10000000) { // 0.01 SOL
  throw new Error(
    'Not enough SOL in payer account, please fund: ',
    payer.publicKey.toBase58()
  );
}

const feeBasisPoints = 65000;
const decimals = 9;

// const owner = Keypair.generate();


let sourceAccount; // Declare sourceAccount at a higher scope

try {
    sourceAccount = await createAccount(
        connection, // connection to use
        payer, // payer of transaction and initialization fee
        mint, // mint for the account
        payer.publicKey, // owner of the new account
        undefined, // optional keypair
        undefined, // options for confirming transaction
        TOKEN_2022_PROGRAM_ID // SPL token program id
    );
} catch (error) {
    // Assuming findAssociatedTokenAddress is an async function, you need to await it or handle it accordingly
    sourceAccount = await findAssociatedTokenAddress(payer.publicKey, mint);
    // Handle the error or log it
    
}

// Now sourceAccount is accessible here


// amount of tokens to mint to the new account
const mintAmount = BigInt(1_000_000_000_000);
await mintTo(
  connection, // connection to use
  payer, // payer of transaction fee
  mint, // mint for the token account
  sourceAccount, // address of account to mint to
  mintAuthority, // minting authority
  mintAmount, // amount to mint
  [], // signing acocunt
  undefined, // options for confirming the transaction
  TOKEN_2022_PROGRAM_ID // SPL token program id
);




let destinationAccount; // Declare sourceAccount at a higher scope

try {
    destinationAccount = await createAccount(
        connection, // connection to use
        payer, // payer of transaction and initialization fee
        mint, // mint for the account
        recipientKeypair.publicKey, // owner of the new account
        undefined, // optional keypair
        undefined, // options for confirming transaction
        TOKEN_2022_PROGRAM_ID // SPL token program id
    );
} catch (error) {
    // Assuming findAssociatedTokenAddress is an async function, you need to await it or handle it accordingly
    destinationAccount = await findAssociatedTokenAddress(recipientKeypair.publicKey, mint);
}

console.log(destinationAccount);
console.log(recipientKeypair.publicKey);
// const destinationAccount = await createAccount(
//   connection, // connection to use
//   payer, // payer of transaction and intialization fee
//   mint, // mint for the account
//   payer.publicKey, // owner of the new account
//   recipientKeypair, // optional keypair
//   undefined, // options for confirming transaction
//   TOKEN_2022_PROGRAM_ID // SPL token program id
// );

// amount of tokens we want to transfer
const transferAmount = BigInt(10_000_000_000);

// the reason why we divide by 10_000 is that 1 basis point is 1/100th of 1% | 0.01%
let fee = (transferAmount * BigInt(feeBasisPoints)) / BigInt(10_000);
if (fee > BigInt(10000000000)) {
  fee = BigInt(10000000000); // Max fee
}



// const transferCheckedWithFeeSig = await transferCheckedWithFee(
//   connection, // connection to use
//   payer, // payer of the transaction fee
//   sourceAccount, // source account
//   mint, // mint for the account
//   destinationAccount, // destination account
//   payer, // owner of the source account
//   transferAmount, // number of tokens to transfer
//   decimals, // number of decimals
//   fee, // expected fee collected for transfer
//   [], // signing accounts
//   undefined, // options for confirming the transaction
//   TOKEN_2022_PROGRAM_ID // SPL token program id
// );
// console.log(
//   'Tokens minted and transferred:',
//   `https://solana.fm/tx/${transferCheckedWithFeeSig}?cluster=devnet-solana`
// );


signature = await transferChecked(
  connection,
  payer,
  sourceAccount,
  mint,
  destinationAccount,
  payer,
  transferAmount,
  9,
  [],
  undefined,
  TOKEN_2022_PROGRAM_ID
)


// const tx = new Transaction();
// tx.add(createTransferInstruction(
//     sourceAccount,
//     destinationAccount,
//     payer.publicKey,
//     transferAmount,
//     undefined,
//     TOKEN_2022_PROGRAM_ID
// ));
// const latestBlockHash = await connection.getLatestBlockhash('confirmed');
// tx.recentBlockhash = await latestBlockHash.blockhash;    
// const signature = await sendAndConfirmTransaction(connection,tx,[payer]);
console.log(
    '\x1b[32m', //Green Text
    `   Transaction Success!🎉`,
    `\n    https://explorer.solana.com/tx/${signature}?cluster=devnet`
);



