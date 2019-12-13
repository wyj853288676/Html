(function(){
    setTimeout(function(){
        initFrame();
        bindListen();
    },500);
})();


function initFrame(){
    var _main=document.getElementsByTagName('main')[0];
    var _reportFrame=document.getElementById('report-frame');
    if(_reportFrame==null){
        _reportFrame=$('<iframe id="report-frame"></iframe>')[0];
        document.body.append(_reportFrame);
    }
    window._main=_main;
    window._reportFrame=_reportFrame;
    _reportFrame.setAttribute('src','');
    _reportFrame.setAttribute('src',host+'/monitor/index');
}


function bindListen(){
    window.addEventListener('message',function(e){
        let origin=e.origin;
        let regReport=window.host.replace(/\/\//,'\\/\\/');
        regReport=new RegExp( regReport.replace(/\./g,'\\.') );
        //只接受来自host的消息
        if(!regReport.test(origin)){
            return true;
        }
        let data=e.data;
        $(_reportFrame).fadeIn();
        //返回msg
        post2Report({errorCode:0,errorMessage:'message received'});
        switch(data.origin){
            case undefined:break;
            case host+'/site/login':
                switch(data['errorCode']){
                    case 1: // state ready
                        jBottomAlert('请先登录');
                        break;
                    case 0: // form submit
                        $(_reportFrame).fadeOut();
                        break;
                }
                break;
            case host+'/monitor/index':
                switch(data['errorCode']){
                    case 1: //state ready
                        jBottomAlert('load finished');
                        break;
                }
                break;
            }
    });
}

function post2Report(data){
    _reportFrame=document.getElementById('report-frame');
    _reportFrame.contentWindow.postMessage(data,window.host+'/*');
}




