import mysql
class DatabaseQueryMysql():
    def query(query: str,params: list,handle,column = True):
        handle.commit()
        err = 0
        result = ''
        try:
            mycursor = handle.cursor()
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
            handle.commit()
            return returndata
        except mysql.connector.Error as err:
            err = err
            returndata = {
                "result":result,
                "length":len(result),
                "error":int(err.errno),
                "affectedRows":mycursor.rowcount
            }
            handle.commit()
            return returndata
    def result(query):
        #just returns the result.
        return query['result']
    def error(query):
        if int(query['error']) != 0:
            return int(query['error'])
        return False
    def changedRows(query):
        return query['affectedRows']
    def length(query):
        return query['length']
