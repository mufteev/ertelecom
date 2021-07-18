### Процесс развёртывания БД
- Установить СУБД PostgreSQL v13;
- Создать БД, например, с именем «ertelecom»;
- Перед восстановлением БД из файла выполнить добавление расшире-ния для работы с UUID командой в консоли:
```
psql -d postgres -U postgres -c 'CREATE EXTENSION \"uuid-ossp\"'
```
- Затем выполнить восстановление БД из файла во вложении db.sql:
```
psql -d ertelecom -U postgres -q -f db.sql
```
где параметр **-U <Имя пользователя>**, **-d <Имя_БД>**, а **-f <Путь до бэкапа>**
Важно, необходимо привести в соответствие данные о подключении для серверной стороны в файле config.env.

# Production
### Сборка приложения
```
cd ertelecom
npm i
cd ./client
npm i
npm run build
cd ..

```
# Development
### Процесс развёртывания приложения
- Установить node.js (v14+);
- Клонировать исходный код из репозитория:
```
git clone https://github.com/mufteev/ertelecom.git
```
- Восстановление модулей серверного и клиентского приложения:
```
cd ertelecom
npm i
cd ./client
npm i
```
- Запуск сервера:
```
cd ertelecom
npm start
```
- Запуск клиента:
```
cd ./client
npm start
```
