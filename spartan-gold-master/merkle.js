"use strict";

const utils = require('./utils.js');

// Stores transactions in a MerkleTree format.
// The tree will be perfectly balanced.
class MerkleTree {

  // Returns the size
  static calculateSize(numElems) {
    // Calculate a power of 2 at least as large as numElems.
    let n = 1;
    while (n < numElems) {
      n *= 2;
    }
    // We need almost double the space to hold the parent hashes.
    // E.g. if we have 8 transactions, we need to store their 8
    // hashes plus the 7 parent hashes.
    return (n * 2) - 1;
  }

  // Hashes from a node to the Merkle root, or until it does not have
  // the other half of the hash needed to continue to the root.
  static hashToRoot(hashes, i) {
    if (i === 0) return;
    let par = (i-2)/2;
    hashes[par] = utils.hash("" + hashes[i-1] + "," + hashes[i]);

    // Test to see if we are the right subnode.  If so, we can hash
    // with the left subnode to continue one level up.
    if (par%2 === 0) {
      this.hashToRoot(hashes, par);
    }
  }

  constructor(leaves) {
    if (leaves.length === 0) {
      throw new Error('Cannot create Merkle tree with no leaves');
    }

    this.levels = [];
    this.levels.push(leaves);

    while (this.levels[this.levels.length - 1].length > 1) {
      const level = [];
      const levelNodes = this.levels[this.levels.length - 1];

      for (let i = 0; i < levelNodes.length; i += 2) {
        const left = levelNodes[i];
        const right = i + 1 < levelNodes.length ? levelNodes[i + 1] : left;
        const node = hash(left + right);
        level.push(node);
      }

      this.levels.push(level);
    }
  }

  root() {
    return this.levels[this.levels.length - 1][0];
  }

  path(index) {
    if (index < 0 || index >= this.levels[0].length) {
      throw new Error('Index out of bounds');
    }

    const path = [];
    let left = index;

    for (let i = 0; i < this.levels.length - 1; i++) {
      const levelNodes = this.levels[i];
      const right = left % 2 === 0 ? left + 1 : left - 1;
      path.push({ side: left % 2 === 0 ? 'right' : 'left', hash: levelNodes[right] });
      left = Math.floor(left / 2);
    }

    return path;
  }

  verify(index, value, root) {
    const path = this.path(index);
    let hash = value;

    for (let i = 0; i < path.length; i++) {
      const siblingHash = path[i].hash;
      const side = path[i].side;

      if (side === 'left') {
        hash = hash + siblingHash;
      } else {
        hash = siblingHash + hash;
      }

      hash = hash(hash);
    }

    return hash === root;
  }

  // Returns a boolean indicating whether this node is part
  // of the Merkle tree.
  contains(t) {
    let h = utils.hash(t);
    return this.lookup[h] !== undefined;
  }

  // Method to print out the tree, one line per level of the tree.
  // Note that hashes are truncated to 6 characters for the sake
  // of brevity.
  display() {
    let i = 0;
    let nextRow = 0;
    let s = "";

    console.log();

    while (i < this.hashes.length) {
      // Truncating hashes for the sake of readability
      s += this.hashes[i].slice(0,6) + " ";
      if (i === nextRow) {
        console.log(s);
        s = "";
        nextRow = (nextRow+1) * 2;
      }
      i++;
    }
  }
}


exports.MerkleTree = MerkleTree;
