package mysqlconnector

import (
	"database/sql"
	"fmt"

	_ "github.com/go-sql-driver/mysql"
)

// MySQL struct represents our MySQL database connection handler.
type MySQL struct {
	db     *sql.DB
	result map[string]interface{}
	debug  bool
}

// NewMySQL initializes a new MySQL instance.
func NewMySQL(db *sql.DB, debug bool) *MySQL {
	return &MySQL{
		db:     db,
		result: make(map[string]interface{}),
		debug:  debug,
	}
}

// Start begins a new transaction.
func (m *MySQL) Start() (*sql.Tx, error) {
	tx, err := m.db.Begin()
	if err != nil {
		return nil, err
	}
	return tx, nil
}

// Commit commits the current transaction.
func (m *MySQL) Commit(tx *sql.Tx) error {
	return tx.Commit()
}

// Rollback rolls back the current transaction.
func (m *MySQL) Rollback(tx *sql.Tx) error {
	return tx.Rollback()
}

// Query executes a SQL query within a transaction
func (m *MySQL) Query(tx *sql.Tx, query string, params ...interface{}) error {
	rows, err := tx.Query(query, params...)
	if err != nil {
		return err
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return err
	}

	var result []map[string]interface{}
	for rows.Next() {
		row := make(map[string]interface{})
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range columns {
			valuePtrs[i] = &values[i]
		}
		if err := rows.Scan(valuePtrs...); err != nil {
			return err
		}
		for i, col := range columns {
			val := values[i]
			switch v := val.(type) {
			case []byte:
				row[col] = string(v)
			default:
				row[col] = v
			}
		}
		result = append(result, row)
	}

	m.result["result"] = result
	m.result["length"] = len(result)

	return nil
}

// Result returns the result of the last executed query.
func (m *MySQL) Result() []map[string]interface{} {
	if result, ok := m.result["result"].([]map[string]interface{}); ok {
		return result
	}
	return nil
}

func main() {
	// Connect to MySQL database
	db, err := sql.Open("mysql", "username:password@tcp(localhost:3306)/database_name")
	if err != nil {
		fmt.Println("Error connecting to database:", err)
		return
	}
	defer db.Close()

	mysqlInstance := NewMySQL(db, true)

	// Example usage: Perform a transaction with a query
	tx, err := mysqlInstance.Start()
	if err != nil {
		fmt.Println("Error starting transaction:", err)
		return
	}
	defer func() {
		if err != nil {
			mysqlInstance.Rollback(tx)
		} else {
			err = mysqlInstance.Commit(tx)
			if err != nil {
				fmt.Println("Error committing transaction:", err)
			}
		}
	}()

	query := "SELECT * FROM your_table WHERE your_condition"
	params := []interface{}{} // Provide query parameters if needed
	err = mysqlInstance.Query(tx, query, params...)
	if err != nil {
		fmt.Println("Query execution error:", err)
		return
	}

	results := mysqlInstance.Result()
	fmt.Println("Query successful. Result:", results)
}
