# Decentralized Flashcard Memory Vault – Project Guide

A step-by-step guide for building a decentralized flashcard memory vault with blockchain and frontend integration.

---

## 🔧 Tech Stack

* **Frontend**: React.js (or Next.js)
* **Blockchain**: Solidity (Smart Contracts), Hardhat or Foundry
* **Storage**: IPFS (via Web3.Storage or Pinata)
* **Wallet Integration**: MetaMask
* **Optional**: Token reward system with ERC-20

---

## 📁 Folder Structure (Recommended)

```
├── blockchain/
│   ├── contracts/
│   │   └── FlashcardVault.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── test/
│   │   └── FlashcardVault.test.js
│   └── hardhat.config.js
├── frontend/
│   └── (React App)
└── README.md
```

---

## ✅ Step-by-Step Instructions


### Step 2: Write the Smart Contract

1. Inside `blockchain/contracts/`, create `FlashcardVault.sol`:

   * Structure:

     ```solidity
     struct Flashcard {
       string question;
       string answer;
       address owner;
       uint timestamp;
     }
     ```
   * Functions:

     * `addFlashcard(string memory q, string memory a)`
     * `getFlashcardsByOwner(address)`
     * (Optional) Reward tokens for new entries

### Step 3: Deploy the Contract

1. Write a deploy script in `blockchain/scripts/deploy.js`
2. Deploy locally:

   ```bash
   cd blockchain
   npx hardhat node
   npx hardhat run scripts/deploy.js --network localhost
   ```

### Step 4: Frontend Development (React or Next.js)

1.Basic react+vite app exists in \frontend folder already, check it and develop it as needed
   npm install ethers web3.storage
   ```
2. Integrate MetaMask using `ethers.js`

   ```js
   const provider = new ethers.providers.Web3Provider(window.ethereum);
   await provider.send("eth_requestAccounts", []);
   const signer = provider.getSigner();
   ```
3. Connect to smart contract using contract ABI & address

---

### Step 5: IPFS Integration for Flashcards

1. Use Web3.Storage to store question/answer pairs
2. Upload flashcard JSON:

   ```js
   const file = new File([JSON.stringify({ question, answer })], "flashcard.json");
   const cid = await client.put([file]);
   ```
3. Save CID in smart contract

---

### Step 6: UI Components

* Add/Edit Flashcard
* View My Flashcards
* Flashcard Flip View (Memory Quiz)
* Connect Wallet Button

---

### Step 7: Optional Token Rewards

* Deploy an ERC-20 Token
* Mint tokens when flashcards are added
* Display token balance on UI

---

### Step 8: Final Testing

* Write unit tests using Hardhat’s `chai`
* Test UI using mock wallet accounts
* Simulate data loss and retrieval via IPFS

---
---

## 🧠 Tips for Success

* Keep UI clean and intuitive
* Make flashcard retrieval quick using indexed mappings
* Avoid storing large data directly on-chain

Let me know if you'd like boilerplate code to help your agent get started faster!
