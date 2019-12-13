(function(){
    loadScripts();
    bindListen();
})();


function loadScripts(){
    chrome.storage.sync.get({'nint-report-scripts':{}},function(item){
        window.reportScripts=item['nint-report-scripts'];
        runMonitor();
    });
}
function saveScripts(){
    for(var i in window.reportScripts){
        window.reportScripts[i]['updated']=(new Date()).format();
    }
    chrome.storage.sync.set({'nint-report-scripts':window.reportScripts},function(){
    });
}

function bindListen(){
    // 监听来自content-script的消息
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
    {
        //向reportScripts中添加一个script 包括sid和他加入时的状态
        window.reportScripts[request['sid']]=request;
        saveScripts();
        sendNotification('已开始监控'+request['name']+'的执行情况');
    });
}


function send2Content(){

}

function send2Popup(){
    
}


function sendNotification(msg){
    let options={
        type: 'basic',
        iconUrl: 'web/images/nint.png',
        title: '来自chrome插件的通知：',
        message:'',
    };
    if(typeof msg == 'string'){
        options['message']=msg;
    }else{
        options=$.extend(options,msg);
    }
    chrome.notifications.create(null,options);
}

/**
 * 初始化监控的定时器
 */
function runMonitor(){
    let timeLimit=10000;//每10s请求一次；
    //表示interval是否在执行
    window.monitorRunning=true;
    run();
    window.monitorFunc=setInterval(function(){
        run();
    },timeLimit);


    function run(){
        //队列为空时停止
        if(Object.keys(window.reportScripts).length == 0){
            stopMonitor();
            return true;
        }
        for(var i in window.reportScripts){
            monitorScriptInfo(window.reportScripts[i]);
        };
    }


}

/**
 * 停止monitor
 */
function stopMonitor(){
    clearInterval(window.monitorFunc);
    window.monitorRunning=false;
}

function monitorScriptInfo(scripts){
    console.log((new Date()).format()+' : '+scripts['sid']+"  "+scripts['status']);
    var msg=['执行完毕','发布','开始执行','中断'];
    $.ajax({
        url:window.host+'/manager/check-status',
        type: "POST",
        data: {
            'sid':scripts['sid'],
        },
        dataType:'json',
        async:'true',
        success: function(data) {
            console.log( data['sid'] );
            //若不为发布状态则提示
            data['status']=parseInt(data['status']);
            if(data['status']!=scripts['status']){
                //脚本状态有更新，提示并更新popup
                sendNotification('程序 [ '+data['title']+' ] 已经'+msg[data['status']]+'，刷新界面获得最近的状态。');
                updatePopup();
                //更新这个script的状态
                window.reportScripts[scripts['sid']]['status']=data['status'];
                saveScripts();
            };
            if($.inArray( data['status'] , [0,3] ) > -1 ){
                //中断和执行完的时候，把这个script从队列中删除
                delete window.reportScripts[scripts['sid']];
            };
        },
        error: function() {
            //未登陆或者遇到其他错误时停止monitor
            stopMonitor();
            sendNotification('Report未登陆或者请求遇到错误。请点击popup查看是否登陆');
        },
    });
}


Date.prototype.format = function (fmt) { 
    fmt=arguments[0]?arguments[0]:"yyyy-mm-dd hh:ii:ss";
    var o = {
        "m+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "i+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
    };
    if (/(y+)/.test(fmt)){
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    } 
    for (var k in o){
        if (new RegExp("(" + k + ")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        } 
    }
  
    return fmt;
}

function updatePopup(){
    var popup=chrome.extension.getViews({type:'popup'});
    if(popup.length>0){
        popup[0].initFrame();
    }
}