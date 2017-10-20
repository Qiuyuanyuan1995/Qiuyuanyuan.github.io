$('#goBack').click(function(){
    history.go(-1)
})

$('#register').click(function(){
    location.href = 'register.html'
})

$('form').submit(function(ev){
    ev.preventDefault()
    
    var data = $(this).serialize()
    
    $.post('/user/signin', data, function(res){
        if(res.code == 'success'){
            location.href = '/'
        }
        else{
            $('.modal-body').text(res.message)
            $('.modal').modal('show')
        }
    })
})