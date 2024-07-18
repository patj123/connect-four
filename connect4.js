// Player class to handle player properties
class Player {
  constructor(color) {
    this.color = color; // Store the player's color
  }
}

// Class to handle the overall game logic
class Game {
  constructor() {
    // Define a list of colors available for players to choose from
    this.colors = [
      { name: 'Red', value: 'red' },
      { name: 'Blue', value: 'blue' },
      { name: 'Green', value: 'green' },
      { name: 'Yellow', value: 'yellow' },
      { name: 'Orange', value: 'orange' },
      { name: 'Purple', value: 'purple' },
      { name: 'Pink', value: 'pink' },
      { name: 'Brown', value: 'brown' },
      { name: 'Black', value: 'black' }
    ];

    // Get references to the necessary DOM elements
    this.startButton = document.getElementById('start-button');
    this.continueButton = document.getElementById('continue-button');
    this.startOverButton = document.getElementById('start-over-button');
    this.returnHomeButton = document.getElementById('return-home-button');

    this.player1ColorInput = document.getElementById('player1-color');
    this.player2ColorInput = document.getElementById('player2-color');
    this.errorMessage = document.getElementById('error-message');

    // Initialize players
    this.players = [];
    this.currPlayer = null;

    // Add event listeners to the buttons
    this.startButton.addEventListener('click', this.showColorSelectionScreen.bind(this));
    this.continueButton.addEventListener('click', this.validateColors.bind(this));
    this.startOverButton.addEventListener('click', this.showColorSelectionScreen.bind(this));
    this.returnHomeButton.addEventListener('click', this.showStartScreen.bind(this));

    // Populate the color selection dropdowns
    this.populateColorSelections();
  }

  // Show the start screen
  showStartScreen() {
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('color-selection-screen').style.display = 'none';
    document.getElementById('game').style.display = 'none';
  }

  // Show the color selection screen
  showColorSelectionScreen() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('color-selection-screen').style.display = 'flex';
    this.populateColorSelections(); // Repopulate the color selection dropdowns
  }

  // Populate the color selection dropdowns
  populateColorSelections() {
    // Clear existing options
    this.player1ColorInput.innerHTML = '<option value="" selected disabled>Select Color</option>';
    this.player2ColorInput.innerHTML = '<option value="" selected disabled>Select Color</option>';

    this.colors.forEach(color => {
      const option1 = document.createElement('option');
      const option2 = document.createElement('option');
      option1.value = color.value;
      option1.textContent = color.name;
      option2.value = color.value;
      option2.textContent = color.name;
      this.player1ColorInput.appendChild(option1);
      this.player2ColorInput.appendChild(option2);
    });
  }

  // Validate the selected colors
  validateColors() {
    const player1Color = this.player1ColorInput.value;
    const player2Color = this.player2ColorInput.value;

    // Check if both players have selected a color
    if (!player1Color || !player2Color) {
      this.errorMessage.textContent = 'Both players must choose a color.';
    } else if (player1Color === player2Color) {
      // Check if the selected colors are different
      this.errorMessage.textContent = 'Players must choose different colors.';
    } else {
      // Hide the color selection screen and start the game
      this.players = [new Player(player1Color), new Player(player2Color)];
      this.currPlayer = this.players[0];
      document.getElementById('color-selection-screen').style.display = 'none';
      document.getElementById('game').style.display = 'flex';
      new ConnectFourGame(this.players); // Start a new game with selected players
    }
  }
}

// Class to handle the Connect Four game logic
class ConnectFourGame {
  constructor(players) {
    this.WIDTH = 7; // Number of columns in the board
    this.HEIGHT = 6; // Number of rows in the board
    this.players = players; // Array of player objects
    this.currPlayer = this.players[0]; // Active player: Player 1 starts first
    this.gameOver = false; // Track game over state
    this.board = []; // 2D array representing the game board
    this.makeBoard();
    this.makeHtmlBoard();
  }

  // Create the in-JS board structure
  makeBoard() {
    this.board = [];
    for (let y = 0; y < this.HEIGHT; y++) {
      this.board.push(Array.from({ length: this.WIDTH }));
    }
  }

  // Create the HTML table for the game board and column tops
  makeHtmlBoard() {
    const board = document.getElementById('board');
    board.innerHTML = ''; // Clear any existing board

    // Make column tops (clickable area for adding a piece to that column)
    const top = document.createElement('tr');
    top.setAttribute('id', 'column-top');
    top.addEventListener('click', this.handleClick.bind(this));

    for (let x = 0; x < this.WIDTH; x++) {
      const headCell = document.createElement('td');
      headCell.setAttribute('id', x);
      top.append(headCell);
    }

    board.append(top);

    // Make the main part of the board
    for (let y = 0; y < this.HEIGHT; y++) {
      const row = document.createElement('tr');
      for (let x = 0; x < this.WIDTH; x++) {
        const cell = document.createElement('td');
        cell.setAttribute('id', `${y}-${x}`);
        row.append(cell);
      }
      board.append(row);
    }
  }

  // Find the top empty spot in a column
  findSpotForCol(x) {
    for (let y = this.HEIGHT - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }

  // Update the DOM to place a piece into the HTML table of the board
  placeInTable(y, x) {
    const piece = document.createElement('div');
    piece.classList.add('piece');
    piece.style.backgroundColor = this.currPlayer.color;
    piece.style.top = `${-50 * (y + 2)}px`;

    const spot = document.getElementById(`${y}-${x}`);
    spot.append(piece);

    // Trigger the animation
    requestAnimationFrame(() => {
      piece.style.top = '0';
    });
  }

  // Announce the end of the game
  endGame(msg) {
    this.gameOver = true;
    document.getElementById('game-over-message').textContent = msg;
    document.getElementById('game').style.display = 'none';
    document.getElementById('game-over-screen').style.display = 'flex';
  }

  // Handle click of column top to play a piece
  handleClick(evt) {
    if (this.gameOver) return; // Don't allow moves if the game is over

    const x = +evt.target.id; // Get x from ID of clicked cell

    // Get next spot in column (if none, show a message and ignore click)
    const y = this.findSpotForCol(x);
    if (y === null) {
      alert('This column is full. Please choose a different column.');
      return;
    }

    // Place piece in board and add to HTML table
    this.board[y][x] = this.currPlayer;
    this.placeInTable(y, x);

    // Check for win
    if (this.checkForWin()) {
      setTimeout(() => this.endGame(`Player ${this.currPlayer.color} won!`), 500);
      return;
    }

    // Check for tie
    if (this.board.every(row => row.every(cell => cell))) {
      setTimeout(() => this.endGame('Tie!'), 500);
      return;
    }

    // Switch players
    this.currPlayer = this.currPlayer === this.players[0] ? this.players[1] : this.players[0];
  }

  // Check board cell-by-cell for a win
  checkForWin() {
    const _win = cells => {
      // Check four cells to see if they're all color of current player
      return cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < this.HEIGHT &&
          x >= 0 &&
          x < this.WIDTH &&
          this.board[y][x] === this.currPlayer
      );
    };

    for (let y = 0; y < this.HEIGHT; y++) {
      for (let x = 0; x < this.WIDTH; x++) {
        // Get "check list" of 4 cells (starting here) for each of the different ways to win
        const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

        // Find winner (only checking each win-possibility as needed)
        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
        }
      }
    }
    return false;
  }
}

// Initialize the main game object
new Game();

document.getElementById('start-button').addEventListener('click', () => {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('color-selection-screen').style.display = 'flex';
});

document.getElementById('continue-button').addEventListener('click', () => {
  const player1Color = document.getElementById('player1-color').value;
  const player2Color = document.getElementById('player2-color').value;

  if (!player1Color || !player2Color) {
    alert('Both players must choose a color.');
  } else if (player1Color === player2Color) {
    alert('Players must choose different colors.');
  } else {
    const p1 = new Player(player1Color);
    const p2 = new Player(player2Color);
    new Game(p1, p2);
    document.getElementById('color-selection-screen').style.display = 'none';
    document.getElementById('game').style.display = 'flex';
  }
});

document.getElementById('start-over-button').addEventListener('click', () => {
  document.getElementById('game-over-screen').style.display = 'none';
  document.getElementById('color-selection-screen').style.display = 'flex';
  document.getElementById('game').style.display = 'none';
});

document.getElementById('return-home-button').addEventListener('click', () => {
  document.getElementById('game-over-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'flex';
  document.getElementById('game').style.display = 'none';
});