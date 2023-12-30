# MySQL Python Wrapper

A Python class for simplified interactions with MySQL databases, providing features for transactions, queries, and locking.
## Features

- Start and commit transactions easily.
- Execute SQL queries with parameterized input.
- Retrieve query results as dictionaries or regular lists.
- Locking mechanism for "FOR UPDATE" or "FOR DELETE" operations.
- Error handling and debug mode for better development experience.

## Example
```bash
pip install mysql-connector-python
```
```python
from mysql import mysql
db = mysql(databaseConnect=your_database_connection)
result = db.query("SELECT * FROM your_table WHERE your_condition", params=[...])
if result:
    print("Query successful. Result:", db.result())
else:
    print("Query failed. Error:", db.error())
db.commit()
```
Locking query:
```python
from mysql import mysql
db = mysql(databaseConnect=your_database_connection)
db.lockingQuery("SELECT * FROM your_table WHERE your_condition", params=[...], lock_type="FOR UPDATE")
#do anything else with the locked row
db.commit()
```
