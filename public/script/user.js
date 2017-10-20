$('#goBack').click(function () {
    history.go(-1)
})

$('#home').click(function () {
    location.href = '/'
})

$('form').submit(function (ev) {
    ev.preventDefault();
    
    // 使用FormData对象上传文件
    // this：表单
    console.log(this)
    var data = new FormData(this)

    $.post({
        url: '/user/photo',
        data: data,
        // 
        contentType: false,
        // 表单的编码类型如果为formdata
        // 应该把processData设置为false
        // 它的作用：不希望转换表单内容编码
        processData: false,
        // 请求成功的回调函数
        success: function (res) {
            if (res.code == 'success') {
                location.href = '/'
            }else{
                $('.modal-body').text('上传失败')
                $('.modal').modal('show')
            }
        }
    })
})