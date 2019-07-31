
window.onload=function(){
    if($('#_loading').is(":visible")&&_params['windowLoaded']){
        $('#_loading').fadeOut(1000,alertChangeExplorer);
    }
}
;$(document).ready(function(){
    initDateTimePicker();
    initParams();
    //监听body滚动
    listenScroll();
    //监听input 
    listenInput();
    //添加公告
    addBulletin();
    //左右部分添加滚动条
    addScroll();
    //广告部分mobile下的swipe
    addSwipe();

    setTimeout(function(){
        if(_params['documentReady']&&$('#_loading').is(":visible")){
            $('#_loading').fadeOut(1000,alertChangeExplorer);
        }
    },_params['maxLoadingTime']);//为了避免图片加载时间过长，这里设置了最长等待时间是3秒；
});

var _params={};
function initParams(){
    //判断是pc还是mobile
    _params['isPc']=isPC();
    $('body').addClass(isPC()?'is-pc':'is-mobile');
    //加载是否完成，其他的js里面设置为false时候,需要自行执行 $('#_loading').fadeOut(1000);
    _params['documentReady']=true;
    _params['windowLoaded']=true;
    _params['maxLoadingTime']=3000;

    _params['explorer']=getExplorer;
    _params['isIE']=(getExplorer=='ie');
    $('body').addClass("is-"+getExplorer);

}



/**
 * datetime picker
 */
function initDateTimePicker(){
    //datetimepicker 国际化
    $.fn.datetimepicker.dates['en'] = {
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
        months: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        monthsShort: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        meridiem:    ['am', 'pm'],
        suffix:      ['st', 'nd', 'rd', 'th'],
        today:       'Today',
        clear:       'Clear',
    };
    $("input.date-time-picker").each(function(){
        $(this).datetimepicker({
            startView:2,
            minView:'month',
            format: 'yyyy-mm-dd',
            endDate:$(this).data('enddate'),
            startDate:$(this).data('startdate'),
        });
    })
}

/**
 * 提示更换浏览器
 */
function alertChangeExplorer(){
    let flag=localStorage.getItem('no-check-ie-1');
    if(flag==null||flag==false){
        if(_params['explorer']=='ie'){
            jBottomAlert("<span class='flex-block flex-center'><i class='fa  fa-exclamation-circle' style='font-size:18px'></i> 快適にご利用いただくために、ChromeとMozilla Firefoxの最新バージョンをおすすめします(<a a target='_blank' href='https://www.google.co.jp/intl/ja/chrome/' class='ec-link standard-link top-arrow' style='color:#08a0e3'><i class='fa fa-chrome'> Chrome </i></a>&nbsp;|&nbsp;<a target='_blank' href='https://www.mozilla.org/ja/firefox/new/'class='ec-link standard-link top-arrow' style='color:#08a0e3'><i class='fa fa-firefox'> Firefox</i></a></span>) <a class='ec-link standard-link top-arrow' style='color:white' onclick='noMoreAlert(this)'><i class='fa fa-eye-slash'> </i> このヒントを隠す</a>",
            {duration:10000,transition:1000,pointerEvent:true});
        }
    }
  
}

/**
 * 不再提示IE
 */
function  noMoreAlert(dom){
    $(dom).html("<i class='fa fa-check'></i>");
    localStorage.setItem('no-check-ie-1',true);
}

/**
 * 判断是否为移动设备
 */
var isPC = function ()
{
    var userAgentInfo = navigator.userAgent.toLowerCase();
    var Agents = new Array("android", "iphone", "symbianOS", "windows phone", "ipad", "ipod");
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
    }
    return flag;
};


/**
 * 是否为IE
 */
var getExplorer = (function () {
    var explorer = window.navigator.userAgent,
        compare = function (s) { return (explorer.indexOf(s) >= 0); },
        ie11 = (function () { return ("ActiveXObject" in window) })();
    if (compare("MSIE") || ie11) { return 'ie'; }
    else if (compare("Firefox") && !ie11) { return 'Firefox'; }
    else if (compare("Chrome") && !ie11) {
    if (explorer.indexOf("Edge") > -1) {
            return 'Edge';
    } else {
        return 'Chrome';
    }
    }
    else if (compare("Opera") && !ie11) { return 'Opera'; }
    else if (compare("Safari") && !ie11) { return 'Safari'; }
})();


//自定义trim
function myTrim(x) {
    return x.replace(/^\s+|\s+$/gm,'');
}


/**
 * js定义的number_format
 * 只限整数千分位
 */
function number_format(num) {
    return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
}


// 自定义的slideUp 方法
function mySlideUp(dom,inOptions){
    var options={
        notInMobile:false, //只在pc下执行
        notInPc:false,//只在mobile下执行
        time:500,
        afterSlide:null,
    }
    if($(dom).hasClass('clicked')){
        //防止连续点击造成的显示错误
        return true;
    }
    var _dom=$(dom);
    options=$.extend(options,inOptions);
    if( ( !_params['isPc']&&options['notInMobile'] ) || (_params['isPc']&&options['notInPc']) ){
        return false;
    }
    var arrDom=["INPUT","LABEL",'H5','DIV','BUTTON'];
    if(event.target!=event.currentTarget&&jQuery.inArray(event.target.tagName,arrDom)!=-1){
        return false;
    }
    //start
    selector=$(dom).attr("data-target");
    var length=$(selector).length
    if(length!=0){
        $(dom).addClass('clicked');
        if($(dom).hasClass('slideUp')){
            _dom.removeClass('slideUp').addClass('slideDown');
        }else{
            _dom.removeClass('slideDown').addClass('slideUp');
        }
    }
    $(selector).each(function(index){
        var _this=$(this);
        if(_this.is(":visible")){
            _this.addClass('sliding');
            _this.slideUp(options['time'],function(){
                _this.removeClass("sliding").removeClass("slideDown").addClass("slideUp");
                if(typeof(options['afterSlide'])=='function'){
                    options['afterSlide']();
                }
                if(index==(length-1)){
                    _dom.removeClass('clicked');
                }
            });
        }else{
            _this.css('display','block').addClass('sliding');
            _this.slideDown(options['time'],function(){
                _this.removeClass("slideUp").removeClass("sliding").addClass("slideDown");
                if(typeof(options['afterSlide'])=='function'){
                    options['afterSlide']();
                }
                if(index==(length-1)){
                    _dom.removeClass('clicked');
                }
            });
        }
    });
   
}

/**
 * 监听input
 */
function listenInput(){
    //详细检索input按下回车的事件
    $("#key_value_input").on('keydown',function(e){
        if(e.keyCode==13){
            submitSpecificForm(1,0);
            $(this).nextAll('button').addClass('loading');
        }
    });
    //name=key_value input 的值保持一致
}




/**
 * 跳页
 * func:执行的表单提交函数，默认是searchIndex,提交的表单是share/index的 #indexSearch表单
 * 在pagination中指定func
 */
function jumpPage(page,dom,func){
    func=arguments[2]?arguments[2]:searchIndex;
    dom=arguments[1]?arguments[1]:null;
    if(dom!=null){
        $(dom).parent().parent().find('a.standard-link.active').removeClass('active');
        $(dom).addClass('active');
    }
    func(page);
}

/**
 * 高级检索的跳页
 * asc下一页，desc上一页
 */
function specificJumpPage(sort,start,dom){
    sort=arguments[0]?arguments[0]:'asc';
    start=arguments[1]?arguments[1]:0;
    let _targetForm=$("#specificForm");
    _targetForm.find("input[name='sort']").val(sort);
    _targetForm.find("input[name='start']").val(start);
    $(dom).addClass('active');
    _targetForm.submit();
}



/**
 * 点击添加热词到input
 */
function addTags(dom){
    let _dom=$(dom);
    let text=_dom.data('text');
    let _parent=$('body');
    let _targetInput=$("#key_value_input");
    let _targetForm=$("#specificForm");
    //动画效果
    let _cloneTag=_dom.clone();
    let time=700;
    _cloneTag.addClass('clone-tag ');
    animationTag();
    function animationTag(){
        let indexX=_dom.offset()['left'];
        let indexY=_dom.offset()['top'];
        let targetX=_targetInput.offset()['left'];
        let targetY=_targetInput.offset()['top'];
        let count=0;
        let limit=10;
        _cloneTag.css('top',indexY+'px').css('left',indexX+'px');
        _parent.append(_cloneTag);
        setTimeout(function(){
            _cloneTag.css('top',targetY+10).css('left',targetX+115).css('opacity',0);
            setTimeout(function(){
                _targetForm.find("input[name='type']").val(0);
                _targetInput.val(text);
                submitSpecificForm(0,0,_targetInput.nextAll('button'));//(start,type,dom)
                _cloneTag.remove();
            },time);
        },50);

    };
}

/**
 * specificForm提交
 *  type=0表示普通检索
 *  type=1表示高级检索
 *  dom:一般为点击的button
 */

function submitSpecificForm(start,type,dom){
    start=arguments[0]?arguments[0]:0;
    type=arguments[1]!=undefined?arguments[1]:0;
    dom=arguments[2]?arguments[2]:null;
    let _form=$("#specificForm");
    if(type==0){
        _form.find("input[name='key_value']").val($("#key_value_input").val());
        _form.find("input[name='type']").val(0);
    }else if(type==1){
        _form.find("input[name='type']").val(1);
    }
    if(start>0){
        _form.find("input[name='start']").val(start);
    }
    _form.find("input[name='start']").val(0);
    _form.find("input[name='sort']").val('asc');
    $(dom).addClass('loading');
    _form.submit();
}


/**
 * 添加滚动条 ， 在其他js中不要覆盖掉这个命名
 * ie和手机端不添加滚动条
 */
function addScroll(){
    if(!_params['isPc']||_params['explorer']=='ie'){
        return true;
    }
    let height=$("#index-container").offset()['top']+$("footer").height();
    let _sidebar=$("#share-sidebar");
    let _items=$("#share-items");
    // 左右两边添加滚动条
    _sidebar.addScroll({
        x:false,
        y:{
            maxHeight:"calc(100vh - "+height+"px)",//auto
            hideScroll:false,
            fixHeight:false,
            scrollTopButton:true,
            scrollSpeed:200,
            moveObjectWhenWheel:true,
            toTopRaf:true,
        },
        common:{
            addShadow:false,
            observe:true,
            observeTargets:[$("#bulletin-container")[0]],
            onTargetsChange:[targetsChangeHandler]//监听#hotSearchDOM变化的回调函数，只绑定一个就可以了，不用给share-items也绑定
        },
    });
    _items.addScroll({
        x:false,
        y:{
            maxHeight:"calc(100vh - "+height+"px)",//auto
            hideScroll:false,
            fixHeight:false,
            scrollTopButton:true,
            scrollSpeed:250,
            moveObjectWhenWheel:true,
            toTopRaf:true,
        },
        common:{
            addShadow:false,
            observe:true,
            onResize:function(){scrollReset()},//observe回调函数
        },
    });
    //屏幕变化时重置滚动条的高度，一般是不用自己重新设置高度的，这里因为高度和其他元素（nav-bar-header和footer）的高度相关,所以需要手动重设
    $(window).on('resize',function(){
        scrollReset();
    });

    //其他dom监听到变化的回调函数
    function targetsChangeHandler(dom){
        scrollReset();
    }
    //重新设置高度的function
    function scrollReset(){
        console.log('scroll-reset');
        let newHeight=$("#index-container").offset()['top']+$("footer").height();
        if(newHeight!=height){
            _sidebar[0].resetOptions({
                y:{
                    maxHeight:"calc(100vh - "+newHeight+"px)",//auto
                }
            });
            _items[0].resetOptions({
                y:{
                    maxHeight:"calc(100vh - "+newHeight+"px)",//auto
                }
            });
            _sidebar[0].resetScroll(false,true);//resetX , resetY
            _items[0].resetScroll(false,true);//resetX , resetY
            height=newHeight;
        }
    }
    //显示全部类目时，计算sidebar的最小高度，（position:absolute不能触发高度变化，这里需要js计算）
    let hoverLink=false;
    let hoverContainer=false;
    let timeFunc=null;
    let addMarginFun=null
    $("main").delegate('#link-all-category','mouseover',function(){
        hoverLink=true;
        clearTimeout(addMarginFun);
        addMarginFun=setTimeout(function(){
            let minHeight=$("#allCategoryContainer").outerHeight();
            let panelHeight=$("#sidebar-panel").outerHeight();
            if(panelHeight<minHeight){
                $("#sidebar-panel").css('margin-bottom',minHeight-panelHeight+50);
            }
        },350);
    });
    $("main").delegate('#allCategoryContainer','mouseover',function(){
        hoverContainer=true;
    });
    $("main").delegate('#link-all-category','mouseout',function(){
        hoverLink=false;
        clearTimeout(timeFunc);
        timeFunc=setTimeout(function(){
            if(hoverContainer||hoverLink||$("#allCategoryContainer").is(':visible')){
                return true;
            }
            $("#sidebar-panel").css('margin-bottom',20);
        },350);
    });
    $("main").delegate('#allCategoryContainer','mouseout',function(){
        hoverContainer=false;
        clearTimeout(timeFunc);
        timeFunc=setTimeout(function(){
            if(hoverContainer||hoverLink||$("#allCategoryContainer").is(':visible')){
                return true;
            }
            $("#sidebar-panel").css('margin-bottom',20);
        },700);
    });
}   




/**
 * 广告在手机端添加到swipe的方法
 */
function addSwipe(){
    let _linkContainer;
    let _targetContainer;
    let _parent;
    if(_params['isPc']){
        _linkContainer=$("#advertisement-link-container-pc");
        _targetContainer=$("#advertisement-pc");
        _parent=_targetContainer.parent();
    }else{
        _linkContainer=$("#advertisement-link-container-mobile");
        _targetContainer=$("#advertisement-mobile");
    }
    let _adContainer=$("#advertisement-container");
    let _nextBtn=_targetContainer.nextAll('button.jump-next');
    let _lastBtn=_targetContainer.nextAll('button.jump-last');
    let count=0;//广告数量
    let _activeIndex=0;
    let timeFunc;
    let time=7000;//广告切换的时间间隔，手动切换会重置计时器
    let hoverFlag=false;//指针是否移动到swipe上
    process();
    bindListen();
    initTimeFunc();
    _parent.show();
    function process(){
        //计算广告数量，添加到swipe_contianer中
        _adContainer.children("div.advertisement-container").each(function(index){
            let _this=$(this);
            let _link=$(document.createElement('a'));
            _link.addClass("advertisement-link swipe-link swipe-form-control"+(index==0?' swipe-active ':''));
            _this.addClass('swipe-child'+(index==0?' swipe-active ':''));
            _targetContainer.append(_this);
            _linkContainer.append(_link);
            count++;
        });
        if(count==0){
            return 0;
        }
        if(_activeIndex==0){
            _lastBtn.hide();
        }
        _lastBtn.hide();
        if(count==1){
            _nextBtn.hide();
        }
        //添加swipe
        _targetContainer.addSwipe({
            useDefaultLink:false,
            linkContainer:_linkContainer,
            listenTouch:true,//监听swipeleft swiperight事件
            //切换tab的回调函数 onChange:切换前，afterChange:切换后
            onChange:function(index,newIndex){
                if(newIndex==(count-1)){
                    _nextBtn.hide();
                }else{
                    _nextBtn.show();
                }
                if(newIndex==0){
                    _lastBtn.hide();
                }else{
                    _lastBtn.show();
                }
                _activeIndex=newIndex;
                clearTimeout(timeFunc);
                initTimeFunc();
            },
            afterChange:function(index,newIndex){
            },
        });
    }
    //添加监听
    function bindListen(){
        _parent.on('mouseover',function(){
            hoverFlag=true;
        });
        _parent.on('mouseout',function(){
            hoverFlag=false;
        });
    }
    //计时器
    function initTimeFunc(){
        timeFunc=setTimeout(function(){
            if(hoverFlag){
                return true;
            }
            _targetContainer[0].swipeTo((_activeIndex+1)%count);
        },time);
    }
    
}




/**
 * 监听body滚动
 * 将navbar-header的position设置为fixed
 */
function listenScroll(){
    let limit;//navbar-header的高度，在大于这个高度时，specificForm设置为fixed
    let _object=$("#headerBarNav");
    $(document).scroll(function(e){
        limit=_object.outerHeight();
        if($(document).scrollTop()>limit){
            $("body").css('padding-top',limit);
            _object.addClass('position-fixed');
        }else{
            $("body").css('padding-top',0);
            _object.removeClass('position-fixed');
        }
    })
}

/**
 * distance移动的距离;
 * dom：滚动条对应的元素
 */
function scrollAnimation(distance,dom){
    let _dom=$(dom);
    let height=_dom.scrollTop();
    let count=0;
    let limit=10;
    let num=(height-distance)/limit;
    function move(){
        if(count>limit ){
            _dom.scrollTop(distance);
            return false;
        }
        _dom.scrollTop(height);
        height-=num;
        count++;
        requestAnimationFrame(move);
    }
    move(height);
}

/**
 * mobile下把根目录放到sidebar中
 */
function showCategoryList(){
    $("#allCategoryContainer>ul").sideBar({        
        body:$('body'),
        width:"calc(100vw - 30px)",
        direction:'right',
        title:'第一レベルカテゴリー',//标题
        hasBackground:true,
        onClose:function(){
        },
    }
    );
}





/**
 * 查看商品的销售额
 * rakuten和yahoo用item_code(id),shop_id
 * amazon用pid(id)
 */
function viewSales(dom,market,id,shop_id){
    id=arguments[2]?arguments[2]:0;
    shop_id=arguments[3]?arguments[3]:0;
    let count=$("#searchCount").val();
    if(parseInt(count)==0){
        jAlert("<span><p class='flex-inline flex-center' style='width:100%;margin-bottom:0'>あと<span class=' text-ec' style='font-size:20px;color:#bf1300'>0</span>商品ご覧いただけます</p><p style='width: 100%;text-align:right;margin-bottom:0'>1か月に<span class=' text-ec' style='font-size:20px'>5</span>商品のみご覧いただけます。</p><p style='color:#08a0e3;font-size:14px;margin-bottom:0'> 有料版をご利用いただくと商品単位の売上はもちろん、出店ショップの月商やモール全体の流通額などがご覧いただけます。</p></span>",
        {
            title:"<span style='font-size:20px;color: #08a0e3;'>売上をご覧になりますか？</span>"
        });
    }else{
        jConfirm("<span><p class='flex-inline flex-center' style='width:100%;margin-bottom:0'>あと<span class=' text-ec' style='font-size:20px;color:#08a0e3'>"+count+"</span>商品ご覧いただけます</p><p style='width: 100%;text-align:right;margin-bottom:0'>1か月に<span class=' text-ec' style='font-size:20px'>5</span>商品のみご覧いただけます。</p><p style='color:#08a0e3;font-size:14px;margin-bottom:0'>有料版をご利用いただくと商品単位の売上はもちろん、出店ショップの月商やモール全体の流通額などがご覧いただけます。</p></span>",{
            onClose:function(r){
                if(r){
                    getSales(dom,market,id,shop_id);
                }
             },
             title:"<span style='font-size:20px;color: #08a0e3;'>売上をご覧になりますか？</span>",
         });
    }
 
}


/**
 * ajax获取商品销售额
 */
function getSales(dom,market,id,shop_id){
    $(dom).removeClass('error success').addClass('loading');
    let time=10000;
    $.ajax({
        url:"/share/sales",
        dataType:'JSON',
        type:'POST',
        async:"TRUE",
        data:{
            'market':market,
            'id':id,
            'shop_id':shop_id
        }, 
        success:function(data){
            $(dom).removeClass('loading');
            if(data['errorCode']==0){
                $(dom).html("<span class=''><i class='fa fa-jpy'></i> 売上："+number_format(data['data']['sales'])+"千円</span>")
                .attr('disabled',true).addClass('sales-tag');

                jBottomAlert("<span>あと<span style='font-size:18px'>"+data['data']['count']+"</span> 商品ご覧いただけます</span>",{duration:2500,transition:500});
                $("#searchCount").val(data['data']['count']);
            }else{
                jAlert(data['errorMessage']);
            }
        },
        error:function(){
            $(dom).removeClass('loading').addClass('error');
            setTimeout(function(){
                $(dom).removeClass('success error')
            },time);
            jAlert('ERROR!');
        }
    });
}


/**
 * 添加公告
 * jBulletin的可配置参数见MyAlert.js里面
 */
function addBulletin(){
    jBulletin({
        contents:$("#bulletin a"),
        parent:$("#bulletin-container")
    });
}