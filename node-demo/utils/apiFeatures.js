

class APIFeatures {
    constructor(baseQuery, queryStr, pool, searchableColumns = [], columnMapping = {}) {
        this.baseQuery = baseQuery;
        this.queryStr = queryStr;
        this.pool = pool;
        this.searchableColumns = searchableColumns;
        this.columnMapping = columnMapping;

        this.conditions = [];
        this.params = [];

        // Build SAFE column map (whitelist)
        this.columnMap = Object.freeze(this._buildColumnMap());
    }

    // Build mapping (WHITELIST)
    _buildColumnMap() {
        const map = {};

        // Custom mappings (trusted)
        if (this.columnMapping && typeof this.columnMapping === 'object') {
            Object.keys(this.columnMapping).forEach(key => {
                map[key] = this.columnMapping[key];
            });
        }

        // Searchable columns (trusted)
        this.searchableColumns.forEach(col => {
            let baseName = col;

            if (col.toUpperCase().includes('CAST(')) {
                const match = col.match(/CAST\((.+?) AS/i);
                if (match) baseName = match[1].trim();
            }

            const shortName = baseName.includes('.') ? baseName.split('.').pop() : baseName;

            if (!map[shortName]) map[shortName] = col;
            map[col] = col;
        });

        return map;
    }

    // SAFE COLUMN RESOLVER (CRITICAL FIX)
    _safeColumn(column) {
        const mapped = this.columnMap[column];
        if (!mapped) {
            throw new Error(`Invalid column: ${column}`);
        }
        return mapped;
    }

    _getMappedColumn(column) {
        return this._safeColumn(column);
    }

    filter() {
        let { filters } = this.queryStr;
        if (!filters) return this;

        try {
            filters = typeof filters === "string" ? JSON.parse(filters) : filters;

            filters.forEach(f => {
                const { column, value, operator, type } = f;
                if (value === undefined || value === null || value === '') return;

                const paramIndex = this.params.length + 1;

                //GLOBAL SEARCH
                if (column === "all" || column === "global") {
                    const searchCond = this.searchableColumns
                        .map(col => `${col}::TEXT ILIKE $${paramIndex}`)
                        .join(" OR ");

                    this.conditions.push(`(${searchCond})`);
                    this.params.push(`%${value}%`);
                    return;
                }

                // SAFE COLUMN VALIDATION
                let safeColumn;
                try {
                    safeColumn = this._safeColumn(column);
                } catch (e) {
                    console.warn(e.message);
                    return;
                }

                let condition = '';

                if (type === "boolean" || typeof value === "boolean") {
                    condition = `${safeColumn} = $${paramIndex}`;
                    this.params.push(value);

                } else if (type === "number" && operator === "equals") {
                    condition = `${safeColumn} = $${paramIndex}`;
                    this.params.push(value);

                } else {
                    switch (operator) {
                        case "startsWith":
                            condition = `${safeColumn}::TEXT ILIKE $${paramIndex}`;
                            this.params.push(`${value}%`);
                            break;

                        case "endsWith":
                            condition = `${safeColumn}::TEXT ILIKE $${paramIndex}`;
                            this.params.push(`%${value}`);
                            break;

                        case "notContains":
                            condition = `${safeColumn}::TEXT NOT ILIKE $${paramIndex}`;
                            this.params.push(`%${value}%`);
                            break;

                        case "equals":
                            condition = `${safeColumn}::TEXT ILIKE $${paramIndex}`;
                            this.params.push(`%${value}%`);
                            break;

                        //DATE FILTERS
                        case "dateIs":
                            condition = `DATE(${safeColumn}) = DATE($${paramIndex})`;
                            this.params.push(value);
                            break;

                        case "dateBefore":
                            condition = `DATE(${safeColumn}) < DATE($${paramIndex})`;
                            this.params.push(value);
                            break;

                        case "dateAfter":
                            condition = `DATE(${safeColumn}) > DATE($${paramIndex})`;
                            this.params.push(value);
                            break;

                        case "dateBetween":
                            if (Array.isArray(value) && value.length === 2) {
                                condition = `DATE(${safeColumn}) BETWEEN DATE($${paramIndex}) AND DATE($${paramIndex + 1})`;
                                this.params.push(value[0], value[1]);
                            } else {
                                condition = `DATE(${safeColumn}) = DATE($${paramIndex})`;
                                this.params.push(value);
                            }
                            break;

                        //NUMERIC FILTERS
                        case "gt":
                            condition = `${safeColumn} > $${paramIndex}`;
                            this.params.push(value);
                            break;

                        case "lt":
                            condition = `${safeColumn} < $${paramIndex}`;
                            this.params.push(value);
                            break;

                        case "gte":
                            condition = `${safeColumn} >= $${paramIndex}`;
                            this.params.push(value);
                            break;

                        case "lte":
                            condition = `${safeColumn} <= $${paramIndex}`;
                            this.params.push(value);
                            break;

                        default:
                            condition = `${safeColumn}::TEXT ILIKE $${paramIndex}`;
                            this.params.push(`%${value}%`);
                    }
                }

                this.conditions.push(condition);
            });

        } catch (err) {
            console.error("Filter parse error:", err);
        }

        return this;
    }

    async execute(groupBy = "", defaultOrderBy = "") {
        const page = Math.max(1, Number(this.queryStr.page) || 1);
        const limit = Math.max(1, Number(this.queryStr.limit) || 10);
        const offset = (page - 1) * limit;

        // let sortKey = this.queryStr.sortKey;
        const sortByRaw = this.queryStr.sortBy || "ASC";

        //SAFE SORT DIRECTION
        const sortBy = sortByRaw.toUpperCase() === "DESC" ? "DESC" : "ASC";

        // SAFE SORT COLUMN
        // if (sortKey) {
        //     try {
        //         let mappedColumn = this._safeColumn(sortKey);

        //         if (
        //             mappedColumn.toUpperCase().includes('CAST(') &&
        //             mappedColumn.toUpperCase().includes(' AS TEXT)')
        //         ) {
        //             mappedColumn = mappedColumn.replace(/AS TEXT\)/i, 'AS INTEGER)');
        //         }

        //         sortKey = mappedColumn;
        //     } catch {
        //         sortKey = null;
        //     }
        // }

        let sortKeyInput = this.queryStr.sortKey;
        let sortKey = null;

        if (sortKeyInput && Object.prototype.hasOwnProperty.call(this.columnMap, sortKeyInput)) {
            let mappedColumn = this.columnMap[sortKeyInput];

            // Preserve your CAST logic
            if (
                mappedColumn.toUpperCase().includes('CAST(') &&
                mappedColumn.toUpperCase().includes(' AS TEXT)')
            ) {
                mappedColumn = mappedColumn.replace(/AS TEXT\)/i, 'AS INTEGER)');
            }

            sortKey = mappedColumn;
        }

        let query = this.baseQuery;

        // WHERE
        if (this.conditions.length) {
            if (query.toLowerCase().includes('where')) {
                query += ` AND ${this.conditions.join(" AND ")}`;
            } else {
                query += ` WHERE ${this.conditions.join(" AND ")}`;
            }
        }

        if (groupBy) query += ` ${groupBy}`;

        // COUNT
        const countQuery = `SELECT COUNT(*) FROM (${query}) AS total`;
        const countRes = await this.pool.query(countQuery, this.params);
        const totalRecords = Number(countRes.rows[0].count);

        // const allowedSortColumns = Object.values(this.columnMap);



        // if (!allowedSortColumns.includes(sortKey)) {
        //     sortKey = null; // or default column
        // }

        // Validate sort direction
        const safeSortBy = sortBy?.toUpperCase() === "DESC" ? "DESC" : "ASC";

        // Apply ORDER BY safely
        if (sortKey) {
            query += `  ORDER BY ${sortKey} ${safeSortBy}`;
        } else if (defaultOrderBy) {
            query += ` ${defaultOrderBy}`;
        }

        // ORDER BY
        // if (sortKey) {
        //     query += ` ORDER BY ${sortKey} ${sortBy}`;
        // } 



        // PAGINATION
        this.params.push(limit, offset);
        query += ` LIMIT $${this.params.length - 1} OFFSET $${this.params.length}`;

        const result = await this.pool.query(query, this.params);

        return {
            statusCode: 200,
            data: result.rows,
            meta: {
                totalRecords,
                status: 1,
                message: "data fetch successfully",
                Currentpage: page,
                limit,
                PreviousPage: page > 1 ? page - 1 : 0,
                NextPage: page * limit < totalRecords ? page + 1 : 0
            }
        };
    }
}

module.exports = APIFeatures;