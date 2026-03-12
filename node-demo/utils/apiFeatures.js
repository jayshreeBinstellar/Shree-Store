class APIFeatures {
    constructor(baseQuery, queryStr, pool, searchableColumns = [], columnMapping = {}) {
        this.baseQuery = baseQuery;
        this.queryStr = queryStr;
        this.pool = pool;
        this.searchableColumns = searchableColumns;
        this.columnMapping = columnMapping;

        this.conditions = [];
        this.params = [];

        // Build column mapping for handling aliases and expressions
        this.columnMap = this._buildColumnMap();
    }

    // Build a mapping from short column names to their full expressions
    _buildColumnMap() {
        const map = {};
        
        // First, add any custom column mappings passed from the controller
        if (this.columnMapping && typeof this.columnMapping === 'object') {
            Object.keys(this.columnMapping).forEach(key => {
                map[key] = this.columnMapping[key];
            });
        }
        
        // Then, add the searchable columns to the map
        if (!this.searchableColumns || !this.searchableColumns.length) return map;

        this.searchableColumns.forEach(col => {
            // Extract the base column name (after the last dot, or the whole string)
            let baseName = col;

            // Handle CAST expressions like CAST(o.order_id AS TEXT)
            if (col.toUpperCase().includes('CAST(')) {
                const match = col.match(/CAST\((.+?) AS/i);
                if (match) {
                    baseName = match[1].trim(); // e.g., "o.order_id"
                }
            }

            // Get the short name (after the dot)
            const shortName = baseName.includes('.') ? baseName.split('.').pop() : baseName;

            // Map both the short name and the full expression
            // Only override if not already set by custom mapping
            if (!map[shortName]) {
                map[shortName] = col;
            }
            if (col !== shortName) {
                map[col] = col;
            }
        });

        return map;
    }

    // Get the actual column name to use in the query
    _getMappedColumn(column) {
        // If column already has a table prefix, use it as-is
        if (column.includes('.')) {
            return column;
        }
        // Check if we have a mapping for this column name
        return this.columnMap[column] || `"${column}"`;
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

                // GLOBAL SEARCH
                if (column === "all" || column === "global") {
                    const searchCond = this.searchableColumns
                        .map(col => `${col}::TEXT ILIKE $${paramIndex}`)
                        .join(" OR ");

                    this.conditions.push(`(${searchCond})`);
                    this.params.push(`%${value}%`);
                    return;
                }

                // Validate column against searchableColumns if available
                if (this.searchableColumns.length) {
                    // Check if column exists in our map (supports both exact match and short name)
                    const mappedColumn = this._getMappedColumn(column);

                    // If mappedColumn is just quoted (like "order_id"), it means we don't have a mapping
                    if (!this.searchableColumns.includes(mappedColumn) && mappedColumn.startsWith('"') && mappedColumn.endsWith('"')) {
                        // Column not in searchable list - skip this filter
                        console.warn(`Column "${column}" is not in searchable columns. Skipping filter.`);
                        return;
                    }

                    // Replace column with mapped version
                    f.column = mappedColumn;
                }

                let condition = '';

                if (type === "boolean" || typeof value === "boolean") {
                    condition = `${f.column} = $${paramIndex}`;
                    this.params.push(value);
                } else if (type === "number" && operator === "equals") {
                    // Handle numeric equality comparison
                    condition = `${f.column} = $${paramIndex}`;
                    this.params.push(value);
                } else {
                    switch (operator) {
                        case "startsWith":
                            condition = `${f.column}::TEXT ILIKE $${paramIndex}`;
                            this.params.push(`${value}%`);
                            break;

                        case "endsWith":
                            condition = `${f.column}::TEXT ILIKE $${paramIndex}`;
                            this.params.push(`%${value}`);
                            break;

                        case "notContains":
                            condition = `${f.column}::TEXT NOT ILIKE $${paramIndex}`;
                            this.params.push(`%${value}%`);
                            break;

                        case "equals":
                            // For text fields that use equals
                            condition = `${f.column}::TEXT ILIKE $${paramIndex}`;
                            this.params.push(`%${value}%`);
                            break;

                        // Date filter modes
                        case "dateIs":
                            condition = `DATE(${f.column}) = DATE($${paramIndex})`;
                            this.params.push(value);
                            break;

                        case "dateBefore":
                            condition = `DATE(${f.column}) < DATE($${paramIndex})`;
                            this.params.push(value);
                            break;

                        case "dateAfter":
                            condition = `DATE(${f.column}) > DATE($${paramIndex})`;
                            this.params.push(value);
                            break;

                        case "dateBetween":
                            // For date range - value should be an array [startDate, endDate]
                            if (Array.isArray(value) && value.length === 2) {
                                condition = `DATE(${f.column}) BETWEEN DATE($${paramIndex}) AND DATE($${paramIndex + 1})`;
                                this.params.push(value[0], value[1]);
                            } else {
                                condition = `DATE(${f.column}) = DATE($${paramIndex})`;
                                this.params.push(value);
                            }
                            break;

                        // Numeric filter modes
                        case "gt":
                            condition = `${f.column} > $${paramIndex}`;
                            this.params.push(value);
                            break;

                        case "lt":
                            condition = `${f.column} < $${paramIndex}`;
                            this.params.push(value);
                            break;

                        case "gte":
                            condition = `${f.column} >= $${paramIndex}`;
                            this.params.push(value);
                            break;

                        case "lte":
                            condition = `${f.column} <= $${paramIndex}`;
                            this.params.push(value);
                            break;

                        default:
                            condition = `${f.column}::TEXT ILIKE $${paramIndex}`;
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

        const page = Number(this.queryStr.page) || 1;
        const limit = Number(this.queryStr.limit) || 10;
        const offset = (page - 1) * limit;

        let sortKey = this.queryStr.sortKey;
        const sortBy = this.queryStr.sortBy || "ASC";

        // Map sortKey to actual column name if columnMapping is provided
        if (sortKey && this.columnMapping && this.columnMapping[sortKey]) {
            const mappedColumn = this.columnMapping[sortKey];
            
            // Check if the mapped column is CAST to TEXT (e.g., 'CAST(o.order_id AS TEXT)')
            // If so, we need to use CAST to INTEGER for proper numeric sorting
            if (mappedColumn.toUpperCase().includes('CAST(') && mappedColumn.toUpperCase().includes(' AS TEXT)')) {
                // Replace TEXT with INTEGER for numeric sorting
                sortKey = mappedColumn.replace(/AS TEXT\)/i, 'AS INTEGER)');
            } else {
                sortKey = mappedColumn;
            }
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

        // COUNT QUERY
        const countQuery = `SELECT COUNT(*) FROM (${query}) AS total`;
        const countRes = await this.pool.query(countQuery, this.params);
        const totalRecords = Number(countRes.rows[0].count);

        // SORT
        if (sortKey) {
            query += ` ORDER BY ${sortKey} ${sortBy}`;
        } else if (defaultOrderBy) {
            query += ` ${defaultOrderBy}`;
        }

        // PAGINATION
        query += ` OFFSET ${offset} LIMIT ${limit}`;

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