$(document).ready(function(){
    showTable();
    $(window).resize(function(){
        showTable();
    })
});

var selector;
//左边有offset列不移动
var offset=0;
function showTable(){
    selector="#table_01";
    $("#table_01").removeClass('hide');
    align();
    initScrollx();
    initScrolly();
}

var marginLeft=0;
// 表格对齐
function align(){
    selector="#table_01";
    marginLeft=0;
    offset=0;
    //right-table右移量
    $(selector+" .table-left tr:first td").each(function(index,element){
        var width=$(this).outerWidth();
        var thWidth=$(selector+" .table-header th:eq("+(index)+")").outerWidth();
        if(thWidth>width){
            $(this).css('min-width',thWidth+'px');
            marginLeft+=thWidth;
        }else if(width>=thWidth){
            $(selector+" .table-header th:eq("+index+")").css('min-width',width+'px');
            $(selector+" .table-header-left th:eq("+index+")").css('min-width',width+'px');
            marginLeft+=width;
        }
        $(selector+" .table-right ").css("margin-left",marginLeft+'px');
        offset++;
    });
    $(selector+" .table-right tr:first td").each(function(index,element){
        var width=$(this).outerWidth();
        var thWidth=$(selector+" .table-header th:eq("+(index+offset)+")").outerWidth();
        if(thWidth>width){
            $(this).css('min-width',thWidth+'px');
        }else if(width>thWidth){
            $(selector+" .table-header th:eq("+(index+offset)+")").css('min-width',width+'px');
        }
    });
}


//right-table-length总长度
var rtLength;
var onX=false;
var mouseDownX=false;
//鼠标点下的起点x
var div_x=0;
//移动量
var movex=0;
//progress-scroll现在的偏移量
var indexx=0;
//progress-scroll最大和最小的偏移量
var limitx={};
//progress-scroll长度
var lx=0;
//scrollx长度
var length;
function initScrollx(){
    $(selector+" .scroll-container").html("");
    $(selector+" .scroll-container").html(" <div class='scrollx'><div class='progress-scroll' draggable='false'></div></div><div class='scrolly'><div class='progress-scroll' draggable='false'></div></div>");
    var rightLength=0;
    $(selector+" .table-left tr:first td").each(function(index,element){
        rightLength+=$(this).outerWidth();
    });
    //滚动条总长度
    length=$(selector).outerWidth()-rightLength;
    $(selector+" .scrollx ").outerWidth(length);
    $(selector+" .scrollx ").css("margin-left",rightLength+'px');
    rtLength=$(selector+" .table-right ").outerWidth();
    //progress-scroll长度
    lx=length*length/rtLength;
    $(selector+" .scrollx .progress-scroll").outerWidth(lx);
    //初始limitx 存的是offset
    limitx['left']=$(selector+" .scrollx  .progress-scroll").offset().left;
    // limitx['right']=length+$(selector+" .scrollx  .progress-scroll ").offset().left-lx;
    limitx['right']=length-lx+limitx['left'];
    //添加监听
    $(selector+" .scrollx ").on("mouseover",function(e){
        onX=true;
    });
    $(selector+" .scrollx ").on("mouseout",function(e){
        onX=false;
    });
    $(document).on("mousedown",function(e){
        if(onX){
            mouseDownX=true;
        }
        div_x=e.pageX;
        indexx=$(selector+" .scrollx .progress-scroll ").offset().left;
    });
    $(document).on("mousemove",function(e){
        e.stopProgation;
        e.preventDefault;
        if(mouseDownX){
            movex=e.pageX-div_x;
            if((movex+indexx+0)>=limitx['left']&&(movex+indexx-30)<=limitx['right']){
                horizonMove(movex+indexx-limitx['left']);
            }
        }
    });
    $(document).on("mouseup",function(e){
        mouseDownX=false;
    });
}
//移动横向滚动条和table-right、header
function horizonMove(x){
    $(selector+" .scrollx  .progress-scroll").css('left',x+'px');
    var tx=x*($(selector+" .table-right").outerWidth()-length)/(length-lx);
    $(selector+" .table-right").css('left',(-tx)+'px');
    $(selector+" .table-header").css('left',(-tx)+'px');
    //不能赋值给indexx,因为mousemove还要用到indexx记录鼠标按下时progress-scroll的初始位置
    if($(selector+" .scrollx .progress-scroll ").offset().left-limitx['left']>=10){
        $("#table_01 .table-left").addClass('shadow');
    }else{
        $("#table_01 .table-left").removeClass('shadow');
    }
}


//scrolly

//生成scrolly
var mouseDownY=false;
//left、right表格总高度
var tableHeight;
var onY=false;
//鼠标点下的起点y
var div_y=0;
//移动量
var movey=0;
//progress-scroll现在的偏移量
var indexy=0;
//progress-scroll最大和最小的偏移量
var limity={};
//progress-scroll长度
var ly=0;
//scrolly长度
var height;
function initScrolly(){
    tableHeight=$(selector+" .table-right").outerHeight();
    //显示部分的高度：table-right里面设置了marin-top为50px,所以这里-35即可
    height=$(selector).outerHeight();
    ly=height*(height-35-$(selector+" .table-header th").outerHeight())/tableHeight;
    $(selector+" .scrolly .progress-scroll").css("height",ly+'px');
    //limity 存的是offset
    limity['top']=$(selector+" .scrolly .progress-scroll").offset().top;
    limity['bottom']=height-ly+limity['top'];
    //添加鼠标监听
    $(selector+" .scrolly").on("mouseover",function(e){
        onY=true;
    });
    $(selector+" .scrolly").on("mouseout",function(e){
        onY=false;
    });
    $(document).on("mousedown",function(e){
        if(onY){
            mouseDownY=true;
        }
        div_y=e.pageY;
        indexy=$(selector+" .scrolly .progress-scroll ").offset().top;
    });
    $(document).on("mousemove",function(e){
        e.stopProgation;
        e.preventDefault;
        if(mouseDownY){
            movey=e.pageY-div_y;
            if((movey+indexy+0)>=limity['top']&&(movey+indexy-50)<=limity['bottom']){
                verticalMove(movey+indexy-limity['top']);
            }
        }
    });
    $(document).on("mouseup",function(e){
        mouseDownY=false;
    });
    //绑定键盘事件 左右键移动scroll keycode:37 39 上下键：38 40,unbind防止resize时候重复触发
    $(document).unbind("keydown");
    $(document).on("keydown",function(e){
        //判断是否焦点在表格上
        if($(selector+":hover").html()==undefined){
            return false;
        }
        if(e.keyCode==39||e.keyCode==37||e.keyCode==40||e.keyCode==38){
            e.stopProgation;
            e.preventDefault;
        }
        if(e.keyCode==39){
            indexx=$(selector+" .scrollx .progress-scroll ").offset().left;
            movex=10;
            if((movex+indexx+0)>=limitx['left']&&(movex+indexx-30)<=limitx['right']){
                horizonMove(movex+indexx-limitx['left']);
            }
        }
        else if(e.keyCode==37){
            indexx=$(selector+" .scrollx .progress-scroll ").offset().left;
            movex=-10;
            if((movex+indexx+0)>=limitx['left']&&(movex+indexx-30)<=limitx['right']){
                horizonMove(movex+indexx-limitx['left']);
            }
        }
        if(e.keyCode==40){
            indexy=$(selector+" .scrolly .progress-scroll ").offset().top;
            movey=10;
            if((movey+indexy+0)>=limity['top']&&(movey+indexy-50)<=limity['bottom']){
                verticalMove(movey+indexy-limity['top']);
            }
        }
        else if(e.keyCode==38){
            indexy=$(selector+" .scrolly .progress-scroll ").offset().top;
            movey=-10;
            if((movey+indexy+0)>=limity['top']&&(movey+indexy-50)<=limity['bottom']){
                verticalMove(movey+indexy-limity['top']);
            }
        }
    });
    //绑定滚轮事件 unbind防止重复触发
    $("#table_01").unbind(" mousewheel DOMMouseScroll ");
    $("#table_01").on("mousewheel DOMMouseScroll",function (e) {
        if($(selector+":hover").html()==undefined){
            return false;
        }else{
            e.stopPropagation();
            e.preventDefault();
            var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) ||  // chrome & ie
                (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));              // firefox
            movey=delta>0?-5:5;
            indexy=$(selector+" .scrolly .progress-scroll ").offset().top;
            if((movey+indexy+0)>=limity['top']&&(movey+indexy-50)<=limity['bottom']){
                verticalMove(movey+indexy-limity['top']);
            }
        }
    });
}


function verticalMove(y){
    $(selector+" .scrolly  .progress-scroll").css('top',y+'px');
    var ty=y*($(selector+" .table-right").outerHeight()-height+35)/(height-ly);
    $(selector+" .table-right").css('top',(-ty)+'px');
    $(selector+" .table-left").css('top',(-ty)+'px');
    //添加阴影 不能赋值给indexx,因为mousemove还要用到indexx记录progress-scroll初始位置
    if(($(selector+" .scrolly .progress-scroll ").offset().top-limity['top'])>=10){
        $("#table_01 .table-header").addClass('shadow');
        $("#table_01 .table-header-left").addClass('shadow');
    }else{
        $("#table_01 .table-header").removeClass('shadow');
        $("#table_01 .table-header-left").removeClass('shadow');
    }
}

//bug 屏幕高度变化时，键盘和滚轮控制每次移动的距离会变大