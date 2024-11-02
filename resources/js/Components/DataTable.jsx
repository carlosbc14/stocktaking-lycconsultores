import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import {
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export function DataTable({
    columns,
    data,
    filterBy,
    onFilterChange,
    onSortChange,
    totalPages,
    onPageChange,
    pageSize,
    currentPage,
}) {
    const { __ } = useTraslations();

    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [pagination, setPagination] = useState({
        pageIndex: currentPage - 1,
        pageSize: pageSize,
    });

    const table = useReactTable({
        data,
        columns,
        onSortingChange: (getNewSorting) => {
            const newSorting = getNewSorting(sorting);
            setSorting(newSorting);
            onSortChange(newSorting[0]?.id, newSorting[0]?.desc);
        },
        onColumnFiltersChange: (getNewColumnFilters) => {
            const newColumnFilters = getNewColumnFilters(columnFilters);
            setColumnFilters(newColumnFilters);
            onFilterChange(newColumnFilters[0]?.id, newColumnFilters[0]?.value);
        },
        onPaginationChange: (getNewPagination) => {
            const newPagination = getNewPagination(pagination);
            setPagination(newPagination);
            onPageChange(newPagination.pageIndex + 1, newPagination.pageSize);
        },
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: totalPages,
        state: {
            sorting,
            columnFilters,
            pagination,
        },
    });

    return (
        <div className="w-full">
            {filterBy && (
                <div className="flex items-center justify-between mt-4">
                    <Input
                        placeholder={__('Filter by :name', { name: __(filterBy).toUpperCase() })}
                        value={table.getColumn(filterBy)?.getFilterValue() ?? ''}
                        onChange={(event) => table.getColumn(filterBy)?.setFilterValue(event.target.value)}
                        className="max-w-sm"
                    />

                    <div className="flex items-center space-x-2">
                        <Label htmlFor="page-size">{__('Show')}</Label>

                        <Select
                            id="page-size"
                            onValueChange={(v) => table.setPageSize(Number(v))}
                            defaultValue={table.getState().pagination.pageSize.toString()}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            <div className="rounded-md border mt-4">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {__('No Content')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-between py-4">
                <div className="flex items-center space-x-2">
                    <Label htmlFor="page">{__('Page')}</Label>

                    <Input
                        id="page"
                        className="w-auto"
                        type="number"
                        min="1"
                        max={table.getPageCount()}
                        value={table.getState().pagination.pageIndex + 1}
                        onChange={(e) => table.setPageIndex(e.target.value ? Number(e.target.value) - 1 : 0)}
                    />

                    <span>{__('of')}</span>

                    <span>{table.getPageCount().toLocaleString()}</span>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.firstPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.lastPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
