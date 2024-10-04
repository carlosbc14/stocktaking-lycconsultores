import { buttonVariants, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

const getTableData = (locations) => {
    if (locations.length === 0) {
        return [];
    }

    let maxRow = 0,
        maxCol = 0;
    const cellMap = {};

    for (const { id, row, column, products } of locations) {
        if (row > maxRow) maxRow = row;
        if (column > maxCol) maxCol = column;

        cellMap[`${column}-${row}`] = [id, `${column}-${row}`, products.length > 0];
    }

    return Array(maxRow)
        .fill()
        .map((_, rowIndex) =>
            Array(maxCol)
                .fill()
                .map((_, colIndex) => cellMap[`${colIndex + 1}-${rowIndex + 1}`] || [-1, '-', false])
        );
};

export default function LocationTable({ stocktakingId, locations = [], className = '' }) {
    const { __ } = useTraslations();
    const tableData = getTableData(locations);

    if (tableData.length === 0)
        return (
            <div className={cn('rounded-md border', className)}>
                <Table>
                    <TableCaption className="mb-4">{__('No Content')}</TableCaption>
                </Table>
            </div>
        );

    return (
        <div className={cn('rounded-md border', className)}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="border-r"></TableHead>
                        {Array.from({ length: tableData[0].length }, (_, index) => (
                            <TableHead key={index} className="text-center">
                                {index + 1}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tableData.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                            <TableHead className="border-r">{rowIndex + 1}</TableHead>
                            {row.map(([locationId, cell, hasProducts], colIndex) => (
                                <TableCell
                                    key={colIndex}
                                    className={cn('text-center', hasProducts ? 'bg-green-400' : '')}
                                >
                                    {locationId >= 0 ? (
                                        hasProducts ? (
                                            <Link
                                                href={route('stocktakings.showLocation', {
                                                    stocktaking: stocktakingId,
                                                    location: locationId,
                                                })}
                                                className={cn(buttonVariants({ variant: 'link' }), 'p-0')}
                                            >
                                                {cell}
                                            </Link>
                                        ) : (
                                            <Link
                                                href={route('stocktakings.run', {
                                                    stocktaking: stocktakingId,
                                                    location: locationId,
                                                })}
                                                className={cn(buttonVariants({ variant: 'link' }), 'p-0')}
                                            >
                                                {cell}
                                            </Link>
                                        )
                                    ) : (
                                        { cell }
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
