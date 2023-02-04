export class Cell {
  constructor(row, col) {
    this.row = row;
    this.col = col;

    // Represents which cells are connected.
    // In this context, connected means 'don't have a wall inbetween'.
    this._links = new Set();

    // We cannot know if the cell has neighbors when constructing.
    // This is determined by whoever makes the instace, which in this
    // case is the Grid class.
    this.north = null;
    this.south = null;
    this.west = null;
    this.east = null;
  }

  // Since classes are compared by reference and not by value,
  // we need a way to check if two cells represent the same space
  // in a grid.
  equals(other) {
    if (!other) return false;
    return this.row === other.row && this.col === other.col;
  }

  // Links two cells. In this context, a link is the absence
  // of a wall.
  link(other, bidirectional = true) {
    this._links.add(other);
    if (bidirectional)
      other.link(this, false);
    return this;
  }

  // Unlinks two cells.
  unlink(other, bidirectional = true) {
    this._links.forEach(l => {
      if (l.equals(other))
        this._links.delete(l);
    });
    if (bidirectional)
      other.unlink(this, false);
    return this;
  }

  get links() {
    return this._links;
  }

  get hasAnyLink() {
    return this._links.size !== 0;
  }

  hasLink(other) {
    if (!other) return false;
    for (let link of this._links.values()) {
      if (link.equals(other))
        return true;
    }
    return false;
  }

  // Compute the neighbors of a cell.
  // This takes into consideration edges, so edge cells will have only
  // three neighbors, and corner cells only two.
  get neighbors() {
    const list = [];
    if (this.north) list.push(this.north);
    if (this.south) list.push(this.south);
    if (this.west) list.push(this.west);
    if (this.east) list.push(this.east);
    return list;
  }

  // This is used to use cells as keys in a map.
  _toIndex() {
    return `${this.row} ${this.col}`
  }
}

// A simple wrapper around Set to allow for cell keys.
export class CellMap {
  constructor() {
    this._inner = new Map();
  }

  get size() {
    return this._inner.size;
  }

  set(cell, value) {
    return this._inner.set(cell._toIndex(), value);
  }

  get(cell) {
    return this._inner.get(cell._toIndex());
  }

  delete(cell) {
    return this._inner.delete(cell._toIndex());
  }

  has(cell) {
    return this._inner.has(cell._toIndex());
  }
}
