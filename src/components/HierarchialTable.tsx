import { useState, useCallback, useMemo } from "react";
import TableRow from "./TableRow";
import './HierarchialTable.css';
const RecursiveTableRow = ({ row, originalData, onValueChange, inputValues, onInputChange, level }: { row: any; originalData: any; onValueChange: (id: any, value: any) => void; inputValues: Record<string, any>; onInputChange: (id: any, value: any) => void, level: number }) => {
    const originalRow = originalData.rows.find((r:any) => r.id === row.id) || originalData.rows.flatMap((r: any) => r.children || []).find((r: any) => r.id === row.id);
    const hasChildren = row.children && row.children.length > 0;
    const rowClassName = level === 1 ? 'row-level-1' : level > 1 ? 'row-level-2' : '';

    return (
      <>
        <TableRow
          row={row}
          originalRow={originalRow}
          onValueChange={onValueChange}
          onInputChange={onInputChange}
          classValue={rowClassName} 
        />
        {hasChildren && (
          row.children.map((child: any) => (
            <RecursiveTableRow
              key={child.id}
              row={child}
              originalData={originalData}
              onValueChange={onValueChange}
              inputValues={inputValues}
              onInputChange={onInputChange}
                level={level + 1} // Increment level for child rows
            />
          ))
        )}
      </>
    );
  }


export default function HierarchicalTable({ data }: { data: any }) {
    const [tableData, setTableData] = useState(data);
    const [originalData] = useState(JSON.parse(JSON.stringify(data))); // Deep copy for original values
    const [inputValues, setInputValues] = useState<Record<string, any>>({});
  
    const calculateSubtotal = useCallback((items: any) => {
      return items ? items.reduce((sum:any, item: any) => {
        const childSum = item.children ? calculateSubtotal(item.children) : 0;
        return sum + (childSum || item.value || 0);
      }, 0) : 0;
    }, []);
  
    const updateParentValues = useCallback((updatedId: any, newValue: any, currentData: any) => {
      if(newValue){}
      const findAndModify = (items: any) => {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.children && item.children.some((child: { id: any; }) => child.id === updatedId)) {
            item.value = calculateSubtotal(item.children);
            return true; // Parent updated
          }
          if (item.children) {
            if (findAndModify(item.children)) {
              item.value = calculateSubtotal(item.children);
              return true; // Ancestor updated
            }
          }
        }
        return false;
      };
  
      const newData = JSON.parse(JSON.stringify(currentData)); // Avoid direct state mutation
      findAndModify(newData.rows);
      return newData;
    }, [calculateSubtotal]);
  
    const distributeValueToChildren = useCallback((parentId: any, newValue: number, currentData: any) => {
      const findItemAndDistribute = (items: string | any[]) => {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.id === parentId && item.children && item.children.length > 0) {
            const totalOriginalValue = item.children.reduce((sum: any, child: { value: any; }) => sum + (child.value || 0), 0);
            item.children.forEach((child: { value: number; }) => {
              const percentage = totalOriginalValue > 0 ? (child.value || 0) / totalOriginalValue : 1 / item.children.length;
              child.value = parseFloat((newValue * percentage).toFixed(2));
            });
            item.value = newValue; // Update parent value
            return true;
          }
          if (item.children) {
            if (findItemAndDistribute(item.children)) {
              return true;
            }
          }
        }
        return false;
      };
  
      const newData = JSON.parse(JSON.stringify(currentData));
      findItemAndDistribute(newData.rows);
      return newData;
    }, []);
  
    const handleValueChange = useCallback((itemId: any, newValue: any) => {
        setTableData((prevData: any) => {
          const newData = JSON.parse(JSON.stringify(prevData));
          let updatedItem: any = null;
    
          const findAndSet = (items: any) => {
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              if (item.id === itemId) {
                item.value = newValue;
                updatedItem = item;
                return true;
              }
              if (item.children) {
                if (findAndSet(item.children)) {
                  return true;
                }
              }
            }
            return false;
          };
    
          if (findAndSet(newData.rows)) {
            if (updatedItem?.children && updatedItem.children.length > 0) {
              return distributeValueToChildren(itemId, newValue, newData);
            } else {
              // If the updated item is a leaf, update its parent values
              return updateParentValues(itemId, newValue, newData);
            }
          }
          return newData;
        });
      }, [updateParentValues, distributeValueToChildren]);
  
    const handleInputChange = useCallback((itemId: any, value: any) => {
      setInputValues(prev => ({ ...prev, [itemId]: value }));
    }, []);


  
    const grandTotal = useMemo(() => {
      return calculateSubtotal(tableData.rows);
    }, [tableData, calculateSubtotal]);

    return (
      <table className="hierarchical-table">
        <thead>
          <tr>
            <th>Label</th>
            <th>Value</th>
            <th>Input</th>
            <th>Allocation %</th>
            <th>Allocation Val</th>
            <th>Variance %</th>
          </tr>
        </thead>
        <tbody>
        {tableData.rows.map((row: any) => (
          <RecursiveTableRow
            key={row.id}
            row={row}
            originalData={originalData}
            onValueChange={handleValueChange}
            inputValues={inputValues}
            onInputChange={handleInputChange}
            level={1}
          />
        ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Grand Total</td>
            <td>{grandTotal.toFixed(2)}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    );
  }