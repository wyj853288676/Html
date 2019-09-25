function addContent(){
    let count=$("#wrap").children('div.content').length;
    if(count>=9){
        alert('最多九个！！！');
        return ;
    }

    $("#wrap").append("<div class='content'></div>")
    
}

function deleteContent(){
    let count=$("#wrap").children('div.content.delete').length
    $("#wrap").children('div.content:nth-last-child('+(count+1)+')').addClass('delete');
    
    setTimeout(function(){
        $("#wrap").children('div.content:last-child').remove();
    },450);
}