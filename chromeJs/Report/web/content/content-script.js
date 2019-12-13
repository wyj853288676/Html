(function(){
    listenPage();
})();


function listenPage(){
    $("#release-btn").on('click',function(e){
        
        let sid=$(this).data('sid');
        if(sid==undefined||sid==''){
            return true;
        };
        send2Background({sid:sid,status:1,title:$(this).data('title'),name:$(this).data('name')});
    });
    //正在运行的脚本
    $('#stop-btn').each(function(){
        let sid=$(this).data('sid');
        if(sid==undefined||sid==''){
            return true;
        };
        send2Background({sid:sid,status:$(this).data('status'),title:$(this).data('title'),name:$(this).data('name')});
    });

}

function send2Background(data,callback){
    callback=callback?callback:function(){};
    chrome.runtime.sendMessage(data, callback);
}