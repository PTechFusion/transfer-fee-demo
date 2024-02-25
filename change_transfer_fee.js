"use strict";
// Object.defineProperty(exports, "__esModule", { value: true });
// exports.createChangeTransferFeeConfigInstruction = void 0;
// const buffer_layout_1 = require("@solana/buffer-layout");
// const buffer_layout_utils_1 = require("@solana/buffer-layout-utils");
// const spl_token_1 = require("@solana/spl-token");
// const web3_js_1 = require("@solana/web3.js");
// const spl_token_2 = require("@solana/spl-token");


// Into ES Module import statements
import * as buffer_layout_1 from "@solana/buffer-layout";
import * as buffer_layout_utils_1 from "@solana/buffer-layout-utils";
import * as spl_token_1 from "@solana/spl-token";
import * as web3_js_1 from "@solana/web3.js";
import * as spl_token_2 from "@solana/spl-token";

const transferFeeConfigInstructionData = (0, buffer_layout_1.struct)([
    (0, buffer_layout_1.u8)('instruction'),
    (0, buffer_layout_1.u8)('transferFeeInstruction'),
    (0, buffer_layout_1.u16)('transferFeeBasisPoints'),
    (0, buffer_layout_utils_1.u64)('maximumFee'),
]);
export function createChangeTransferFeeConfigInstruction(mint, transferFeeConfigAuthority, transferFeeBasisPoints, maximumFee, programId = spl_token_1.TOKEN_2022_PROGRAM_ID) {
    if (!(0, spl_token_2.programSupportsExtensions)(programId)) {
        throw new spl_token_2.TokenUnsupportedInstructionError();
    }
    const keys = [
        { pubkey: mint, isSigner: false, isWritable: true },
        // Assuming transferFeeConfigAuthority can be null, you should conditionally add this to keys
        ...(transferFeeConfigAuthority ? [{
                pubkey: transferFeeConfigAuthority, isSigner: false, isWritable: false
            }] : []),
        // If transferFeeConfigAuthority is also a signer, it should be added separately with isSigner: true
        // ...(transferFeeConfigAuthority ? [{
        //         pubkey: transferFeeConfigAuthority, isSigner: true, isWritable: false
        //     }] : [])
    ];
    const data = Buffer.alloc(transferFeeConfigInstructionData.span);
    transferFeeConfigInstructionData.encode({
        instruction: spl_token_1.TokenInstruction.TransferFeeExtension,
        transferFeeInstruction: spl_token_1.TransferFeeInstruction.SetTransferFee,
        transferFeeBasisPoints: transferFeeBasisPoints,
        maximumFee: maximumFee,
    }, data);
    return new web3_js_1.TransactionInstruction({ keys, programId, data });
}
// export let createChangeTransferFeeConfigInstruction;
