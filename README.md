# Solv: The All-in-One Wallet Health Hub

Solv is a comprehensive, multi-chain toolkit designed to streamline the management of your crypto wallets. Built with a focus on simplicity and power, Solv provides a suite of essential utilities to clean up, optimize, and supercharge your DeFi activities on Solana, Ethereum, and Polygon.

## Core Features

Solv offers a range of powerful tools to address common wallet management challenges:

-   **Dust Sweeper**: Consolidate small, "dust" token balances from multiple chains (Solana, Ethereum, Polygon) into a useful asset like SOL or ETH.
-   **SOL Refuel**: Running low on gas? Swap small amounts of other tokens directly into SOL to ensure your transactions never get stuck.
-   **Spam Shield**: Safely burn spam NFTs and tokens from your Solana wallet to declutter your portfolio and recover locked SOL from rent fees.
-   **Limit Orders**: Place limit orders on Solana using Jupiter's powerful Trigger API. Buy low and sell high without constant market monitoring.
-   **DCA Wizard**: Automate your investment strategy by setting up recurring buys (Dollar-Cost Averaging) for your favorite Solana tokens.
-   **Pro Trader**: An upcoming feature for advanced users, offering institutional-grade charting and order execution tools.

## Tech Stack

This project is built with a modern, robust, and type-safe technology stack:

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **UI Library**: [React](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **Wallet Integration**:
    -   **Solana**: Solana Wallet Adapter
    -   **EVM**: Wagmi & RainbowKit
-   **DeFi Backend**: [Jupiter API](https://docs.jup.ag/) (for Swaps, Limit Orders, and Recurring Buys on Solana)

## Getting Started

To run the project locally, follow these steps:

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:3000`.

## Operating Modes

Solv is designed with safety in mind and operates in two distinct modes, controlled by a toggle in the header:

-   **Testnet/Devnet Mode**: This is the default mode. All actions are **simulated** using mock data. No real transactions are sent, and no real funds are used. This allows you to safely explore all features of the application.
-   **Mainnet Mode**: In this mode, the application interacts directly with the live blockchains. All transactions are real and will use your actual funds. Always use Mainnet mode with caution.
