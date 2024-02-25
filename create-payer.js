import {
    Keypair,
  } from '@solana/web3.js';
import { addKeypairToEnvFile } from '@solana-developers/node-helpers';


// Next, we create and fund the payer account
const payer = Keypair.generate();
console.log('Payer address:', payer.publicKey.toBase58());
await addKeypairToEnvFile(payer, 'PAYER');