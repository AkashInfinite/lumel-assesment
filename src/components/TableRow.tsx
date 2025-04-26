import { useMemo, useState } from "react";
import './TableRow.css';

export default function TableRow({ row, originalRow, onValueChange, onInputChange, classValue } : { row: any, originalRow: any, onValueChange: (id: string, value: number) => void, onInputChange: (id: string, value: string) => void, classValue: string }) {
    const [inputValue, setInputValue] = useState('');
    const variance = useMemo(() => {
      if (originalRow?.value && row.value) {
        const diff = row.value - originalRow.value;
        return `${((diff / originalRow.value) * 100).toFixed(2)}%`;
      }
      return '0%';
    }, [row.value, originalRow?.value]);

    const handleInputChange = (event: any) => {
      setInputValue(event.target.value);
      onInputChange(row.id, event.target.value);
    };
  
    const handleAllocationPercent = () => {
      const percentage = parseFloat(inputValue);
      if (!isNaN(percentage)) {
        onValueChange(row.id, row.value * (1 + percentage / 100));
        setInputValue('');
      }
    };
  
    const handleAllocationValue = () => {
      const newValue = parseFloat(inputValue);
      if (!isNaN(newValue)) {
        onValueChange(row.id, newValue);
        setInputValue('');
      }
    };
  
    return (
      <tr className={classValue}>
        <td>{row.label}</td>
        <td>{row.value}</td>
        <td>
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
          />
        </td>
        <td>
          <button className="button-3" onClick={handleAllocationPercent}>Allocation %</button>
        </td>
        <td>
          <button className="button-4" onClick={handleAllocationValue}>Allocation Val</button>
        </td>
        <td>{variance}</td>
      </tr>
    );
  }