# Some instructions on development
## Backup database
1. Dump database to a sql file
```bash
# with root user
docker exec mysql_db mysqldump -uroot -p${DB_ROOT_PASS} socialmedia > socialmedia_backup.sql

# with non-root user
docker exec mysql_db mysqldump -u${DB_USER} -p${DB_PASS} socialmedia > socialmedia_backup.sql
```

> `socialmedia_backup.sql` will be created in the current directory of host machine, not in the container.

> Note: If dump contains user/permission SQL, 

2. Restore database into new database
```bash
# with root user
docker exec -T mysql_db mysql -uroot -p${DB_ROOT_PASS} socialmedia < socialmedia_backup.sql

# with non-root user
docker exec -T mysql_db mysql -u${DB_USER} -p${DB_PASS} socialmedia < socialmedia_backup.sql
# -T flag is used to disable pseudo-tty allocation, which is required for input redirection to work properly.
```

