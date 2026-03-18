import React, { useState, useEffect, useContext } from 'react';
import { DataTable } from 'primereact/datatable';
import  { useConfirm, useConfirmContext }  from '../../context/ConfirmationContext';
import { Column } from 'primereact/column';
import { FilterMatchMode } from "primereact/api";


const PrimeDataTable = ({
    value = [],
    columns = [],
    loading = false,
    paginator = true,
    rows = 10,
    totalRecords,
    onLazy,
    onPage,
    onSort,
    selection,
    onSelectionChange,
    selectionMode,
    dataKey = "id",
    header,
    filters: externalFilters,
    filterDisplay = "menu",
    first: externalFirst,
    emptyMessage = "No records found.",
    rowsPerPageOptions = [5, 10, 25, 50],
    sortField,
    sortOrder,
    bulkActions,
    ...others
}) => {
const { isConfirmOpen } = useConfirmContext();
const confirm = useConfirm();

    const isSelectionEnabled = !!onSelectionChange || selection !== undefined;
    const finalSelectionMode = isSelectionEnabled && !selectionMode ? 'multiple' : selectionMode;

    // Initialize filters from external filters or default structure
    const [filters, setFilters] = useState(() => {
        if (externalFilters) return externalFilters;

        const initialFilters = {
            global: { value: '', matchMode: FilterMatchMode.CONTAINS }
        };

        columns.forEach(col => {
            if (col.field && col.filter !== false) {
                initialFilters[col.field] = {
                    value: '',
                    matchMode: FilterMatchMode.CONTAINS
                };
            }
        });

        return initialFilters;
    });

    useEffect(() => {
        if (externalFilters) {
            setFilters(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(externalFilters)) {
                    return externalFilters;
                }
                return prev;
            });
        }
    }, [externalFilters]);


    const globalFilterFields = columns
        .filter(col => col.field)
        .map(col => col.field);

    return (
        <div>
            {selection && selection.length > 0 && bulkActions && !isConfirmOpen && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-full px-6 py-3 flex items-center gap-6"> 

                        <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-black">
                                {selection.length === totalRecords && totalRecords > 0 ? "ALL" : selection.length}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white text-[10px] font-black uppercase tracking-wider leading-none">
                                    Selected
                                </span>
                                {selection.length < totalRecords && selection.length === rows && (
                                    <button
                                        onClick={() => {
                                            // This is a hint to the parent to fetch or select all
                                            if (others.onSelectAll) others.onSelectAll();
                                        }}
                                        className="text-indigo-400 hover:text-indigo-300 text-[9px] font-bold uppercase tracking-tighter mt-0.5 text-left"
                                    >
                                        Select all {totalRecords}?
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {bulkActions.map((action, idx) => {
                                // const { confirm, ...actionProps } = action;
                                return (
                                    <button
                                        key={idx}
                                        onClick={async () => {
                                            let doConfirm = true;

                                            if (action.severity === 'danger' || action.confirm) {
                                                // doConfirm = await confirm(
                                                //     action.confirm || 
                                                //     `Confirm ${action.label.toLowerCase()} ${selection.length > 1 ? 'these items' : 'this item'}?` //one
                                                // );
                                            }

                                            if (doConfirm) {
                                                action.handler(selection);
                                            }
                                        }}
                                        className={`group flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${action.severity === 'danger'
                                            ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white'
                                            : 'bg-white/5 text-slate-300 hover:bg-white hover:text-slate-900'
                                            }`}
                                    >
                                        {action.icon && <action.icon className="h-3.5 w-3.5" />}
                                        {action.label}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => onSelectionChange && onSelectionChange([])}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Clear selection"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                    </div>
                </div>
            )}


            <DataTable
                value={value}
                paginator={paginator}
                rows={rows}
                rowsPerPageOptions={rowsPerPageOptions}
                totalRecords={totalRecords}
                first={externalFirst ?? 0}
                selection={selection}
                scrollable
                 scrollHeight="400px"
                  style={{ minWidth: '50rem' }}
                selectionMode={finalSelectionMode}
                lazy={!!onLazy}
                loading={loading}
                filters={filters}
                onFilter={(e) => {
                    const updatedFilters = e.filters;
                    setFilters(updatedFilters);
                    if (onLazy) {
                        onLazy({
                            ...e,
                            filters: updatedFilters
                        });
                    }

                }}
                onPage={(e) => {
                    if (onLazy) onLazy(e);
                    if (onPage) onPage(e);
                }}
                onSort={(e) => {
                    if (onLazy) onLazy(e);
                    if (onSort) onSort(e);
                }}

                globalFilterFields={globalFilterFields}
                header={header}
                sortField={sortField}
                sortOrder={sortOrder}
                removableSort
                onSelectionChange={(e) => {
                    if (onSelectionChange) {
                        onSelectionChange(e.value);
                    }
                }}

                dataKey={dataKey}

                metaKeySelection={false}

                columnResizeMode="fit"

                filterDisplay={filterDisplay}
                rowHover
                className="p-datatable-sm w-full"
                emptyMessage={
                    <div className="p-8 text-center text-slate-400 font-semibold">
                        {emptyMessage}
                    </div>
                }

                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"

                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"

                tableStyle={{ minWidth: '50rem' }}

                {...others}
            >


                {isSelectionEnabled && (
                    <Column
                        selectionMode="multiple"
                        headerStyle={{ width: '3rem', textAlign: 'center' }}
                        bodyStyle={{ textAlign: 'center', padding: '1rem' }}
                    />
                )}

                {columns.map((col, index) => (

                    <Column
                        key={col.field || index}
                        field={col.field}
                        header={col.header}
                        body={col.body}
                        sortable={col.sortable}
                        filter={col.filter}
                        dataType={col.dataType}
                        filterMatchMode={col.filterMatchMode}
                        filterPlaceholder={col.filterPlaceholder}
                        filterElement={col.filterElement}
                        style={col.style}
                        className={col.className}
                        headerClassName="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider"
                        bodyClassName="py-3 text-sm font-medium text-slate-700"
                    />

                ))}

            </DataTable>

        </div>
    );
};

export default PrimeDataTable;