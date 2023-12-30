import mysql as sql

class mysql():
    def __init__(self, databaseConnect, debug=False):
        """
        Constructor method for the `mysql` class.

        Parameters:
        - databaseConnect: MySQL database connection object.
        - debug (optional): If True, enables debug mode.

        Attributes:
        - database: MySQL database connection.
        - results: Results of the last query.
        - debug: Debug mode status.
        - isLocked: Flag indicating whether the instance is currently locked.
        - Normalcursor: Placeholder for a normal cursor.
        """
        self.database = databaseConnect
        self.results = None
        self.debug = debug
        self.isLocked = False
        self.Normalcursor = False

    def start(self):
        """
        Initiates a transaction on the connected database.

        Usage:
        db = mysql(databaseConnect=your_database_connection)
        db.start()
        """
        self.database.start_transaction()

    def commit(self):
        """
        Commits the current transaction to the database.

        Usage:
        db.commit()
        """
        self.database.commit()

    def query(self, query: str, params: list, column=True):
        """
        Executes a SQL query on the database.

        Parameters:
        - query: SQL query string.
        - params: List of parameters for the query.
        - column (optional): If True, returns results as a list of dictionaries.

        Returns:
        - Boolean indicating success or failure.

        Usage:
        result = db.query("SELECT * FROM your_table WHERE your_condition", params=[...])
        if result:
            print("Query successful. Result:", db.result())
        else:
            print("Query failed. Error:", db.error())
        db.commit()
        """
        if not self.isLocked:
            self.database.commit()
        err = 0
        result = ''
        try:
            if self.isLocked:
                mycursor = self.cursor
            else:
                if self.Normalcursor:
                    mycursor = self.Normalcursor
                else:
                    mycursor = self.database.cursor()
                    self.Normalcursor = mycursor
            mycursor.execute(query, params)
            if column:
                columns = mycursor.description
                result = [{columns[index][0]: column for index, column in enumerate(value)} for value in mycursor.fetchall()]
            else:
                result = mycursor.fetchall()
            returndata = {
                "result": result,
                "length": len(result),
                "error": int(err),
                "affectedRows": mycursor.rowcount
            }
            self.database.commit()
            self.results = returndata
            return True
        except sql.connector.Error as err:
            err = err
            returndata = {
                "result": result,
                "length": len(result),
                "error": int(err.errno),
                "affectedRows": mycursor.rowcount
            }
            if self.debug:
                print(mycursor.statement)
            if self.isLocked:
                self.database.rollback()  # Rollback the transaction in case of an error
                self.isLocked = False
            self.results = returndata
            return False

    def result(self):
        """
        Returns the result of the last executed query.

        Usage:
        result = db.result()
        """
        if self.results['result']:
            return self.results['result']
        # just returns the result.
        return False

    def error(self):
        """
        Returns the error code of the last executed query.

        Usage:
        error_code = db.error()
        """
        if int(self.results['error']) != 0:
            return int(self.results['error'])
        return False

    def changedRows(self):
        """
        Returns the number of affected rows by the last executed query.

        Usage:
        affected_rows = db.changedRows()
        """
        return self.results['affectedRows']

    def length(self):
        """
        Returns the length of the result set from the last executed query.

        Usage:
        result_length = db.length()
        """
        return self.results['length']

    def lockingQuery(self, query: str, params: list, column=True, lock_type=None):
        """
        Executes a SQL query with a specified lock type.

        Parameters:
        - query: SQL query string.
        - params: List of parameters for the query.
        - column (optional): If True, returns results as a list of dictionaries.
        - lock_type (optional): Lock type, either "FOR UPDATE" or "FOR DELETE".

        Returns:
        - Boolean indicating success or failure.

        Usage:
        db.lockingQuery("SELECT * FROM your_table WHERE your_condition", params, lock_type="FOR UPDATE")
        """
        err = 0
        result = ''

        if lock_type and lock_type not in ("FOR UPDATE", "FOR DELETE"):
            raise ValueError("Lock type must be 'FOR UPDATE' or 'FOR DELETE'")
        self.isLocked = True
        try:
            self.database.commit()
            # get new data

            mycursor = self.database.cursor()
            mycursor.execute("START TRANSACTION")
            mycursor.execute("SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE")
            if lock_type:
                mycursor.execute(query + f" {lock_type}", params)  # Apply the specified lock
            else:
                # don't use this this.
                raise NotImplementedError()
                mycursor.execute(query, params)

            if column:
                columns = mycursor.description
                result = [{columns[index][0]: column for index, column in enumerate(value)} for value in mycursor.fetchall()]
            else:
                result = mycursor.fetchall()

            returndata = {
                "result": result,
                "length": len(result),
                "error": int(err),
                "affectedRows": mycursor.rowcount
            }

            self.results = returndata
            self.cursor = mycursor
            return True
        except sql.connector.Error as err:
            returndata = {
                "result": result,
                "length": len(result),
                "error": int(err.errno),
                "affectedRows": mycursor.rowcount
            }

            if self.debug:
                print(mycursor.statement)

            self.results = returndata
            self.database.rollback()  # Rollback the transaction in case of an error
            self.isLocked = False
            return False
