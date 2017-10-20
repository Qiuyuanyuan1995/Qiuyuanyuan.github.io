var exp = require('express')
var bodyParser = require('body-parser')
var fs = require('fs')
var cookieParser = require('cookie-parser')
// 加载multer，它可以处理文件的上传
var multer = require('multer')

// 创建应用程序对象app
var app = exp()

// 指定上传文件的位置
var storage = multer.diskStorage({
    // destination：目标、目的地，它表示文件存放的位置
    destination: 'public/uploads',
    // filename：表示上传后的文件名
    filename: function (req, file, cb) {
        // 指定文件名
        var username = req.cookies.username
        // cb(1, 2)
        // 参数2：文件名，字符串类型
        cb(null, `${username}.jpg`)
    }
})
var uploads = multer({
    storage: storage
})

app.use(exp.static('public'))
app.use(bodyParser.urlencoded({extended:true}))
app.use(cookieParser())

// 注册
app.post('/user/register', (req, res) => {
    req.body.ip = req.ip
    req.body.time = new Date()
 
    function send(code, message){
        res.status(200).json({
            code: code,
            message: message
        })
    }
    
    function saveFile(){
        var fileName = `users/${req.body.username}.txt`
        
        fs.exists(fileName, (exists) => {
            if(exists){
                send('registered', '用户名已经注册过了！')
            }
            else{
                fs.appendFile(fileName, JSON.stringify(req.body), (err) => {
                    if(err){
                        send('file error', '抱歉，系统错误...')
                    }
                    else{
                        send('success', '恭喜，注册成功！请登录...')
                    }
                })
            }
        })
    }
   
    fs.exists('users', (exists) => {
        if(exists){
            saveFile()
        }
        else{
            fs.mkdir('users', (err) => {
                if(err){
                    send('file error', '抱歉，系统错误...')
                }
                else{
                    saveFile()
                }
            })
        }
    })
})

// 登录
app.post('/user/signin', (req, res) => {
    var fileName = `users/${req.body.username}.txt`
    
    function send(code, message){
        res.status(200).json({code, message})
    }
    
    fs.exists(fileName, (exists) => {
        if(exists){
            fs.readFile(fileName, (err, data) => {
                if(err){
                    send('file error', '抱歉，系统错误...')
                }
                else{
                    var user = JSON.parse(data)
                    if(user.password == req.body.password){
                        // 如果密码一致，在服务器端把用户名写入cookie
                        res.cookie('username', req.body.username)
                        
                        // 
                        send('success', '登录成功...')
                    }
                    else{
                        send('signin error', '用户名或密码错误！')
                    }
                }
            })
        }
        else{
            send('register error', '用户名未注册！')
        }
    })
})

// 注销
app.get('/user/signout', (req, res) => {
    res.clearCookie('username')
    res.status(200).json({code: 'success'})
})

// 提问
app.post('/ask', (req, res)=>{
    var username = req.cookies.username

    function send(code, message){
        res.json({code, message})
    }

    // 如果没用用户登录
    if (!username) {
        send('signin error', '请重新登录...')
        return
    }

    // 向请求体添加用户名、提问时间和ip
    // 目的是把用户名、提问时间、ip都写入文件
    var time = new Date()
    req.body.username = username
    req.body.ip = req.ip
    req.body.time = time

    // 封装保存"问题"文件的函数
    function saveFile(params) {
        // 指定文件名，用当前时间的毫秒数作为文件名
        var fileName = `questions/${time.getTime()}.txt`
        // 通过第3个参数的error判断写入文件是否成功
        fs.appendFile(fileName, JSON.stringify(req.body), (error)=>{
            if (error) {
                send('file error', '写入文件失败')
            }else send('success', '问题提交成功！')
        })
    }

    fs.exists('questions', (exists)=>{
        if (exists) {
            saveFile()
        }else{
            fs.mkdir('questions', (error)=>{
                if (error) {
                    send('file error', '抱歉、系统错误')
                }else saveFile()
            })
        }
    })
})

// 首页
app.get('/questions', (req, res)=>{
    function send(code, message, data) {
        res.json({code, message, data})
    }
    // 封装一个读取所有"问题"的方法
    // 它的作用是读取questions目录下的所有文件
    function readFiles(i, files, questions, complete) {
        if (i < files.length) {
            fs.readFile(`questions/${files[i]}`, (error, data)=>{
                if (!error) {
                    questions.push(JSON.parse(data))
                }
                // 递归：自身调用自身
                readFiles(++i, files, questions, complete)
            })
        }else complete()
    }

    // readdir(1, 2)读文件夹，可以读取所有文件
    // 参数1：文件夹名
    // 参数2：回调函数，files参数表示所有文件名组成的数组
    // 例如：files表示[150*****， 150******]
    fs.readdir('questions', (error, files)=>{
        if (error) {
            send('file error', '抱歉，系统错误...')
        }else{
            // 读取文件夹成功
            // 反转数组，目的是把最新的问题显示到最前面
            files = files.reverse()
            var questions = []

            // 调用readFiles方法
            // 参数1：0
            // 参数2：反转后的数组
            // 参数3：空数组
            // 参数4：函数
            readFiles(0, files, questions, function(){
                send('success', '读取数据成功', questions)
            })
        }
    })
})  

// 回答
app.post('/answer', (req, res)=>{
    var username = req.cookies.username

    function send(code, message){
        res.json({code, message})
    }

    if (!username) {
        send('signin error', '请重新登录')
        return
    }
    console.log(req.body)
    // 从前端发送过来的数据确定应该回答的问题是哪一个？
    var fileName = `questions/${req.body.wenti}.txt`

    // 把已登录用户的用户名、回答时间、ip都放入请求体
    req.body.username = username
    req.body.ip = req.ip
    req.body.time = new Date()

    // 原理：读取文件，在文件尾部添加answers属性
    fs.readFile(fileName, (error, data)=>{
        if (error) {
            send('file error', '抱歉，系统错误！')
        }else{
            var question = JSON.parse(data)
            // 如果question没有answers属性，则添加
            if (!question.answers) question.answers = []
            // 把"答案"放入questions属性里
            question.answers.push(req.body)

            // 把回答后的问题写入文件
            fs.writeFile(fileName, JSON.stringify(question), (error)=>{
                if (error) {
                    send('file error', '抱歉，系统错误！')
                }else send('success', '回答提交成功！')
            })
        }
    })
})

// 上传头像
// uploads.single(参数)表示上传单个文件
// 参数：表示name属性的值
app.post('/user/photo', uploads.single('photo'), (req, res)=>{
    console.log('开始上传')
    res.json({
        code: 'success',
        message: '上传成功·'
    })
})

app.listen(3000, ()=>{
    console.log('服务器启动成功。。。')
})