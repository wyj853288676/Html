(function(){
    listenPage();
})();


function listenPage(){
    $("#release-btn").on('click',function(e){
        let sid=$(this).data('sid');
        send2Background({sid:sid,status:1,title:$(this).data('title'),name:$(this).data('name'),type:'add'});
    });
    //正在运行的脚本
    $('#stop-btn').each(function(){
        let sid=$(this).data('sid');
        send2Background({sid:sid,status:$(this).data('status'),title:$(this).data('title'),name:$(this).data('name'),type:'add'});
    });
    //空闲的脚本 从background的查询队列中删除
    $('#release-btn').each(function(){
        let sid=$(this).data('sid');
        send2Background({sid:sid,status:$(this).data('status'),title:$(this).data('title'),name:$(this).data('name'),type:'delete'});
    });

}

function send2Background(data,callback){
    callback=callback?callback:function(){};
    chrome.runtime.sendMessage(data, callback);
}