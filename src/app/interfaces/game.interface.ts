export interface GameState {
  board: string[];
  currentPlayer: string;
  winner: string | null;
  isGameOver: boolean;
  players: {
    [key: string]: { symbol: 'X' | 'O'; lastMovePositions: number[] };
  };
  status: 'waiting' | 'in-progress' | 'finished';
  gameId?: string;
  winningCombination?: number[];
  soundPlayed?: boolean;
  botLevel: 'NO-BOT' | 'EASY' | 'MEDIUM' | 'HARD';
}
