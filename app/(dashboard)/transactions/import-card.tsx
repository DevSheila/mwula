import { format, parse, isValid, parseISO } from "date-fns";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { convertAmountToMiliunits } from "@/lib/utils";

import { ImportTable } from "./import-table";

const dateFormat = "yyyy-MM-dd HH:mm:ss";
const simpleDateFormat = "yyyy-MM-dd";
const outputFormat = "yyyy-MM-dd";

const requiredOptions = ["amount", "date", "payee"];

type SelectedColumnsState = {
  [key: string]: string | null;
};

type ImportCardProps = {
  data: string[][];
  onCancel: () => void;
  onSubmit: (data: any) => void;
};

export const ImportCard = ({ data, onCancel, onSubmit }: ImportCardProps) => {
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumnsState>(
    {}
  );

  const headers = data[0];
  const body = data.slice(1);

  const onTableHeadSelectChange = (
    columnIndex: number,
    value: string | null
  ) => {
    setSelectedColumns((prev) => {
      const newSelectedColumns = { ...prev };

      for (const key in newSelectedColumns) {
        if (newSelectedColumns[key] === value) {
          newSelectedColumns[key] = null;
        }
      }

      if (value === "skip") value = null;

      newSelectedColumns[`column_${columnIndex}`] = value;

      return newSelectedColumns;
    });
  };

  const progress = Object.values(selectedColumns).filter(Boolean).length;

  const handleContinue = () => {
    const getColumnIndex = (column: string) => {
      return column.split("_")[1];
    };

    // map headers and body to the selected fields and set non-selected fields to null.
    const mappedData = {
      headers: headers.map((_header, index) => {
        const columnIndex = getColumnIndex(`column_${index}`);

        return selectedColumns[`column_${columnIndex}`] || null;
      }),
      body: body
        .map((row) => {
          const transformedRow = row.map((cell, index) => {
            const columnIndex = getColumnIndex(`column_${index}`);

            return selectedColumns[`column_${columnIndex}`] ? cell : null;
          });

          return transformedRow.every((item) => item === null)
            ? []
            : transformedRow;
        })
        .filter((row) => row.length > 0),
    };

    // convert it to array of objects so that it can be inserted into database.
    const arrayOfData = mappedData.body.map((row) => {
      console.log('Processing row:', row);
      console.log('Headers:', mappedData.headers);
      
      const processedRow = row.reduce((acc: any, cell, index) => {
        const header = mappedData.headers[index];
        
        if (header !== null) {
          // Ensure we're getting the cell value and it's properly trimmed
          const value = cell !== null ? cell.toString().trim() : '';
          acc[header] = value;
        }
        
        return acc;
      }, {});
      
      console.log('Processed row:', processedRow);
      return processedRow;
    });

    // format currency and date to match it with database
    const skippedRows: Array<{ index: number; reason: string }> = [];
    const validRows: any[] = [];

    arrayOfData.forEach((item, index) => {
      try {
        // Check if we have a date field at all
        if (!Object.prototype.hasOwnProperty.call(item, 'date')) {
          skippedRows.push({ index: index + 1, reason: 'Missing date field' });
          return; // Skip this row
        }

        // Skip if date is empty or undefined
        if (!item.date || item.date.trim() === '') {
          skippedRows.push({ index: index + 1, reason: 'Empty date field' });
          return; // Skip this row
        }

        const trimmedDate = item.date.trim();
        let parsedDate;

        // For sample2.csv format (YYYY-MM-DD)
        if (trimmedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          parsedDate = parse(trimmedDate, simpleDateFormat, new Date());
        }
        // For sample.csv format (YYYY-MM-DD HH:mm:ss)
        else if (trimmedDate.match(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/)) {
          parsedDate = parse(trimmedDate, dateFormat, new Date());
        }
        // Try ISO format as fallback
        else {
          parsedDate = parseISO(trimmedDate);
        }

        if (!isValid(parsedDate)) {
          skippedRows.push({ index: index + 1, reason: `Invalid date format: ${trimmedDate}` });
          return; // Skip this row
        }

        validRows.push({
          ...item,
          amount: convertAmountToMiliunits(parseFloat(item.amount)),
          date: format(parsedDate, outputFormat),
        });
      } catch (error) {
        console.error('Error processing row:', {
          rowIndex: index + 1,
          item: item,
          error: error.message
        });
        skippedRows.push({ index: index + 1, reason: error.message });
      }
    });

    if (skippedRows.length > 0) {
      console.warn('Skipped rows:', skippedRows);
      const skipMessage = `Skipped ${skippedRows.length} invalid rows. Check console for details.`;
      alert(skipMessage);
    }

    if (validRows.length === 0) {
      throw new Error('No valid rows found in the imported data');
    }

    onSubmit(validRows);
  };

  return (
    <div className="mx-auto -mt-6 w-full max-w-screen-2xl pb-10">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="line-clamp-1 text-xl">
            Import Transaction
          </CardTitle>

          <div className="flex flex-col items-center gap-x-2 gap-y-2 lg:flex-row">
            <Button size="sm" onClick={onCancel} className="w-full lg:w-auto">
              Cancel
            </Button>

            <Button
              size="sm"
              disabled={progress < requiredOptions.length}
              onClick={handleContinue}
              className="w-full lg:w-auto"
            >
              Continue ({progress}/{requiredOptions.length})
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <ImportTable
            headers={headers}
            body={body}
            selectedColumns={selectedColumns}
            onTableHeadSelectChange={onTableHeadSelectChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};