var spans=document.getElementsByClassName('icon-xiazai')
function downloadIcon(i){ 
    spans[i].click();
    setTimeout(function(){
        document.getElementsByClassName('mp-e2e-dialog')[0].getElementsByClassName('download-btns')[0].childNodes[0].click();
        document.getElementsByClassName('mp-e2e-dialog-close')[0].click();
    },1000);
}
var i=0;
var download_flag=true;
function downloadAll(){
    if(i>=spans.length&&!download_flag){
        console.log('Finished; i='+i+' download_flag:'+download_flag);
    }else{
        downloadIcon(i);
        i++;
        setTimeout(function(){
            downloadAll();
        },1500);
    }
}