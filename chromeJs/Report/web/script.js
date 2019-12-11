(function(){
    window.host='http://www.report_nint.com';
    initFrame();
    bindListen();
})();


function initFrame(){
    var _main=document.getElementsByTagName('main')[0];
    var _reportFrame=document.getElementById('report-frame');
    //listen login frame message
    window.addEventListener('message',function(e){
        var data=e.data;
        var origin=data.origin;
        //只接受 来自 host 的 message
        if(origin.indexOf(window.host)==-1){
            return true;
        }
        post2Report('msg received');
        switch(data['errorCode']){
            case 1:
                //errorCode=1统一表示frame窗口加载完毕
                $(_reportFrame).fadeIn();
                break;
            case 0:
                switch(origin){
                    case host+'/site/login':
                        //success login
                        $(_reportFrame).fadeOut();
                        getDataFromReport(func)
                        break;
                    case host+'/monitor/index':
                        break;
                }
                break;
        }
       
    });
    var func=function(data){
        if(data['errorCode']==0){
            $(_reportFrame).fadeOut();
            _main.innerHTML=data['html'];
            initProgressBar();
            $(_main).fadeIn();
        }else{
            if(_reportFrame.getAttribute('src')==''){
                _reportFrame.setAttribute('src',host+'/site/login');
            }
            $(_main).fadeOut();
        }
    }
    getDataFromReport(func);
}


function getDataFromReport(func,data){
    data=arguments[1]?arguments[1]:{};
    $.ajax({
        url:host+'/monitor/',
        type: "POST",
        data: data,
        dataType:'json',
        async:'true',
        success:func ,
        error: function() {
            jAlert('Failed!');
        },
    });
}


function post2Report(data){
    let _reportFrame=document.getElementById('report-frame');
    _reportFrame.contentWindow.postMessage(data,window.host+'/*');
}





function bindListen(){
    $('main').delegate('div.ul-title','click',function(e){
        if(e.target!=e.currentTarget){
            return true;
        }
        let _ul= $(this).children('ul.script-ul');
        _ul.toggleClass('collapse');
        $(this).toggleClass('active');
    });

}


function initProgressBar(){
    $(".script-li.status-2 .progress-bar").css('width','calc(100% - 40px)');
}