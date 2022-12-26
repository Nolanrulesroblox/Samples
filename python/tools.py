import mysql.connector
def query(query: str,params: list,handle,column = True):
    handle.commit()
    #to keep mysql connection up to date
    err = 0
    #if err code 0, nothing went wrong
    result = []
    if(column):
      #if the script needs column names (like to return to a json file)
        try:
            mycursor = handle.cursor()
            #create a mysql cursor
            mycursor.execute(query,params)
            #execute the query
            columns = mycursor.description 
            result = [{columns[index][0]:column for index, column in enumerate(value)} for value in mycursor.fetchall()]
            returnData = {
                "result":result, #result will be a list
                "length":len(result), #returns an int of how many results
                "error":err, #error code, anything but 0 is a MYSQL error
                "affectedRows":mycursor.rowcount #returns an int of how many results were updated, -1 means an error has occurred
            }
            #the returnData is all the same for each try/except
            handle.commit()
            return returnData
        except mysql.connector.Error as err:
            #if any error, return the error
            err = err
            returnData = {
                "result":result,
                "length":len(result),
                "error":int(err.errno),
                "affectedRows":mycursor.rowcount
            }
        return returnData
    else:
        try:
            mycursor = handle.cursor()
            mycursor.execute(query,params)
            columns = mycursor.description 
            result = mycursor.fetchall()
            returnData = {
                "result":result,
                "length":len(result),
                "error":err,
                "affectedRows":mycursor.rowcount
            }
            handle.commit()
            return returnData
        except mysql.connector.Error as err:
            err = err
            returnData = {
                "result":result,
                "length":len(result),
                "error":int(err.errno),
                "affectedRows":mycursor.rowcount
            }
            return returnData
