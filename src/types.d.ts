/* eslint-disable */
declare global {
    interface Crypto {
        randomUUID?(): string;
    }
    var Crypto: {
        prototype: Crypto;
        new(): Crypto;
    };
    var crypto: Crypto;
}

export {};
