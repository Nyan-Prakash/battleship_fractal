export type Player = "X" | "O";

export type Cell = Player | "Air";

export type Ocean = Cell[][];

export const emptyOcean: Ocean = Array.from({length: 10}, () => (
    Array.from({length: 10})
));


export type Ocean2 = Cell[][];







