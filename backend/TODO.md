what's done:
- XSS filter
- Add @Transactional to WRITE operations
- update post: complete update transaction before actually deleting media files

TODO: 
- normalize api response
- global exception handler
- api rate limit
- video streaming
- fully authorize api with role and permissions