(function(){
    setTimeout(function(){
        bindListen();
        initFrame();
    },500);
})();


function initFrame(){
    let username,password;
    let html=$('#auth_comfirm').children();
    let _userInput=$('#username');
    let _password=$('#password');
    let _rememberMe=$('#remember_auth');
    loadAuth(function(){
        _userInput.val(window.localAuth.username);
        _password.val(window.localAuth.password);
        _rememberMe.attr('checked',window.localAuth.rememberMe);
        listenRequset();
        //尝试连接host
        fetchHost();  
    });
    function listenRequset(){
        //监听web request
        chrome.webRequest.onAuthRequired.addListener(function(details, callbackFn) {
            $(window._reportFrame).fadeOut();
            jConfirm(html,{
                title:details.statusCode+':'+details.statusLine,
                onClose:function(r){
                    $('#auth_comfirm').html(html);
                    if(!r){
                        return true;
                    }
                    username=$("#username").val();
                    password=$("#password").val();
                    //存储auth
                    if(_rememberMe.is(":checked")){
                        window.localAuth.username=username;
                        window.localAuth.password=password;
                        window.localAuth.rememberMe=true;
                    }else{//清空auth
                        window.localAuth.username='';
                        window.localAuth.password='';
                        window.localAuth.rememberMe=false;
                    };
                    saveAuth();
                    callbackFn({
                        authCredentials:{username:username,password:password}
                    });
                }
            });
            jBottomAlert('无法连接到host,请确认通过了服务器basic认证',{
                duration:1000,
                transition:500,
                parentCss:{'z-index':99999},
            });
        },{urls: [window.host+'/*']},['asyncBlocking']); //asyncBlocking  blocking时没有callbackFn，直接return {username,password}?>
    }

    function fetchHost(){
        //尝试 fetch host
        fetch(window.host).then(function(r){
            if(r.status!=401){
                init();
            }else{
                jBottomAlert("错误代码:"+r.status);
            }
        });
    }
 
    function init(){
        var _main=document.getElementsByTagName('main')[0];
        var _reportFrame=document.getElementById('report-frame');
        if(_reportFrame==null){
            _reportFrame=$('<iframe id="report-frame"></iframe>')[0];
            document.body.append(_reportFrame);
        }
        window._main=_main;
        window._reportFrame=_reportFrame;
        _reportFrame.setAttribute('src','');
        _reportFrame.setAttribute('src',window.host+'/monitor/index');
    }
  
    function loadAuth(func){
       chrome.storage.sync.get({auth:{username:'',password:'',rememberMe:false}},function(item){
            window.localAuth=item['auth'];
            func();
       });
    }
    function saveAuth(){
        chrome.storage.sync.set({'auth':window.localAuth});
    }



    //NOT-USEFUL
    function sendBasicAuth(callback){
        //js function: atob(); btoa(); 中文 encodeURIComponent
        var r = new XMLHttpRequest();
        r.open("GET",window.host, true);
        r.onreadystatechange = function () {
            if (r.readyState != 4 || r.status != 200) return;
            callback();
        };
        r.setRequestHeader("Authorization", "basic "+btoa(username+':'+password));
        r.send();
    }
}




function bindListen(){
    //监听post message
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
                        checkMonitor();
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


/**
 * 检查是否开启了background monitor
 */

function checkMonitor(){
    var background=chrome.extension.getBackgroundPage();
    if(!background.monitorRunning){
        background.runMonitor();
    }
}