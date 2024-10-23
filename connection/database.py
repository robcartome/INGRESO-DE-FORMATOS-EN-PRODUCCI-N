import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host = 'localhost',
            database = 'IngresoFormatosProduccion',
            user = 'postgres',
            password = '1234'
        )
        print(conn)
    except Exception as e:
        print('Exception', e)
    return conn

def execute_query(query, params=None):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(query, params)
    result = cur.fetchall() if cur.description else None
    conn.commit()
    cur.close()
    conn.close()
    return result

