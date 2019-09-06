// https://github.com/BaseMax/MysqlExpressJs
let express = require('express')
let cookieParser = require('cookie-parser')
let bodyParser = require('body-parser')
let multer  = require('multer')
let app = express()
var mysql = require('mysql')
const util = require('util')
// let MysqlJson = require('mysql-json')

var db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'asrez'
})
db.connect((err) => {
	if(err) {
		throw err;
	}
	console.log('Connected to database');
});
global.db = db;
const query = util.promisify(db.query).bind(db);

let data = {
	countPosts:async () => {
		const rows = await query('select count(*) as count from `post`');
		console.log(rows);
	},
	getPosts:async () => {
		const posts = await query('select * from `post` ORDER BY `id` DESC');
		for(let i=0;i<posts.length;i++) {
			posts[i]["tags"]= await query('select * from `post_tag` WHERE `id` = '+ posts[i].id +' ORDER BY `id` DESC');
		}
		console.log(posts);
		return posts
	}
}

// app.use(multer({ dest: './upload/' }))
app.use(cookieParser())  
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({
// 	extended: true
// }))
// app.use(bodyParser())

app.set('view engine', 'pug')
app.set('views', './view')
app.use(express.static('static'))

let config= {
	site:'http://localhost:8081/',
}

app.get('/', async (request, response) => {
	data.countPosts();
	let posts=data.getPosts();
	response.render('main', {config:config, posts:posts})
	// return response.status(500).send("Error!");
})

let server = app.listen(8081, function () {
	let host = server.address().address
	let port = server.address().port
	console.log("MysqlExpressJs App listening at http://%s:%s", host, port)
})
