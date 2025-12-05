### Simulate XSS attack
## Note: React auto escape characters to prevent XSS attack so we has to use 
`<div dangerouslySetInnerHTML={{ __html: user.bio }}></div>`
# STEP 1: add XSS code to text input 
## Note:Modern browser prevent executing JS code injected through innerHTML, dangerouslySetInnerHTML, react rendering
## therefore, using `<script>alert("XSS")</script>` is not ok

what code to inject? `<img src="x" onerror="alert('XSS Test')">`, `<div onclick="alert('XSS triggered')">Click me</div>`

# STEP 2: when rendering user.bio on UI, the code is executed.

