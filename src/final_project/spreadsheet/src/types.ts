export type CellId = string;
export type CellValue = number | string | boolean | null;
export type CellType = 'number' | 'string' | 'boolean' | 'formula';

export type CellData = {
    raw: string;
    computed: CellValue;
    type: CellType;
}

export type SpreadsheetState = {
    rows: number;
    cols: number;
    colWidths: Record<number, number>;
    rowHeights: Record<number, number>;
    cells: Record<CellId, CellData>;
    select: {start: CellId, end: CellId} | null;
    activeCell: CellId | null;
}

export type Action = | {type: 'SET_CELL', id: CellId, raw: string}
    | {type: 'DELETE_ROW', after: number}
    | {type: 'ADD_ROW', index: number}
    | {type: 'DELETE_COL', after: number}
    | {type: 'ADD_COL', index: number}
    | {type: 'SELECT_CELLS', range: {start: CellId; end: CellId} | null}
    | {type: 'ACTIVE_CELL', id: CellId | null}
    | {type: 'RESIZE_COL', col: number, width: number}
    | {type: 'RESIZE_ROW', row: number, height: number};