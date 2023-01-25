import mysql as sql
class mysql():
    def __init__(self,databaseConnect):
        self.database = databaseConnect
        self.results = None
    def query(self,query: str,params: list,column = True):
        self.database.commit()
        err = 0
        result = ''
        try:
            mycursor = self.database.cursor()
            mycursor.execute(query,params)
            if column:
                columns = mycursor.description
                result = [{columns[index][0]:column for index, column in enumerate(value)} for value in mycursor.fetchall()]
            else:
                result = mycursor.fetchall()
            returndata = {
                "result":result,
                "length":len(result),
                "error":int(err),
                "affectedRows":mycursor.rowcount
            }
            self.database.commit()
            self.results = returndata
            return True
        except sql.connector.Error as err:
            err = err
            returndata = {
                "result":result,
                "length":len(result),
                "error":int(err.errno),
                "affectedRows":mycursor.rowcount
            }
            self.database.commit()
            self.results = returndata
            return False
    def result(self):
        if self.results['result']:
            return self.results['result']
        #just returns the result.
        return False
    def error(self):
        if int(self.results['error']) != 0:
            return int(self.results['error'])
        return False
    def changedRows(self):
        return self.results['affectedRows']
    def length(self):
        return self.results['length']
