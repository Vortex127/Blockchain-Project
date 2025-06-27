import { BaseContract, ContractTransactionResponse } from 'ethers'

interface Flashcard {
  question: string;
  answer: string;
  owner: string;
  timestamp: bigint;
  ipfsCid: string;
}

interface Deck {
  name: string;
  description: string;
  owner: string;
  timestamp: bigint;
  flashcardCids: string[];
  deckCid: string;
}

export type FlashcardVaultContract = BaseContract & {
  addFlashcard: (
    question: string,
    answer: string,
    ipfsCid: string
  ) => Promise<ContractTransactionResponse>

  createDeck: (
    name: string,
    description: string,
    flashcardCids: string[],
    deckCid: string
  ) => Promise<ContractTransactionResponse>

  getFlashcardsByOwner: (
    owner: string
  ) => Promise<Flashcard[]>

  getDecksByOwner: (
    owner: string
  ) => Promise<Deck[]>

  getFlashcardCount: (
    owner: string
  ) => Promise<bigint>

  getDeckCount: (
    owner: string
  ) => Promise<bigint>
}