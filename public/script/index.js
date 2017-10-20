// 读取"cookie"中的内容
var username = $.cookie('username')
console.log(username)

if(username){
    // 如果有用户登录则把用户名显示到页面上
    $('#user').find('span').last().text(username)
}
else{
    $('#user').find('span').last().text('登录').end().end().removeAttr('data-toggle').click(function(){
        // 没用用户登录就跳转到"登录"页面
        location.href = 'signin.html'
    })
}

// 点击"提问"
$('#ask').click(function(){
    // 判断是否有用户登录
    if(username){
        // 有用户登录跳转到"提问"页面
        location.href = 'ask.html'
    }
    else{
        // 无用户登录跳转到"登录"页面
        location.href = 'signin.html'
    }
})

// 注销
$('.navbar .dropdown-menu li').last().click(function(){
    $.get('/user/signout', null, function(res){
        if(res.code == 'success'){
            location.href = '/'
        }
    })
})

$.get('/questions', null, function (res) {
    console.log(res)

    // 使用arttemplate
    var html = template('question-template', res)
    $('.questions').html(html)
})

// 点击"问题"时跳转到answer.html
$('.questions').delegate('[question]', 'click', function () {
    // 在这里把"问题"的文件名写入cookie
    // 方便在"回答"页面找到该文件名，把文件名发送到服务端
    $.cookie('question', $(this).attr('question'))
    console.log($.cookie('question'))
    // 跳转
    location.href = 'answer.html'
})

// 模板引擎的辅助函数
template.helper('ms', function (t) {
    t = new Date(t)
    // 返回毫秒
    return t.getTime()
})

template.helper('formatTime', function(t){
    t = new Date(t)
    
    var M = t.getMonth() + 1,
        d = t.getDate(),
        h = t.getHours(),
        m = t.getMinutes()

    M = M < 10 ? '0' + M : M
    d = d < 10 ? '0' + d : d
    h = h < 10 ? '0' + h : h
    m = m < 10 ? '0' + m : m
    
    return t.getFullYear() + '-' + M + '-' + d + ' ' + h + ':' + m
})

template.helper('formatIP', function(ip){
    if(ip.startsWith('::1')){
        return '127.0.0.1'
    }
    if(ip.startsWith('::ffff:')){
        return ip.substr(7)
    }
})