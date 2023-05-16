/**
 * IMPLEMENTATION FOR MERKLE TREE FOR STORAGE
 * 
 * This merkle tree class is a simple implementation of merkle trees.
 * This class simply takes an array of transactions as a parameter, passes it to buildTree
 * which takes the transaction ids and hashes them repeatedly, building a merkle tree. 
 * 
 */


const crypto = require('crypto');

module.exports = class MerkleTree {
  constructor(transactions) {
    this.tree = [];
    this.buildTree(transactions);
  }

  // Hashes the id of the transaction
  hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Builds the tree by hashing the id of each transaction and pushing it onto the tree.
  // Then repeatedly combining each pair of hashs by concatenating them and hashing the result
  // until only one hash is left. if odd number of hashes, the last one will hash with itself
  buildTree(transactions) {
    
    // Create an array of hashes by using the keys of transaction and h
    let hashes = Array.from(transactions.keys()).map(id => this.hash(id));
    this.tree.push(hashes);
  
    // While there are hashes in the hash array, combine the hashes to build the merkle tree
    while (hashes.length > 1) {
        
        // Store the new hashes in here for each of the levels
        let temp = [];
    
        // Iterate over the hashes array by 2s to combine hashes
        for (let i = 0; i < hashes.length; i += 2) {

            // if there are an even amount of hashes it will concatenate them and hash them together
            if (i + 1 < hashes.length) {
                temp.push(this.hash(hashes[i] + hashes[i + 1]));

            // else if there are an odd number of hashes the last one will hash with itself
            } else {
                temp.push(this.hash(hashes[i] + hashes[i]));
            }
        }
      // stores each level of the hashes in the tree array
      hashes = temp;
      this.tree.push(hashes);
    }
  }

  // Displays the merkle tree in a JSON format, showing each of the levels
  // Level 0 being the leaves, then climbing each level until the root
  display() {

    // create a new treeData array that creates the tree, i being the level of the tree,
    // and level being the hashes contained on each level
    const treeData = this.tree.map((level, i) => ({
        level: i,
        values: level
    }));
    
    // Converts the treeData into a JSON string
    const formattedTreeData = JSON.stringify(treeData, null, 2);

    // print to console
    console.log(formattedTreeData);
  }

  // Get the root hash of the Merkle tree
  getRootHash() {
    return this.tree[this.tree.length - 1][0];
  }
}