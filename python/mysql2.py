# notes: i am working on a read/write database tool, this is basically pre-alpha. just a rough idea
# dont use in production unless you are crazy, or wanting a free headache. God speed.
import mysql as sql
import mysql.connector as mysqlConnector
class mysql():
    def __init__(self, readDatabaseConnect: False,readWriteDatabaseConnect: False, debug=False,):
        self.database = None
        self.results = None
        self.debug = debug
        self.isLocked = False
        self.Normalcursor = False
        self.readDatabaseConnect = readDatabaseConnect
        self.readWriteDatabaseConnect = readWriteDatabaseConnect
        self.rw = False
    def connector(self):
        return self.database
    def setWriteMode(self,On:False):
        #note, there is no safety in this. 
        if On:
            self.database = self.readWriteDatabaseConnect
            self.rw = True
        else:
            self.database = self.readDatabaseConnect
            self.rw = False
        return
    
    def start(self):
        self.database.start_transaction()

    def commit(self):
        self.database.commit()

    def query(self, query: str, params: list, column=True):
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
        if self.results['result']:
            return self.results['result']
        # just returns the result.
        return False

    def error(self):
        if int(self.results['error']) != 0:
            return int(self.results['error'])
        return False

    def changedRows(self):
        return self.results['affectedRows']

    def length(self):
        return self.results['length']

    def lockingQuery(self, query: str, params: list, column=True, lock_type=None):
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
