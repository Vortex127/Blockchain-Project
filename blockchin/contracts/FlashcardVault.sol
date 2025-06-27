// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract FlashcardVault {
    struct Flashcard {
        string question;
        string answer;
        address owner;
        uint timestamp;
        string ipfsCid; // Store IPFS CID for the flashcard content
    }

    struct Deck {
        string name;
        string description;
        address owner;
        uint timestamp;
        string[] flashcardCids; // Array of IPFS CIDs for flashcards in this deck
        string deckCid; // IPFS CID for the deck metadata
    }

    // Mapping from owner to their flashcards
    mapping(address => Flashcard[]) private flashcardsByOwner;
    
    // Mapping from owner to their decks
    mapping(address => Deck[]) private decksByOwner;
    
    // Events
    event FlashcardCreated(address indexed owner, uint timestamp, string ipfsCid);
    event DeckCreated(address indexed owner, uint timestamp, string name, string deckCid);

    // Add a new flashcard
    function addFlashcard(string memory _question, string memory _answer, string memory _ipfsCid) public {
        Flashcard memory newFlashcard = Flashcard({
            question: _question,
            answer: _answer,
            owner: msg.sender,
            timestamp: block.timestamp,
            ipfsCid: _ipfsCid
        });
        
        flashcardsByOwner[msg.sender].push(newFlashcard);
        
        emit FlashcardCreated(msg.sender, block.timestamp, _ipfsCid);
    }

    // Get all flashcards for a specific owner
    function getFlashcardsByOwner(address _owner) public view returns (Flashcard[] memory) {
        return flashcardsByOwner[_owner];
    }

    // Get total number of flashcards for an owner
    function getFlashcardCount(address _owner) public view returns (uint) {
        return flashcardsByOwner[_owner].length;
    }

    // Create a new deck
    function createDeck(
        string memory _name, 
        string memory _description, 
        string[] memory _flashcardCids, 
        string memory _deckCid
    ) public {
        Deck memory newDeck = Deck({
            name: _name,
            description: _description,
            owner: msg.sender,
            timestamp: block.timestamp,
            flashcardCids: _flashcardCids,
            deckCid: _deckCid
        });
        
        decksByOwner[msg.sender].push(newDeck);
        
        emit DeckCreated(msg.sender, block.timestamp, _name, _deckCid);
    }

    // Get all decks for a specific owner
    function getDecksByOwner(address _owner) public view returns (Deck[] memory) {
        return decksByOwner[_owner];
    }

    // Get total number of decks for an owner
    function getDeckCount(address _owner) public view returns (uint) {
        return decksByOwner[_owner].length;
    }
}