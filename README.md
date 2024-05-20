# chance games

A decentralized slot machine built using securely-generated random numbers from SUAVE.

**System Dependencies:**

- [bun](https://bun.sh)
- [foundry](https://getfoundry.sh)
- [suave-geth devnet](https://github.com/flashbots/suave-geth/?tab=readme-ov-file#starting-a-local-devnet)

## Quickstart Example

1. Make sure you're running a suave-geth devnet on `http://localhost:8545`.

2. Build smart contracts & install dependencies from NPM:

    ```bash
    forge build
    bun install
    ```

3. Run the example:

    ```bash
    bun run index.ts
    ```

    This will deploy a new slot machine and initialize it with a pot of test ETH. Then we'll pull the slot machine a bunch of times and see if we can win any money.
