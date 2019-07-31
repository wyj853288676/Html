
//自定义trim
function myTrim(x) {
    return x.replace(/^\s+|\s+$/gm,'');
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

;(function ($){
    $.fn.bottomBar=function(inOptions){
        var options={
            body:"body",
            hasBackground:true,
            title:"Nint China",
            topTitle:"· Nint BI ·",
            height:"40vh",
            onClose:(function(){}),//关闭后的回调函数
        }
        $.extend(options,inOptions);
        var _this=$(this);
        _this.addClass('active');
        _this.css({position:"relative"});
        var _container=$(document.createElement("div"));
        var _content=$(document.createElement("div"));
        var _header=$(document.createElement("div"));
        var _removeBtn=$(document.createElement("button"));
        // var _parent=_this.parent();
        var _parents=[];//支持多个dom添加
        var _contentChild=$(document.createElement("div"));
        _this.each(function(index){
            _parents[index]=$(this).parent();
        });
        _container.addClass('bottom-bar-container');
        _content.addClass("bottom-bar-content");
        _header.addClass("bottom-bar-header");
        _contentChild.addClass("bottom-bar-content-child");
        _removeBtn.addClass("bottom-bar-remove-btn ");
        if(!options['hasBackground']){
            _container.addClass('no-background');
        }

        //title
        if(myTrim(options['title'])!=''){
            _header.append("<span class='bottom-bar-title text-muted'>"+options['title']+"</span>");
        }
        //top-title
        if(myTrim(options['topTitle'])!=""){
            _container.addClass('top-titled');
            _content.attr('top-title',options['topTitle']);
        }
        //remove-btn
        _removeBtn.append("×");
        _header.append(_removeBtn);
        //header
        _content.append(_header);
        //content
        _container.append(_content);
        //this
        _contentChild.append(_this);
        //content-child
        _contentChild.append("<span class='bottom-bar-title ' style='margin-top:5px;color:#eee !important'>最後に</span>");
        _content.append(_contentChild);
        //containter
        $(options['body']).append(_container);
        
        //高度设置
        _content.css('height',options['height']);
        function removeContainer(){
            _container.addClass('removed');
            //执行回调函数
            (options['onClose']());
            setTimeout(function(){
                _this.removeClass('active');
                // _parent.append(_this);
                //多个parent
                _this.each(function(index){
                    _parents[index].append($(this));
                })
                _container.remove();
            },400);
        }
        //监听
        _removeBtn.on('click',function(){
            removeContainer();
         
        });
        _container.on('click',function(e){
           if(e.target==e.currentTarget){
               removeContainer();
           }
        });
    };

})(jQuery);


/**
 * 说明：配置见options
 * ① hasBackground=true时，剩余部分会被偏黑色的颜色覆盖，点击此区域会关闭sidebar
 * ② 关闭时会把jquery对象返回给他原来的parent,使用的是append()方法， 所以不一定会返回到原来DOM树的位置，如果jquery对象返还后是可见的，
 * 为了不使位置发生变化尽量使parent只有这一个子元素
 * ③执行后返回sidebar的jquery对象，方便执行你的query操作
 * ④关闭sidebar的方法例子：$(selector).sideBar(); 关闭sidebar:$(selector)[0].removeSidebar()；（注意必须是js对象，不能是jquery对象）
 */
;(function ($){
    $.fn.sideBar=function(inOptions){
        let options={
            body:$("body"),
            direction:'right',//侧边栏位于左边还是右边
            hasBackground:false,//container是否有背景，如果true，则container的宽度是100%;如果false则container的宽度等于设置的sidebar 宽度
            title:"Nint China",
            width:"40vw",//sidebarcontent的宽度
            maxWidth:'90vw',//尽量不要改这个
            contentOpacity:1,//透明度设置
            onClose:(function(){}),//关闭后的回调函数
            opacityChangeHover:false,//hover时提高opacity
            fullOpacity:false,//是否不透明
            leftShadow:true,//是否给sidebar边上添加阴影
            footerSpan:false,//提示用户这是sidebar的底部 <span class='jside-bar-title '>最後に</span>
        }
        $.extend(options,inOptions);
        let _this=$(this);
        _this.addClass('active');
        _this.css({position:"relative"});
        let _container=$(document.createElement("div"));
        let _content=$(document.createElement("div"));
        let _header=$(document.createElement("div"));
        let _removeBtn=$(document.createElement("button"));
        // let _parent=_this.parent();
        let _parents=[];//支持多个dom添加
        let _contentChild=$(document.createElement("div"));
        _this.each(function(index){
            _parents[index]=$(this).parent();
            this.removeSidebar=removeContainer;
        });
        _container.addClass('jside-bar-container '+options['direction']+'-sidebar');
        _content.addClass("jside-bar-content");
        _header.addClass("jside-bar-header");
        _contentChild.addClass("jside-bar-content-child");
        _removeBtn.addClass("jside-bar-remove-btn ");
        if(!options['hasBackground']){
            _container.addClass('no-background');
        }

        let cssClass='';
        //title
        if(myTrim(options['title'])!=''){
            _header.append("<span class='jside-bar-title text-muted '>"+options['title']+"</span>");
        }
        //opacity
        if(options['opacityChangeHover']){
            cssClass+=" opacity-change "
        }
        if(options['fullOpacity']){
            cssClass+=" full-opacity ";
        }
        if(!options['leftShadow']){
            cssClass+=" no-shadow"
        }
        _container.addClass(cssClass);
        //remove-btn
        _removeBtn.append("<i class='fa fa-angle-"+(options['direction'])+"'></i>");
        _content.append(_removeBtn);
        //header
        _content.append(_header);
        //content
        _container.append(_content);
        //this
        _contentChild.append(_this);
        //content-child
        if(options['footerSpan']){
            _contentChild.append("<span class='jside-bar-title '>最後に</span>");
        }
        _content.append(_contentChild);
        //containter
        options['body'].append(_container);
        
        //高度设置
        _content.css('width',options['width']).css('max-width',options['max-width']);
        //清晰度设置
        _content.css('opacity',options['contentOpacity']);
        //监听
        _removeBtn.on('click',function(){
            removeContainer();
        });
        _container.on('click',function(e){
           if(e.target==e.currentTarget){
               removeContainer();
           }
        });
        //返回sidebar
        return _container;


        //funtions
        /**
         * 移除sidebar
         */
        function removeContainer(){
            _container.addClass('removed');
            //执行回调函数
            options['onClose']();
            setTimeout(function(){
                _this.removeClass('active');
                // _parent.append(_this);
                //多个parent
                _this.each(function(index){
                    _parents[index].append($(this));
                })
                _container.remove();
            },400);
        }
        
    };

})(jQuery);








/**
 * jAlert 
 */
function jAlert(content,inOptions){
    var options={
        onClose:null,
        parent:$("body"),
        title:"提示",
        removeTime:300,
        whiteImgHeader:false,//使用nint_white.png (.white-img-header)
    }
    $.extend(options,inOptions);
    var _container=$(document.createElement("div"));
    var _panel=$(document.createElement("div"));
    var _panelHeading=$(document.createElement("div"));
    var _panelBody=$(document.createElement("div"));
    var _panelFooter=$(document.createElement("div"));
    var _removeBtnTop=$(document.createElement("button"));
    var _removeBtnBottom=$(document.createElement("button"));

    _container.addClass("alert-container");
    _panel.addClass("alert-panel");
    _panelHeading.addClass("alert-panel-heading");
    _panelBody.addClass("alert-panel-body");
    _panelFooter.addClass("alert-panel-footer");
    _removeBtnTop.addClass("alert-remove-button-top btn-remove");
    _removeBtnBottom.addClass("alert-remove-button-bottom btn-remove btn btn-sm btn-primary hover-lighting btn-china btn-ec no-radius ").html("決定する");
    
    _panelHeading.html("<span class='alert-title-span title-span-pc low-weight-line'>"+(options['title'])+"</span>").append(_removeBtnTop);
    _panelBody.append(content);
    _panelFooter.append(_removeBtnBottom);
    _panel.append(_panelHeading).append(_panelBody).append(_panelFooter);
    _container.append(_panel);

    //添加class
    if(options['whiteImgHeader']){
        _container.addClass('white-img-header');
    }


    options['parent'].append(_container);

    _container.delegate("button.btn-remove",'click',function(){
        _container.addClass("remove");
        if(typeof(options['onClose'])=='function'){
            options['onClose']();
        }
        setTimeout(function(){
            _container.remove();
        },options['removeTime']);
    });

}


/**
 * jConfirm
 */

function jConfirm(content,inOptions){
    var options={
        onClose:null,
        parent:$('body'),
        title:"提示",
        removeTime:300,
    }
    $.extend(options,inOptions);
    var _container=$(document.createElement("div"));
    var _panel=$(document.createElement("div"));
    var _panelHeading=$(document.createElement("div"));
    var _panelBody=$(document.createElement("div"));
    var _panelFooter=$(document.createElement("div"));
    var _removeBtnTop=$(document.createElement("button"));
    var _removeBtnBottom=$(document.createElement("button"));
    var _confirmButton=$(document.createElement("button"));

    _container.addClass("alert-container");
    _panel.addClass("alert-panel");
    _panelHeading.addClass("alert-panel-heading");
    _panelBody.addClass("alert-panel-body");
    _panelFooter.addClass("alert-panel-footer");
    _removeBtnTop.addClass("alert-remove-button-top btn-remove");
    _removeBtnBottom.addClass("alert-remove-button-bottom btn-remove btn btn-sm btn-default hover-lighting btn-china btn-ec no-radius mobile-hide ").html("キャンセル");
    _confirmButton.addClass("alert-remove-button-bottom btn-confirm btn btn-sm btn-primary hover-lighting btn-china btn-ec no-radius ").html("決定する");


    _panelHeading.html("<span class='alert-title-span title-span-pc low-weight-line' style='font-size:14px'>"+options['title']+"</span>").append(_removeBtnTop);
    _panelBody.append(content);
    _panelFooter.append(_confirmButton).append(_removeBtnBottom);
    _panel.append(_panelHeading).append(_panelBody).append(_panelFooter);
    _container.append(_panel);

    options['parent'].append(_container);
    _container.delegate("button.btn-remove,button.btn-confirm",'click',function(e){
        _container.addClass("remove");
        if(typeof(options['onClose'])=='function'){
            if($(e.target).hasClass('btn-remove')){
                options['onClose'](false);
            }else{
                options['onClose'](true);
            }
        }
        setTimeout(function(){
            _container.remove();
        },options['removeTime']);
    });

}

/**
 * 添加loading动画
 * 配置见options：
 * ①背景默认为偏黑色，偏白色可以设置bgWhite为true;
 * ②样式大致有四种： CONTENT中配置了三种，可以指定type 0  1 2 来控制；设置hasContent为false时候为第四种样式
 * ③_container会被返回，可以通过对它的操作（如remove()，addClass('success')）来自定义样式；
 */
function jLoading(inOptions){
    let options={
        parent:$("body"),
        hasContent:true,
        contentWidth:"100px",
        bottom:"0px",//content的bottom
        opaque:false,//不透明
        type:2,//哪一种类型的content
        bgNint:true,//是否有nint.png背景图
        bgWhite:false,//是否用白色背景
        containerOpacity:0.95,
        overflowHidden:false,//是否设置parent overflow-hidden 
        zIndex:99999999999999,
        height:"100%",
    };
    let CONTENT=[
        //white-bar旋转的样式
        "<i class='fa fa-spinner-nint has-border-after'></i>",
        //点旋转的样式
        '<div class="loading-dot-container">        <div class="loading-dot" style="opacity:1;animation-delay:0s"></div>        <div class="loading-dot" style="opacity:0.9;animation-delay:0.1s"></div>        <div class="loading-dot" style="opacity:.8;animation-delay:0.2s"></div>        <div class="loading-dot" style="opacity:.7;animation-delay:0.3s"></div>        <div class="loading-dot" style="opacity:.6;animation-delay:0.4s"></div>        <div class="loading-dot" style="opacity:.5;animation-delay:0.5s"></div>        <div class="loading-dot" style="opacity:.4;animation-delay:0.5s"></div>       </div>',
        //star旋转
        '<div class="loading-dot-container " style="width: 100px; height: 100px;">        <div class="loading-dot loading-star" style="opacity:1;animation-delay:0s"></div>        <div class="loading-dot loading-star" style="opacity:0.9;animation-delay:0.1s"></div>        <div class="loading-dot loading-star" style="opacity:.8;animation-delay:0.2s"></div>        <div class="loading-dot loading-star" style="opacity:.7;animation-delay:0.3s"></div>        <div class="loading-dot loading-star" style="opacity:.6;animation-delay:0.4s"></div>        <div class="loading-dot loading-star" style="opacity:.5;animation-delay:0.5s"></div>        <div class="loading-dot loading-star" style="opacity:.4;animation-delay:0.5s"></div></div>',
        //三色球
        '<div class="loading-ball-container"><div class="loading-ball" style="background:#0c54ac;"></div><div class="loading-ball" style="background:#ecc81d;animation-delay:.5s"></div><div class="loading-ball" style="background:#e94c3c;animation-delay:1s"></div></div>',
    ];
    $.extend(options,inOptions);
    let _container=$(document.createElement("div"));
    let _content;
    _container.addClass("alert-loading-container");
    if(options['hasContent']){
        _container.append(CONTENT[options['type']]);
        _content= _container.children()
        _content.css('width',options['contentWidth']).css('height',options['contentWidth']).css('bottom',options['bottom']);
        if( _content.width()<=50){
            _content.addClass('sm-content');
        }
    }else{
        _container.addClass('no-content');
    }
    //container,content css
    if(options['bgNint']){
        _container.children().addClass("bg-nint");
    }else{
        _container.children().addClass("no-bg-nint");
    }
    if(options['bgWhite']){
        _container.addClass("my-bg-white");
    }
    if(options['opaque']){
        _container.addClass('opaque');
    }
    _container.css("opacity",options['containerOpacity']).css("z-index",options['zIndex']).css('height',options['height']);
    _container.fadeMove=function(inOptions){
        let tempOptions={
            time:200,
        };
        $.extend(tempOptions,inOptions);
        _container.fadeOut(tempOptions['time']);
        options['parent'].css('overflow','');
        setTimeout(function(){
            _container.remove();
        },tempOptions['time']);
    }
    
    options['parent'].append(_container)
        .css('overflow',options['overflowHidden']?'hidden':'')
        .css('position',options['parent'].css('position')=='static'?'relative':'');


    return _container;
}


/**
 * 从底部alert
 */
function jBottomAlert(content,inOptions){
    var options={
        parent:$("body"),
        duration:500 ,//显示500ms,
        transition:500,//动画效果需要的时间
        pointerEvent:false,//pointEvent :none
    };
    $.extend(options,inOptions);
    if(options['parent'].children("div.alert-bottom-parent-container").length==0){
        var _parent=$(document.createElement('div'));
        _parent.addClass("alert-bottom-parent-container");
        options['parent'].append(_parent);
    }else{
        var _parent=options['parent'].children("div.alert-bottom-parent-container");
    }
    var _container=$(document.createElement("div"));
    var _span=$(document.createElement("span"));
    _span.addClass("alert-bottom-span").css('animation-duration',options['transition']+'ms').html(content);
    _container.addClass('alert-bottom-container').append(_span).css('animation-duration',options['transition']+'ms');
    _container.css('pointer-events',options['pointerEvent']?'all':'none');;
    _parent.append(_container);
    _parent.show();
    setTimeout(function(){
        _container.addClass('remove');
        setTimeout(function(){
            _container.remove();
            if(_parent.children('div.alert-bottom-container').length==0){
                _parent.hide();
            }
        },options['transition']);
    },options['duration']+options['transition']);
}



/**
 * top公告
 */
function jBulletin(inOptions){
    let options={
        contents:null,//要添加到公告的jquery对象
        before:null,//公告栏在哪一个dom前面
        after:null,//公告栏在哪一个dom后面
        parent:$("body"),//公告栏的parent； parent，before，after只有一个会生效，优先级为：before,after,parent
        time:7000,//time ms 轮播一次 注意单位是毫秒
        defaultTitle:"<i class='fa fa-bullhorn text-muted' >【お知らせ】</i>",
        mobileDefaultTitle:"<i class='fa fa-bullhorn text-muted' ></i>",
    };
    $.extend(options,inOptions);
    let _container=$(document.createElement("div")).addClass('bulletin-container');
    let _header=$(document.createElement("div")).addClass('bulletin-header text-muted');
    let _viceTitle=$(document.createElement("div")).addClass('vice-title').css('margin-left',5);//副标题可以用来放日期在header中，随着li的变换而变换
    let _body=$(document.createElement("div")).addClass('bulletin-body');
    let _footer=$(document.createElement("div")).addClass('bulletin-footer');
    let _ul=$(document.createElement("ul")).addClass('bulletin-ul');
    let _lis=[];
    let _removeBtn=$(document.createElement("button")).addClass('no-border bulletin-button no-bg text-muted').html("×").css('font-size','20px').attr('title','閉じる');
    let activeIndex=0;//active li是第几个
    let count=0;//多少个li
    options['contents'].each(function(index){
        let _content=$(this);
        let _child=$(document.createElement("div")).addClass('li-child').append(_content);
        let _li=$(document.createElement("li")).addClass('bulletin-li').append(_child).addClass(index==0?'active':'').data('vice-title',_content.data('vice-title')==undefined?'':_content.data('vice-title'));
        _lis.push(_li);
        _ul.append(_li);
        count++;
    });
    _container.append(_header).append(_body).append(_footer);
    _body.append(_ul);
    _footer.append(_removeBtn);
    _header.html(isPC()?options['defaultTitle']:options['mobileDefaultTitle']).append(_viceTitle);
    //在li长度过长或者有多个li的时候，设置定时器来控制公告的轮播
    if(options['before']!=null){
        options['before'].before(_container);
    }else if(options['after']!=null){
        options['after'].after(_container);
    }else if(options['parent']!=null){
        options['parent'].append(_container);
    }
    bindListen();
    bindListenY();
    return _container;

    //公告的上下轮播
    function bindListenY(){
        let _activeLi=_ul.children('li.active');
        _ul.css('margin-top',_ul.offset()['top']-_activeLi.offset()['top']);//ul的transition在css中设置为500ms
        //更新vice-title
        _viceTitle.html(_activeLi.data('vice-title'));
        //限制body最大宽度
        _body.css('max-width',_container.outerWidth()-_footer.outerWidth()-_header.outerWidth());
        setTimeout(function(){
            let interVal=swipeLi(_ul.children('li.active'));
            //swipeLi返回它需要的时间，interVal后执行上下轮播，activeIndex+1,调用bindListenY();
            setTimeout(function(){
                activeIndex=(activeIndex+1)%count;
                _ul.children("li.active").removeClass('active');
                _ul.children("li:eq("+activeIndex+")").addClass('active');
                bindListenY();
            },interVal);
        },700);
      
        
    }
    //左右轮播li , 返回轮播需要的时间
    function swipeLi(dom){
        let transition=options['time'];//默认是10s
        let width=dom.outerWidth();
        let _child=dom.children('div.li-child');
        let realWidth=_child.outerWidth();
        let marginLeft=80;//clone-child margin-left
        if((realWidth-width)>=10){
            let _cloneChild=dom.children('div.li-child').clone().css('margin-left',marginLeft);;
            dom.append(_cloneChild);
            transition=(realWidth+marginLeft)*20;
            //transition最少为3000ms
            transition=transition<3000?3000:transition;
            _child.css('transition','all '+transition+"ms linear");
            let duration=0;
            moveLi();
            function moveLi(){
                _child.css('margin-left',-realWidth-marginLeft);
                setTimeout(function(){
                    _child.css('transition','all 0s').css('margin-left','0');
                    duration+=transition;
                    if(duration>=options['time']){
                        _cloneChild.remove();
                    }else{
                        moveLi();
                    }
                },transition);
            }

        }
        if(transition>=options['time']){
            return transition;
        }else{
            return Math.ceil(options['time']/transition)*transition;
        }
    }
    //其他监听 一般为button
    function bindListen(){
        _removeBtn.on('click',function(){
            _container.slideUp(300,function(){
                _container.remove();
            });
        });
    }
}





