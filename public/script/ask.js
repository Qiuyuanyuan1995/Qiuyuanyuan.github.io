$('#goBack').click(function(){
    history.go(-1)
})

$('#home').click(function(){
    location.href = '/'
})

$('form').submit(function (ev) {
    // 阻止表单自动提交功能
    ev.preventDefault();
    $.post(
        '/ask',
        $(this).serialize(),
        function (res) {
            $('.modal-body').text(res.message)
            // 显示模态框
            // 使用jQuery事件中的on()方法监听模态框的hidden.bs.modal事件
            $('.modal').modal('show')
            .on('hidden.bs.modal', function () {
                if (res.code == 'success') {
                    location.href = 'index.html'
                }
            })
        }
    )
})