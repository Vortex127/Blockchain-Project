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

    // Mapping from owner to their flashcards
    mapping(address => Flashcard[]) private flashcardsByOwner;
    
    // Events
    event FlashcardCreated(address indexed owner, uint timestamp, string ipfsCid);

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
}