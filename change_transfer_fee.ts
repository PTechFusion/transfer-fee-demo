import { struct, u16, u8 } from '@solana/buffer-layout';
import { publicKey, u64 } from '@solana/buffer-layout-utils';
import { PublicKey } from '@solana/web3.js';
import { TokenInstruction, TransferFeeInstruction, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { TransactionInstruction } from '@solana/web3.js';
import { programSupportsExtensions, TokenUnsupportedInstructionError } from '@solana/spl-token';
import { AccountMeta } from '@solana/web3.js';


// const instructions_enum = 26
// const transferFeeInstruction_enum = 5

interface transferFeeConfigInstructionData {
    instruction: TokenInstruction.TransferFeeExtension;
    transferFeeInstruction: TransferFeeInstruction.SetTransferFee;
    transferFeeBasisPoints: number;
    maximumFee: bigint;
}


const transferFeeConfigInstructionData = struct<transferFeeConfigInstructionData>([
    u8('instruction'),
    u8('transferFeeInstruction'),
    u16('transferFeeBasisPoints'),
    u64('maximumFee'),
]);

export function createChangeTransferFeeConfigInstruction(
    mint: PublicKey,
    transferFeeConfigAuthority: PublicKey | null,
    transferFeeBasisPoints: number,
    maximumFee: bigint,
    programId = TOKEN_2022_PROGRAM_ID
): TransactionInstruction {
    if (!programSupportsExtensions(programId)) {
        throw new TokenUnsupportedInstructionError();
    }
    const keys: AccountMeta[] = [
        { pubkey: mint, isSigner: false, isWritable: true },
        // Assuming transferFeeConfigAuthority can be null, you should conditionally add this to keys
        ...(transferFeeConfigAuthority ? [{
            pubkey: transferFeeConfigAuthority, isSigner: false, isWritable: false
        }] : []),
        // If transferFeeConfigAuthority is also a signer, it should be added separately with isSigner: true
        ...(transferFeeConfigAuthority ? [{
            pubkey: transferFeeConfigAuthority, isSigner: true, isWritable: false
        }] : [])
    ];

    const data = Buffer.alloc(transferFeeConfigInstructionData.span);
    
    transferFeeConfigInstructionData.encode(
        {
            instruction: TokenInstruction.TransferFeeExtension,
            transferFeeInstruction: TransferFeeInstruction.SetTransferFee,
            transferFeeBasisPoints: transferFeeBasisPoints,
            maximumFee: maximumFee,
        },
        data
    );

    return new TransactionInstruction({ keys, programId, data });
}


