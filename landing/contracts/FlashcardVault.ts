import { BaseContract, ContractTransactionResponse } from 'ethers'

interface Flashcard {
  question: string;
  answer: string;
  owner: string;
  timestamp: bigint;
  ipfsCid: string;
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
    cid: string
  ) => Promise<ContractTransactionResponse>

  getFlashcardsByOwner: (
    owner: string
  ) => Promise<Flashcard[]>
}