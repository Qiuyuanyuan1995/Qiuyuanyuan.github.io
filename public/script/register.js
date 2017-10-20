$('#goBack').click(function(){
    history.go(-1)
})

$('#home').click(function(){
    location.href = 'index.html'
})

$('form').submit(function(ev){
    ev.preventDefault()
    
    var pass = $(':password').map(function(){
        return $(this).val()
    })
    
    if(pass[0] == pass[1]){
        console.log('输入密码相同，准备提交数据')
        
        var data = $(this).serialize()
        console.log(data)
        
        $.post('/user/register', data, function(res){
            console.log(res)
            
            $('.modal-body').text(res.message)
            $('.modal').modal('show')
            .on('hidden.bs.modal', function (e) {
                if(res.code == 'success'){
                    location.href = 'signin.html'
                }
            })
        })
    }
    else{
        $('.modal-body').text('两次输入的密码不一样！')
        $('.modal').modal('show')
    }
})