(function(){
    initFrame();
})();


function initFrame(){
    window.addEventListener('message',function(data){
        console.log(data);
    });
    let _mainFrame=document.getElementById('main-frame');
    let _loginFrame=document.getElementById('login-frame');
    let host='http://www.report_nint.com'
    $.ajax({
        url:host+'/monitor/',
        type: "POST",
        data: {
            from:'chrome-agent'
        },
        dataType:'json',
        async:'true',
        success: function(data) {
            if(data['errorCode']==0){
                _mainFrame.innerHTML=data['html'];
            }else{
                _loginFrame.setAttribute('src',host+'/site/login');
                _loginFrame.removeAttribute('hidden');
            }
        },
        error: function() {
            jAlert('Failed!');
        },
    });

 
    
  
}




