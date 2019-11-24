const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// allow custom header and CORS
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers', 
		'token, Origin, X-Requested-With, Content-Type, Accept, X-File-Name'
	);
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  if (req.method == 'OPTIONS') {
    res.sendStatus(200);  /* 让options请求快速返回 */
  } else {
    next();
  }
});

app.use('/', express.static(path.resolve('build')));
app.use('/static/', express.static(path.resolve('static')));
// 让浏览器刷新时能重定向到index.html
app.use(function(req, res, next) {
	if(req.url.startsWith('/static/')) {
		return next();
	}
	return res.sendFile(path.resolve('build/index.html'));
});

app.listen(8084, function() {
  console.log('Node app start at port 8084');
});


