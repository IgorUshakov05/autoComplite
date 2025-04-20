# 🐍 Python-Postgres

**Python-Postgres** — это удобное расширение для разработчиков на Python, предназначенное для легкой интеграции с базой данных PostgreSQL. Библиотека фокусируется на простоте подключения, выполнении запросов и структурировании данных, облегчая повседневную работу с СУБД.

![Python + PostgreSQL](https://th.bing.com/th/id/OIP.y_jROjOeeK6uxTAN83677gHaE8?rs=1&pid=ImgDetMain)

---

## 🚀 Возможности

- 🔌 Простая интеграция с PostgreSQL
- 🧾 Упрощённое выполнение SQL-запросов
- 📦 Поддержка ORM (SQLAlchemy)
- ♻️ Автоматическое управление сессиями
- 📊 Гибкая работа с таблицами, транзакциями и миграциями

---

## 📦 Установка

```bash
pip install python-postgres
```

Также потребуется установить драйвер PostgreSQL:

```bash
pip install psycopg2-binary
```

---

## ⚙️ Настройка подключения

```python
from python_postgres import Database

db = Database(
    user='postgres',
    password='your_password',
    host='localhost',
    port='5432',
    database='your_database'
)

db.connect()
```

---

## 🧠 Примеры использования

### ✅ Выполнение запроса

```python
result = db.query("SELECT * FROM users WHERE active = TRUE;")
for row in result:
    print(row)
```

---

### 📝 Вставка данных

```python
db.execute(
    "INSERT INTO users (name, email) VALUES (%s, %s);",
    ("Alice", "alice@example.com")
)
```

---

### 💾 ORM с SQLAlchemy

```python
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String)

# Создание таблиц
Base.metadata.create_all(db.engine)
```

---

## 📉 Архитектура

![Architecture](https://raw.githubusercontent.com/sqlalchemy/sqlalchemy/main/doc/_static/sqlalchemy_architecture.png)

---

## 🛠 Поддержка транзакций

```python
with db.transaction():
    db.execute("UPDATE accounts SET balance = balance - 100 WHERE id = 1")
    db.execute("UPDATE accounts SET balance = balance + 100 WHERE id = 2")
```

---

## 🧪 Тестирование подключения

```python
if db.ping():
    print("Подключение успешно!")
else:
    print("Ошибка подключения.")
```

---

## 📚 Документация

Дополнительную документацию, примеры и гайды можно найти на [официальном сайте](#) или в [репозитории GitHub](#).

---
