import psycopg2
from pymongo import MongoClient

# --- Conexión a PostgreSQL ---
pg_conn = psycopg2.connect(
    dbname="db_imc",
    user="db_imc_user",
    password="8CcTjzn4PTeZw4B9zloHrM2p907TzgmN",
    host="dpg-d303la8gjchc73cmtgb0-a.oregon-postgres.render.com",
    port="5432"
)
pg_cur = pg_conn.cursor()

# --- Conexión a Mongo Atlas ---
mongo_uri = "mongodb+srv://hebem:hebe456@cluster0.iom6r.mongodb.net/"
client = MongoClient(mongo_uri)
db = client["db_imc"]

# Colecciones destino
users_col = db["users"]
imc_col = db["imc"]

# Limpiar colecciones antes de importar (opcional)
users_col.delete_many({})
imc_col.delete_many({})

# --- Migrar tabla users ---
pg_cur.execute("SELECT id, email, password FROM users")
for row in pg_cur.fetchall():
    doc = {
        "_id": row[0],       # usamos el mismo id de Postgres como _id
        "email": row[1],
        "password": row[2]
    }
    users_col.insert_one(doc)

print("Usuarios migrados ✔")

# --- Migrar tabla imc ---
pg_cur.execute("SELECT id, peso, altura, imc, categoria, fecha, user_id FROM imc")
for row in pg_cur.fetchall():
    doc = {
        "_id": row[0],
        "peso": row[1],
        "altura": row[2],
        "imc": row[3],
        "categoria": row[4],
        "fecha": row[5].isoformat(),  # timestamp a string ISO
        "user_id": row[6]
    }
    imc_col.insert_one(doc)

print("Registros IMC migrados ✔")

# --- Cerrar conexiones ---
pg_cur.close()
pg_conn.close()
client.close()

print("Migración completa 🚀")
