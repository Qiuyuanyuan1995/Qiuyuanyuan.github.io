$('#goBack').click(function(){
    history.go(-1)
})

$('#home').click(function(){
    location.href = 'index.html'
})

// 读取cookie里的问题名称再存入变量question中
var question = $.cookie('question')
console.log(question)

$('form').submit(function (ev) {
    ev.preventDefault();
    console.log('表单要提交啦')
    // 把表单数据序列化为数据，方便加工数据
    // formData：数组
    var formData = $(this).serializeArray()
    formData.push({
        name: 'wenti',
        value: question
    })
    console.log(formData)
    $.post(
        '/answer',
        formData,
        function (res) {
            $('.modal-body').text(res.message)
            $('.modal').modal('show')
            .on('hidden.bs.modal', function () {
                if (res.code == 'success') {
                    location.href = '/'
                }
            })
        }
    )
})