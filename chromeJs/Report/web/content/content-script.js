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
}

function send2Background(data,callback){
    callback=callback?callback:function(){};
    chrome.runtime.sendMessage(data, callback);
}