import type { CellCoords, CellData, SelectionRange } from '../../types';
import { getCellId, getRangeLabel } from '../../utils/cellHelpers';

interface Props {
  selectedCell: CellCoords | null;
  selectionRange: SelectionRange | null;
  cellData: CellData | undefined;
  onChange: (id: string, value: string) => void;
}

export const FormulaBar: React.FC<Props> = ({ selectedCell, selectionRange, cellData, onChange }) => {
  const cellId = selectedCell ? getCellId(selectedCell.col, selectedCell.row) : '';
  const label = getRangeLabel(selectionRange) || cellId;
  const value = cellData?.formula ?? cellData?.value ?? '';

  return (
    <div className="formula-bar">
      <span className="cell-address">{label}</span>
      <span className="formula-fx">fx</span>
      <input
        className="formula-input"
        value={value}
        onChange={e => { if (cellId) onChange(cellId, e.target.value); }}
        placeholder="Введите данные или формулу"
      />
    </div>
  );
};