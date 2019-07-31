/**
 * 配置参数说明：
 * inOptions:{
 *      x:{}, //作用于横轴的配置，详细见DEFAULT_OPTIONS_X
 *      y:{}, //作用于纵轴的配置，详细见DEFAULT_OPTIONS_Y
 *      common:{} //通用设置，多半是滚动条的动画效果，或者决定什么时候隐藏滚动条或滚动条的container;详细见DEFAULT_OPTIONS_CSS
 *  }
 * 与addScrolly()相比，配置的参数基本一致，但是增加了键盘控制移动的功能；
 * 添加了滚动条后的对象(必须是js对象)，可以调用verticalMove(),horizonMove方法来控制滚动的距离，默认的距离是移动横纵轴的，要想移动主体，需要加上参数：
 * eg: 
 * $("#test").addScroll({
 *  x:{},//作用于DEFAULT_OPTIONS_X
 *  y:{},//DEFAULT_OPTIONS_Y
 *  common:{},//DEFAULT_OPTIONS_COMMON
 * });
 *  向左移动100px: $("#test")[0].horizonMove(-100,{moveObject:true}) 向下移动100px $("#test")[0].verticalMove(-100,{moveObject:true})（注意正负）;
 *  如果要使用逐帧移动的过渡效果的话，在参数中加入useRaf:true; $("#test")[0].verticalMove(-100,{moveObject:true,useRaf:true});
 * 
 *  js对象获得的方法：verticalMove();horizonMove();resetScroll();
 */

;(function ($){
    $.fn.addScroll=function (inOptions){
        let DEFAULT_OPTIONS_Y={
            maxHeight:300,//container的最大高度      "calc(100% - 10px);" " calc(100vh - 10px)" 都可以      
            fixHeight:true,//true时在高度不足时取较小的高度
            scrollWidth:5,//滚动条宽度                   
            onScroll:null,//滚动发生时的回调函数 ****参数是(y,ty) y:移动滚动条的距离,ty移动object的距离
            observe:true,//是否监听DOM，
            scrollSpeed:60,//滚动条速度
            moveObjectWhenWheel:true,//滚轮事件时是否移动对象是否设置为object而非scrollBar
            scrollTopButton:false,//是否添加scrollTop 按钮
            showScrollTopButton:false,//是否显示scrollTopButton
            toTopRaf:false,//是否toTop启用raf
            hideScrollContainerWhenFull:true,
            hideScroll:true,
        };
        let DEFAULT_OPTIONS_X={
            maxWidth:"100%",
            fixWidth:false,
            scrollHeight:5,
            onScroll:null,
            observe:true,
            scrollSpeed:30,
            moveObjectWhenWheel:true,
            scrollLeftButton:false,
            toLeftRaf:false,
            hideScrollContainerWhenFull:true,
            hideScroll:true,
        };
        let DEFAULT_OPTIONS_COMMON={
            hideScroll:false,//是否在没有hover时候隐藏scroll-container
            hideScrollBar:false,//是否在没有hover时候隐藏scroll-bar
            hideScrollWhenFull:true,//在滚动条长度等于height时，是否隐藏滚动条bar
            hideScrollContainerWhenFull:true,//在滚动条长度等于height时，是否隐藏滚动条container
            animationBar:false, //bar显示时长度由0到100%的动画效果
            useRaf:true,//是否启动raf
            addShadow:true,//是否添加阴影
            observeTargets:[],//其他DOM监听 应该是js对象数组
            observe:false,//是否添加DOM监听，需要动态增删容器内部的元素的时候可以设置为true，只能监听容器和容器内部的变化，外部的无法监听，请自己调用resetScroll()方法（js对象调用）
            onWindowResize:function(){},//window resize的回调函数
            onResize:function(){},//observe的回调函数
            onTargetsChange:[],
        }
        //添加scroll-object容器 要判断是否已经添加了
        function addToScrollObject(dom){
            if(dom.children('.scroll-object').length==0){
                let object=document.createElement("div");
                //不要用html  会导致js重新加载
                $(object).append(dom.children());
                dom.append($(object));
                $(object).addClass('scroll-object'+(ADDY?' scroll-object-y ':'') + (ADDX?' scroll-object-x ':'') ) ;
            }
        }
        //添加滚动条
        function addScrollBar(dom){
            if(dom.children('.scroll-bar-container-y').length==0&&ADDY){
                let container=document.createElement("div");
                let bar=document.createElement("div");
                $(container).addClass('scroll-bar-container scroll-bar-container-y');
                $(bar).addClass('scroll-bar scroll-bar-y');
                //设置宽度
                $(container).css('width',optionsY['scrollWidth']+'px');
                $(container).append(bar);
                dom.append(container);
            }
            if(dom.children('.scroll-bar-container-x').length==0&&ADDX){
                let container=document.createElement("div");
                let bar=document.createElement("div");
                $(container).addClass('scroll-bar-container scroll-bar-container-x');
                $(bar).addClass('scroll-bar scroll-bar-x');
                //设置宽度
                $(container).css('height',optionsX['scrollHeight']+'px');
                container.append(bar);
                dom.append(container);
            }
        }
        //scroll-object和scroll-bar添加到scroll-container
        function addToContainer(dom,_object){
            if(dom.children('.scroll-container').length==0){
                let container=document.createElement("div");
                $(container).addClass('scroll-container'+ (ADDY?' scroll-container-y ':'') + (ADDX?' scroll-container-x ':'') );
                $(container).append(dom.children());
                dom.append(container);
            }
        }

        //添加按钮
        function addButton(dom){
            if(dom.children('.myScroll-button-footer').length==0){
                let buttonContainer=$(document.createElement("div"));
                buttonContainer.addClass("myScroll-button-footer");
                dom.append(buttonContainer);
            }
            //添加myScroll-top-button
            if(optionsY['scrollTopButton']&&dom.children("button.myScroll-top-button").length==0&&ADDY) {
                let topButton=$(document.createElement("button"));
                topButton.addClass('myScroll-top-button').html("<i class='fa  fa-angle-up'></i>").css('display','hidden');
                dom.append(topButton);
            }
            if(optionsX['scrollLeftButton']&&dom.children("button.myScroll-left-button").length==0&&ADDX) {
                let leftButton=$(document.createElement("button"));
                leftButton.addClass('myScroll-top-button myScroll-left-button').html("<i class='fa  fa-angle-left'></i>").css('display','hidden');
                dom.append(leftButton);
            }
            //添加resetButton
            if(dom.children('button.myScroll-reset-button').length==0){
                let resetButton=$(document.createElement("button"));
                resetButton.addClass('myScroll-reset-button').css('display','none').html("重置");
                dom.append(resetButton);
            }
        }

        let ADDX=inOptions['x']==false?false:true;//添加x
        let ADDY=inOptions['y']==false?false:true;//添加y
        if(!ADDX&&!ADDY){
            return true;
        }
        let optionsY=$.extend(DEFAULT_OPTIONS_Y,inOptions['y']);
        let optionsX=$.extend(DEFAULT_OPTIONS_X,inOptions['x']);
        let optionsCommon=$.extend(DEFAULT_OPTIONS_COMMON,inOptions['common']);
        $(this).each(function(){
            /**
             * 垂直移动滚动条 y是移动bar的高度
             * useRaf:使用RAF
             * callback:执行回调函数
             * moveObject:y距离表示移动object的距离
             */
            function verticalMove(y,funOptions){
                if(funOptions==undefined){
                    funOptions={};
                }
                let params={useRaf:false, callback:true,moveObject:false,frame:5, };
                params=$.extend(params,funOptions);
                if(params['moveObject']){
                    y=-1*y*(height-scrollHeight)/(sumHeight-height);
                }
                if(y<0||height>=sumHeight){
                    y=0;
                }else if((y+scrollHeight)>height){
                    y=height-scrollHeight;
                }
                ty=-1*y*(sumHeight-height)/(height-scrollHeight);
                ty=ty<=0?ty:0;
                onVerticalMove();
                if(params['useRaf']&&optionsCommon['useRaf']){
                    rafMove(y,[_scrollBarY],'margin-top',params['frame']);
                    rafMove(ty,[_object],'margin-top',params['frame']);
                }else{
                    _scrollBarY.css("margin-top",y+'px');
                    _object.css("margin-top",ty+'px');
                }
                //伴随执行函数
                function onVerticalMove(){
                    if(optionsCommon['addShadow']){
                        if(y>0){
                            _objectContainer.addClass('shadow-top');
                        }else{
                            _objectContainer.removeClass('shadow-top');
                        }
                    }
                    if(optionsY['scrollTopButton']&&ADDY){
                        if(y>0){
                            _toTopButton.show();
                        }else{
                            _toTopButton.hide();
                        }
                    }
                    if(typeof(optionsY['onScroll'])=='function'&&params['callback']){
                        (optionsY['onScroll'])({'y':y,'ty':ty});
                    }
                    let temp=_scrollBarY.offset()['top']-_scrollContainerY.offset()['top'];
                    toTop=temp<=1;
                    toBottom=(temp+scrollHeight-height)>=-1;
                }
            }

            function horizonMove(x,funOptions){
                if(funOptions==undefined){
                    funOptions={};
                }
                let params={useRaf:false, callback:true,moveObject:false,frame:5 };
                params=$.extend(params,funOptions);
                if(params['moveObject']){
                    x=-1*x*(width-scrollWidth)/(sumWidth-width);
                }
                if(x<0||width>=sumWidth){
                    x=0;
                }else if((x+scrollWidth)>width){
                    x=width-scrollWidth;
                }
                tx=-1*x*(sumWidth-width)/(width-scrollWidth);
                tx=tx<=0?tx:0;
                onHorizonMove();
                if(params['useRaf']&&optionsCommon['useRaf']){
                    rafMove(x,[_scrollBarX],'margin-left',params['frame']);
                    rafMove(tx,[_object],'margin-left',params['frame']);
                }else{
                    _scrollBarX.css("margin-left",x+'px');
                    _object.css("margin-left",tx+'px');
                }

                //伴随执行函数
                function onHorizonMove(){
                    if(optionsCommon['addShadow']){
                        if(x>0){
                            _objectContainer.addClass('shadow-left');
                        }else{
                            _objectContainer.removeClass('shadow-left');
                        }
                    }
                    if(optionsX['scrollLeftButton']&&ADDX){
                        if(x>0){
                            _toLeftButton.show();
                        }else{
                            _toLeftButton.hide();
                        }
                    }
                    if(typeof(optionsX['onScroll'])=='function'&&params['callback']){
                        (optionsX['onScroll'])({'x':x,'tx':tx});
                    }
                }
            }
            /**
             * 监听
             */
            function bindListen(){
                let onBarY=false,onBarX=false,downBarX=false,downBarY=false; //判断mouseover mousedown
                let indexy=0;
                let indexx=0;
                let wheelEventStop=true;//阻止滚轮事件冒泡
                let pushShift=false;
                let moves={39:-1,37:1,40:-1,38:1};//keydown每次移动的距离 左 右 下 上
                let mouseDownIntervalFuncX;//用户在X轴上持续按下鼠标时候执行的interval函数
                let mouseDownIntervalFuncY;//用户在Y轴上持续按下鼠标时候执行的interval函数
                let scrollCountY=0;//滚轮计数器
                let scrollCountLimit=5;
                if(ADDY){
                    _scrollBarY.on("mouseover",function(){onBarY=true;clearInterval(mouseDownIntervalFuncY); });
                    _scrollBarY.on("mouseout",function(){onBarY=false; });
                    _scrollBarY.on('mousedown',function(e){
                        e.stopPropagation();
                        e.preventDefault();
                        indexy=e.pageY-parseInt(_scrollBarY.css('margin-top').replace('px',''));
                        if(onBarY){
                            downBarY=true;
                        }else{
                            downBarY=false;
                        }
                    });
                    _scrollContainerY.on("mousedown",function(e){
                        // let tempY=(e.pageY>_scrollBarY.offset()['top'])?(e.pageY - _scrollContainerY.offset()['top']-scrollHeight):(e.pageY - _scrollContainerY.offset()['top']);
                        let tempY=(e.pageY>_scrollBarY.offset()['top'])?40:-40;
                        mouseDownIntervalFuncY=setInterval(function(){
                            if(e.target==e.currentTarget){
                                verticalMove(tempY+parseInt(_scrollBarY.css('margin-top').replace('px','')) ,{useRaf:true});
                            }else{
                                clearInterval(mouseDownIntervalFuncY);
                            }
                        },100);
                    });
                    _scrollContainerY.on("mouseout",function(e){
                        clearInterval(mouseDownIntervalFuncY);
                    });
                }
                if(ADDX){
                    _scrollBarX.on("mouseover",function(){onBarX=true;clearInterval(mouseDownIntervalFuncX);});
                    _scrollBarX.on("mouseout",function(){onBarX=false;});
                    _scrollBarX.on('mousedown',function(e){
                        e.stopPropagation();
                        e.preventDefault();
                        indexx=e.pageX-parseInt(_scrollBarX.css('margin-left').replace('px',''));
                        if(onBarX){
                            downBarX=true;
                        }else{
                            downBarX=false;
                        }
                    });
                    _scrollContainerX.on("mousedown",function(e){
                        // let tempX=(e.pageX>_scrollBarX.offset()['left'])?(e.pageX - _scrollContainerX.offset()['left']-scrollWidth):(e.pageX - _scrollContainerX.offset()['left']);
                        let tempX=(e.pageX>_scrollBarX.offset()['left'])?40:-40;
                        mouseDownIntervalFuncX=setInterval(function(){
                            if(e.target==e.currentTarget){
                                horizonMove(tempX+parseInt(_scrollBarX.css('margin-left').replace('px','')) ,{useRaf:true});
                            }else{
                                clearInterval(mouseDownIntervalFuncX);
                            }
                        },100);
                    });
                    _scrollContainerX.on("mouseout",function(e){
                        clearInterval(mouseDownIntervalFuncX);
                    });
                }
                $(document).on('mouseup',function(){downBarY=false;downBarX=false;clearInterval(mouseDownIntervalFuncX);clearInterval(mouseDownIntervalFuncY);});
                $(document).on('mousemove',function(e){
                    y=e.pageY-indexy;
                    x=e.pageX-indexx;
                    if(downBarY){
                        e.preventDefault();
                        verticalMove(y);
                        _this.addClass('on-scroll-y on-scroll');
                    }else if(downBarX){
                        e.preventDefault();
                        horizonMove(x);
                        _this.addClass('on-scroll-x on-scroll');
                    }else{
                        _this.removeClass('on-scroll-x on-scroll-y on-scroll');
                    }
                });
                _this.on('keyup',function(e){
                    if(e.keyCode==16){
                        pushShift=false;
                    }
                })
                //自动focus,只focus一次
                // _this.on('mouseover',function(){
                //     _this.focus();
                //     _this.unbind('mouseover');
                // });
                //键盘事件
                _this.on("keydown",function(e){
                    if(e.target!=e.currentTarget){
                        return true;
                    }
                    pushShift=false;
                    if($.inArray(e.keyCode,[39,37,40,38,16])>=0){//右，左，下，上，shift
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    if($.inArray(e.keyCode,[39,37,40,38])>=0){
                        if($.inArray(e.keyCode,[39,37])>=0&&ADDX){
                            move=moves[parseInt(e.keyCode)]*optionsX['scrollSpeed'];
                            if(optionsX['moveObjectWhenWheel']){
                                horizonMove(move+parseInt(_object.css('margin-left').replace('px','')),{useRaf:optionsCommon['useRaf'],moveObject:true}) ;
                            }else{
                                horizonMove(-move+parseInt(_scrollBarX.css('margin-left').replace('px','')),{useRaf:optionsCommon['useRaf'],moveObject:false}) ;
                            }
                        }else if(ADDY){
                            move=moves[parseInt(e.keyCode)]*optionsY['scrollSpeed'];
                            if(optionsY['moveObjectWhenWheel']){
                                verticalMove(move+parseInt(_object.css('margin-top').replace('px','')),{useRaf:optionsCommon['useRaf'],moveObject:true}) ;
                            }else{
                                verticalMove(-move+parseInt(_scrollBarY.css('margin-top').replace('px','')),{useRaf:optionsCommon['useRaf'],moveObject:false}) ;
                            }
                        }
                    }else if(e.keyCode==16){
                        pushShift=true;
                    }
                
                });
                //滚动事件
                _this.on("mousewheel DOMMouseScroll",function(e) {  
                    let delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) ||  // chrome & ie
                    (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));              // firefox
                    let movey=delta>0?optionsY['scrollSpeed']:-optionsY['scrollSpeed'];
                    let movex=delta>0?optionsX['scrollSpeed']:-optionsX['scrollSpeed'];
                    if(pushShift&&ADDX){
                        if(optionsX['moveObjectWhenWheel']){
                            horizonMove(movex+parseInt(_object.css('margin-left').replace('px','')),{useRaf:optionsCommon['useRaf'],moveObject:true}) ;
                        }else{
                            horizonMove(-movex+parseInt(_scrollBarX.css('margin-left').replace('px','')),{useRaf:optionsCommon['useRaf'],moveObject:false}) ;
                        }
                    }else if(ADDY){
                        if(optionsY['moveObjectWhenWheel']){
                            verticalMove(movey+parseInt(_object.css('margin-top').replace('px','')),{useRaf:optionsCommon['useRaf'],moveObject:true}) ;
                        }else{
                            verticalMove(-movey+parseInt(_scrollBarY.css('margin-top').replace('px','')),{useRaf:optionsCommon['useRaf'],moveObject:false}) ;
                        }
                    }
                    //事件冒泡
                    if((toTop&&delta>0)||(toBottom&&delta<0)){
                        scrollCountY++;
                    }else {
                        scrollCountY=0
                    }
                    if(scrollCountY<=scrollCountLimit&&scrollHeight<height){
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
                //对mobile touch事件的支持
                let mobileTouchY=0;
                let mobileTouchX=0;//touchmove记录
                let countTouchX=0;//touchMove计数器
                let countTouchY=0;//touchMove计数器
                let originTouchY=0;
                let originTouchX=0;//记录在limitTouch次之前touch的位置
                let limitTouch=10;
                _this.on("touchstart",function(e){
                    if(e.target==e.currentTarget){
                        e.preventDefault();
                    }
                    let _touch = e.originalEvent.targetTouches[0];
                    originTouchX=mobileTouchX=indexx=_touch.pageX;
                    originTouchY=mobileTouchY=indexy=_touch.pageY;
                    //raf计数器
                    if(ADDX){
                        _scrollBarX[0].rafCount=(_scrollBarX[0].rafCount==undefined?0:(_scrollBarX[0].rafCount+1));
                    }
                    if(ADDY){
                        _scrollBarY[0].rafCount=(_scrollBarY[0].rafCount==undefined?0:(_scrollBarY[0].rafCount+1));
                    }
                    _object[0].rafCount=(_object[0].rafCount==undefined?0:(_object[0].rafCount+1));
                    if(ADDY){
                        verticalMove(parseInt(_object.css('margin-top').replace('px','')),{moveObject:true,useRaf:true});
                    }
                    if(ADDX){
                        horizonMove(parseInt(_object.css('margin-left').replace('px','')),{moveObject:true,useRaf:true});
                    }
                });
                _this.on("touchmove",function(e){
                    let _touch = e.originalEvent.targetTouches[0];
                    x=mobileTouchX-_touch.pageX;
                    y=_touch.pageY-mobileTouchY;
                    if(!(toTop&&y>0)&&!(toBottom&&y<0)){
                        e.preventDefault();
                    }
                    if(ADDX&&Math.abs(x)>=Math.abs(y)){
                        countTouchX++;
                        horizonMove(x+parseInt(_object.css('margin-left').replace('px','')),{moveObject:true,useRaf:false});
                    }
                    if(ADDY&&Math.abs(y)>=Math.abs(x)){
                        countTouchY++;
                        verticalMove(y+parseInt(_object.css('margin-top').replace('px','')),{moveObject:true,useRaf:false});
                    }
                    mobileTouchY=_touch.pageY;
                    mobileTouchX=_touch.pageX;
                    if(countTouchY>limitTouch){
                        countTouchY=0;
                        originTouchY=_touch.pageY;
                    }
                    if(countTouchX>limitTouch){
                        countTouchX=0;
                        originTouchX=_touch.pageX;
                    }
                });
                _this.on("touchend",function(e){
                    if(e.target==e.currentTarget){
                        e.preventDefault();
                    }
                    let _touch = e.originalEvent.changedTouches[0];
                    if(ADDX&&Math.abs(_touch.pageX-originTouchX)>100){
                        //raf计数器
                        if(ADDX){
                            _scrollBarX[0].rafCount=(_scrollBarX[0].rafCount==undefined?0:(_scrollBarX[0].rafCount+1));
                        }
                        _object[0].rafCount=(_object[0].rafCount==undefined?0:(_object[0].rafCount+1));
                        x=(indexx-_touch.pageX)*20;
                        horizonMove(x+parseInt(_object.css('margin-left').replace('px','')),{moveObject:true,useRaf:true,frame:60});
                    }
                    if(ADDY&&Math.abs(_touch.pageY-originTouchY)>100){
                        y=(_touch.pageY-indexy)*20;
                        //raf计数器
                        if(ADDY){
                            _scrollBarY[0].rafCount=(_scrollBarY[0].rafCount==undefined?0:(_scrollBarY[0].rafCount+1));
                        }
                        _object[0].rafCount=(_object[0].rafCount==undefined?0:(_object[0].rafCount+1));
                        verticalMove(y+parseInt(_object.css('margin-top').replace('px','')),{moveObject:true,useRaf:true,frame:60});
                    }
                });
                //监听高度变化
                $(window).on('resize',function(){
                    optionsCommon['onWindowResize']();
                    let tempY=0;
                    let tempX=0;
                    if(ADDY){
                        tempY=parseInt(_object.css('margin-top').replace('px',''));
                        verticalMove(0);
                    }
                    if(ADDX){
                        tempX=parseInt(_object.css('margin-top').replace('px',''));
                        horizonMove(0);
                    }
                    preProcess();
                    let resetY=false;
                    let resetX=false;
                    if(ADDY){
                        if( Math.abs(_object.outerHeight()-sumHeight)>1 || Math.abs(_this.outerHeight()-height)>1 ){
                            process();
                            resetY=false;
                        }
                        verticalMove(tempY,{moveObject:true});
                    }
                    if(ADDX){
                        if( Math.abs(_object.outerWidth()-sumWidth)>1 || Math.abs(_this.outerWidth()-sumWidth)>1  ){
                            process();
                            resetX=false;
                        }
                        horizonMove(tempX,{moveObject:true});
                    }
                    afterProcess(resetY,resetX);
                });
                //myScroll-top-button点击
                _toTopButton.on('click',function(){
                    verticalMove(0,{useRaf:optionsY['toTopRaf']});
                });
                _toLeftButton.on('click',function(){
                    horizonMove(0,{useRaf:optionsX['toLeftRaf']});
                });
                //myScroll-reset-button 点击
                _resetButton.on('click',function(){
                    reset();
                });
            }
            /**
            *  监听DOM变化
            * */
            function observe(){
                if(observer!=null){
                    observer.disconnect();
                }
                if(customizeObservers!=null){
                    for(var i in customizeObservers){
                        customizeObservers[i].disconnect();
                    }
                }
                MutationObserver = window.MutationObserver || window.WebkitMutationObserver || window.MozMutationObserver;
                observer= new MutationObserver(function(mutations){
                   onDomChange();
                });
                observer.observe(_object[0],{attributes:true,attributeOldValue: true,childList:true, subtree: true});
                //用户自定义observer observeTargets是js对象数组
                for(var i in optionsCommon['observeTargets']){
                    let _observeTarget=optionsCommon['observeTargets'][i];
                    let $_observeTarget=$(_observeTarget);
                    let tempObserver;
                    _observeTarget.originHeight=$(_observeTarget).outerHeight();
                    _observeTarget.originWidth=$(_observeTarget).outerWidth();
                    _observeTarget.observeIndex=i;
                    tempObserver= new MutationObserver(function(mutations){
                        //待解决的问题，MutationObserver的回调函数内部如何获得_observeTarget？mutations[0].target只会返回变动的那个节点，多数时候是子节点
                        if(Math.abs($_observeTarget.outerHeight()-_observeTarget.originHeight)>1||Math.abs($_observeTarget.outerWidth()-_observeTarget.originWidth)){
                            optionsCommon['onTargetsChange'][i](_observeTarget);
                            _observeTarget.originHeight=$_observeTarget.outerHeight();
                            _observeTarget.originWidth=$_observeTarget.outerWidth();
                        }     
                    });
                    tempObserver.observe(_observeTarget,{attributes:true,attributeOldValue: true,childList:true, subtree: true});
                    customizeObservers.push(tempObserver)
                }
                //监听到变化后执行的操作
                function onDomChange(){
                    preProcess();
                    let flagX=false,flagY=false;
                    if(ADDX){
                        if(optionsX['observe']){
                            if( Math.abs(_object.outerWidth()-sumWidth)>1|| Math.abs(_this.width()-width)>1 ||_scrollBarX.width()>_scrollContainerX.width()){
                                flagX=true;
                            }
                        }
                    }  
                    if(ADDY){
                        if(optionsY['observe']){
                            if( Math.abs(_object.outerHeight()-sumHeight)>1|| Math.abs(_this.height()-height)>1 ||_scrollBarY.height()>_scrollContainerY.height()){
                                flagY=true;
                            }
                        }
                    }
                    if(flagX||flagY){
                        optionsCommon['onResize'](flagX,flagY);
                        process();
                        if(flagX) 
                            horizonMove(parseInt(_object.css('margin-left').replace('px','')),{useRaf:false,callback:false,moveObject:true});
                        if(flagY)
                            verticalMove(parseInt(_object.css('margin-top').replace('px','')),{useRaf:false,callback:false,moveObject:true});
                    }
                    afterProcess(false,false);
                }
            }
            

            /**
             * 重新校准的方法
             */
            function reset(resetX,resetY){
                resetX=arguments[0]||arguments[0]==false?arguments[0]:true;
                resetY=arguments[1]||arguments[1]==false?arguments[1]:true;
                preProcess();
                process();
                afterProcess(resetX,resetY);
            }

            /**
             * 用于更新配置的方法
             */
            function resetOptions(inOptions){
                inOptions=arguments[0]?arguments[0]:{x:{},y:{},common:{}};
                if(inOptions['x']){
                    optionsX=$.extend(optionsX,inOptions['x']);
                }
                if(inOptions['y']){
                    optionsY=$.extend(optionsY,inOptions['y']);
                }
                if(inOptions['common']){
                    optionsCommon=$.extend(optionsCommon,inOptions['common']);
                }
            }


            /**
             * 预处理
             * display:none 等特殊情况的解决办法
             */
            function preProcess(){
                //设置样式
                if(_this.css('display')=='none'){
                    _this.css({'display':'block','visibility':'hidden','opacity':'0'});
                    isDisplayNone=true;
                }
                if(!_this.hasClass('myScroll')){
                    if(optionsCommon['animationBar']){
                        _this.addClass('animation-bar');
                    }
                    if(_this.css('position')=='static'){
                        _this.css({position:'relative'});
                    }
                    _this.attr('tabIndex',-1);
                }
                //fixHeight
                if(ADDY){
                    _this.css('height','auto');
                    let tempHeight=_this.outerHeight();
                    if(typeof(optionsY['maxHeight'])=='number'){
                        _this.css("height",optionsY['maxHeight']+'px');
                    }else{
                        _this.css("height",optionsY['maxHeight']);
                    }
                    if(optionsY['fixHeight']&&(_this.outerHeight()>tempHeight)){
                        _this.css("height",tempHeight+'px');
                    }
                }
                if(ADDX){
                    _this.css('width','auto');
                    let tempWidth=_this.outerWidth();
                    if(typeof(optionsX['maxWidth'])=='number'){
                        _this.css("width",optionsX['maxWidth']+'px');
                    }else{
                        _this.css("width",optionsX['maxWidth']);
                    }
                    if(optionsX['fixHeight']&&(_this.outerWidth()>tempWidth)){
                        _this.css("width",tempWidth+'px');
                    }
                }
            }


            /**
             * process
             */
            function process(){
                height=_this.outerHeight();
                width=_this.outerWidth();
                //height=>container的高度 即为scroll-bar-container高度
                if(!_this.hasClass('myScroll')){
                    //把直接子元素塞入scroll-object中
                    addToScrollObject(_this);
                    //scroll-object,scroll-bar-container添加到scroll-container中
                    addToContainer(_this);
                    //添加按钮
                    addButton(_this);
                    _objectContainer=_this.children('div.scroll-container');
                    _object=_objectContainer.children('div.scroll-object');
                    _toTopButton=_this.children("button.myScroll-top-button:not(.myScroll-left-button)");
                    _toLeftButton=_this.children("button.myScroll-left-button");
                    _buttonContainer=_this.children("div.myScroll-button-footer");
                    _buttonContainer.append(_toTopButton).append(_toLeftButton);
                    _resetButton=_this.children("button.myScroll-reset-button");
                }
                sumHeight=_object.outerHeight();
                sumWidth=_object.outerWidth();
                scrollHeight=height*height/sumHeight;
                scrollWidth=width*width/sumWidth;
                scrollWidth=scrollWidth>width?width:scrollWidth;
                scrollHeight=scrollHeight>height?height:scrollHeight;
                if(!_this.hasClass('myScroll')){
                    //添加滚动条
                    addScrollBar(_this);
                    _scrollContainerY=_this.children('div.scroll-bar-container.scroll-bar-container-y');   
                    _scrollBarY=_scrollContainerY.children('div.scroll-bar.scroll-bar-y');
                    _scrollContainerX=_this.children('div.scroll-bar-container.scroll-bar-container-x');
                    _scrollBarX=_scrollContainerX.children('div.scroll-bar.scroll-bar-x');
                }                
                _scrollContainerY.css('height',height+'px');
                _scrollContainerX.css('width',width+'px');
                _scrollBarY.css({'height':scrollHeight+'px','border-radius':optionsY['scrollWidth']+'px'});
                _scrollBarX.css({'width':scrollWidth+'px','border-radius':optionsX['scrollHeight']+'px'});
                if(!_this.hasClass('myScroll')){
                    bindListen();
                }
            }

            
            /**
             * 后处理
             */
            function afterProcess(resetY,resetX){
                resetY=arguments[0]||arguments[0]==false?arguments[0]:true;
                resetX=arguments[1]||arguments[1]==false?arguments[1]:true;
                //是否重置y
                if(resetY===true){
                    verticalMove(0,{useRaf:false,callback:false,moveObject:true});
                }
                if(resetX===true){
                    horizonMove(0,{useRaf:false,callback:false,moveObject:true});
                }
                if(isDisplayNone){
                    _this.css({'display':'unset','visibility':'visible','opacity':'1'});
                }
                //是否隐藏滚动条,在hover时候显示（opacity=1）
                if(!optionsCommon['hideScroll']){
                    _this.addClass('show-scroll' + (optionsX['hideScroll']?'':' show-scroll-x') + (optionsY['hideScroll']?'':' show-scroll-y ') );
                }else{
                    _this.removeClass('show-scroll show-scroll-y');
                }
                //是否在没有hover时隐藏bar
                if(optionsCommon['hideScrollBar']){
                    _this.addClass('hide-bar-not-hover');
                }else{
                    _this.removeClass('hide-bar-not-hover');
                }
                //是否在滚动条长度100%时候隐藏它（display:none）
                if(optionsCommon['hideScrollContainerWhenFull']){
                    if(scrollHeight>=height&&optionsY['hideScrollContainerWhenFull']){
                        _scrollContainerY.hide();
                    }else{
                        _scrollContainerY.show();
                    }
                    if(scrollWidth>=width&&optionsX['hideScrollContainerWhenFull']){
                        _scrollContainerX.hide();
                    }else{
                        _scrollContainerX.show();
                    }
                }else{
                    _scrollContainerY.show();
                    _scrollContainerX.show();
                }
                if(optionsCommon['hideScrollWhenFull']){
                    if(scrollHeight>=height){
                        _scrollBarY.hide();
                    }else{
                        _scrollBarY.show();
                    }
                    if(scrollWidth>=width){
                        _scrollBarX.hide();
                    }
                }else{
                    _scrollBarY.show();
                    _scrollBarX.show();
                }
                //是否监听DOM变化
                if( optionsCommon['observe'] && !_object.hasClass('myScroll')){
                    observe();
                }
                _this.addClass(" myScroll " + (ADDX?' myScrollx ':'') + (ADDY?" myScrolly ":'') );
            }
            
            let _this=$(this);
            let isDisplayNone=false;
            let height,width;
            //DOM对象
            let _objectContainer , _object , 
            _scrollBarX , _scrollBarY , _scrollContainerX , _scrollContainerY ,
            _toTopButton , _resetButton , _buttonContainer ;
            //获取scroll-object的高度
            let sumHeight,sumWidth;
            //scroll-bar高度
            let scrollHeight,scrollWidth;
            //dom监听
            let MutationObserver;
            let observer=null;//监听
            let customizeObservers=Array();//用户自己绑定的监听
            let toTop=false;//是否移动到底部
            let toBottom=false;
            //start
            preProcess();
            process();
            afterProcess();
            //将verticalMove暴露给this
            this.verticalMove=verticalMove;
            this.horizonMove=horizonMove;
            //将reset传给外部
            this.resetScroll=reset;
            this.resetOptions=resetOptions;
        });
        // end $().each(function(){});
    };
})(jQuery);


//raf使得滚动效果更加平滑 frame可以手动设置
function rafMove(y,doms,css,f,func){
    f=arguments[3]?arguments[3]:0;
    func=arguments[4]?arguments[4]:function(){};
    let index=parseInt(doms[0].css(css).replace('px',''));
    let frame=f==0?5:f;
    let addNum=(y-index)/frame;
    let molecule=0;//分子
    let denominator=0;//分母
    let addNums=Array();
    if(doms[0][0].rafCount==undefined){
        doms[0][0].rafCount=0;
    }
    let rafSignal=doms[0][0].rafCount;
    let count=0;
    if(f>15){//在frame>15时，使滑动有ease-out的效果
        denominator=parseInt(frame/2)*2;
        molecule=denominator+parseInt(denominator/2);
        while(molecule>=(denominator/2)){
            if(molecule>denominator){
                addNums.push((molecule/denominator)*(y-index)/frame);
            }else{
                if(denominator==frame&&denominator==molecule){//偶数帧
                    molecule--;
                }
                addNums.push((molecule/denominator)*(y-index)/frame);
            }
            molecule--;
        }
    }
    move();
    function move(){
         if(frame<0||(rafSignal-doms[0][0].rafCount)<0){
            func();
            return false;
        }
        if(f>15){
            addNum=addNums[count];
        }
        for(let i in doms){
            if(doms[i].is('tr')){
                //表格第二行是通过设置transalteX移动的
                doms[i].css('transform',"translateX("+index+"px)");
            }else{
                doms[i].css(css,(index)+'px');
            }
        }
        index+=addNum;
        requestAnimationFrame(move);
        frame--;
        count++;
    }
}


/**
 * 
 * 判断浏览器类型
 */

 /**
 * 是否为IE
 */
var getExplorer = (function () {
    if(getExplorer=='ie'){
        $(tableId).addClass('ie');
    }
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











































