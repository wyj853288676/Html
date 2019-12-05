;(function($){
    $.fn.swiperAxis=function(inOptions){
        let options={
            alignVice:true,
            onResize:function(){

            },
            resize:function(){
                return true;
            },//是否需要监听window.resize
            scrollSpeed:function(){
                return 40;
            },
            moveSpeed:function(){
                if(options['direction']=='horizon'){
                    return _this.find('div.swiper-axis-content').length>0?_this.find('div.swiper-axis-content:eq(0)').width():_this.width();
                }else{
                    return _this.find('div.swiper-axis-content').length>0?_this.find('div.swiper-axis-content:eq(0)').height():_this.height();
                }
            },
            clickFrame:10,
            scrollFrame:10,
            fixWidth:false,
            direction:'horizon',//vertical
            hideBtn:true,//是否需要显示button
            fixLimit:function(){
                return {correctMin:correctMin,correctMax:correctMax,maxX:maxX,minX:minX};
                // correct*表示最大移动的距离，  max min表示动画效果能移动的最大/最小距离
            },
            afterMove:function(){},
        };
        options=$.extend(options,inOptions);
        let _this=$(this).addClass('swiper-axis-container').addClass(options['direction']=='horizon'?'':'vertical-align');
        let _leftBtn=$(document.createElement('button')).addClass('swiper-left-btn swiper-btn').attr('type','button').attr("hidden",options['hideBtn']);
        let _rightBtn=$(document.createElement('button')).addClass('swiper-right-btn swiper-btn').attr('type','button').attr("hidden",options['hideBtn']);
        let _contents=_this.children();
        let _object=$(document.createElement('div')).addClass('swiper-object');
        let maxX,minX;//limit
        let correctMax,correctMin;
        let containerWidth;
        let contentWidth;
        let isX=options['direction']=='horizon';//是横向还是纵向
        _this[0].swiperMove=move;
        _this[0].getX=getX;
        _this[0].resetLimit=function(datas){
            options=$.extend(options,inOptions);
            let fixed=options['fixLimit']();
            correctMin=fixed['correctMin']?fixed['correctMin']:correctMin;
            correctMax=fixed['correctMax']?fixed['correctMax']:correctMax;
            minX=fixed['minX']?fixed['minX']:minX;
            maxX=fixed['maxX']?fixed['maxX']:maxX;
        };
        _this[0].reset=function(inOptions){
            options=$.extend(options,inOptions);
            align();
        };
        _this[0].alignSwiper=align;
        _this[0].swiperTo=function(x,inOptions){
            move(x,inOptions,false);   
        };
        _this[0].swiperLeftBtn=_leftBtn;
        _this[0].swiperRightBtn=_rightBtn;

        initDom();
        align();
        bindListen();
        listenBtn();

        function initDom(){
            _object.append(_contents);
            _this.append(_object);
            //light
            _contents.each(function(index){
                let _content=$(this);
                if(index==0){
                    _firstContent=_content;
                }   
                _content.children("div.swiper-axis-title").after('<i class="swiper-axis-light"></i>');
                if(_content.children('div.swiper-axis-vice-title').length>0){
                }
            });
            if(options['alignVice']){
                _leftBtn.addClass('align-vice');
                _rightBtn.addClass('align-vice');
            }
            _this.append(_leftBtn).append(_rightBtn);
        }

        function align(){
            contentWidth=getContentWidth();
            if(options['fixWidth']){
                if(isX&&getContentWidth()<_this.width()){
                    _this.width(getContentWidth());
                }else if(!isX&&getContentWidth()<_this.height()){
                    _this.height(getContentWidth());
                }
            }
            containerWidth=isX?_this.width():_this.height();
            if(contentWidth<=containerWidth){
                correctMax=correctMin=(containerWidth-contentWidth)/2;
            }else{
                correctMax=0;
                correctMin=-0+(containerWidth-contentWidth)
            }
            maxX=correctMax+250;
            minX=correctMin-250;
            let fixed=options['fixLimit']();
            correctMin=fixed['correctMin']!=undefined?fixed['correctMin']:correctMin;
            correctMax=fixed['correctMax']!=undefined?fixed['correctMax']:correctMax;
            minX=fixed['minX']!=undefined?fixed['minX']:minX;
            maxX=fixed['maxX']!=undefined?fixed['maxX']:maxX;
        }

        function bindListen(){
            let mousedown=false;
            let index;
            let moveCount=0;
            let limit=5;//limit次以内move事件
            let recordIndex;//10次前的index
            // _this.on('mouseout',function(){mousedown=false});
            _this[0].mousedown=false;
            $(window).on('resize',function(e){
                if(!options['resize'](e)){
                    return true;
                }
                move(0);
                options['onResize']();
                align();
            });
            _this.on('mousedown',mouseDownHandler);
            _this.on('mousemove',mouseMoveHandler);
            _this.on("mousewheel DOMMouseScroll",mouseWheelHandler);
            _this.on('mouseup',function(e){
                e.stopPropagation();
                mousedown=false;
                mouseUpHandler(e);
                _this[0].mousedown=false;
            });
            _this.on('touchstart',function(e){
                let newE=processEvent(e);
                mouseDownHandler(newE);
            });
            _this.on('touchmove',function(e){
                if(!mousedown){
                    return true;
                }
                let newE=processEvent(e);
                mouseMoveHandler(newE);
            });
            _this.on('touchend',function(e){
                let newE=processEvent(e);
                mouseUpHandler(newE);
            });
            //部分浏览器mousedown 会触发mousemove
            $(document).on('mousemove',function(e){
                if(!mousedown){
                    return true;
                }
                moveCount++;
                if(moveCount>limit){
                    moveCount=0;
                    recordIndex=(isX?e.pageX:e.pageY);
                }
            });
            $(document).on('mouseup',function(e){
                if(!mousedown){
                    return true;
                }
                mouseUpHandler(e);
                _this[0].mousedown=false;
                mousedown=false;
            });

            //处理mobile 事件
            function processEvent(e){
                if(e.target==e.currentTarget){
                    e.preventDefault();
                }
                let _touch = e.originalEvent.targetTouches[0]?e.originalEvent.targetTouches[0]:e.originalEvent.changedTouches[0];
                e.pageX=_touch.pageX;
                e.pageY=_touch.pageY;
                return e;
            }
            //滚轮
            function mouseWheelHandler(e){
                e.preventDefault();
                e.stopPropagation();
                let delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) ||  // chrome & ie
                (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));              // firefox
                let movey=delta>0?options['scrollSpeed']():-options['scrollSpeed']();
                _object[0].rafCount= _object[0].rafCount!=undefined?( _object[0].rafCount+1):0;
                let distance=movey+getX();
                let func=function(){};
                if(distance>correctMax){
                    func=function(){
                        move(correctMax,{useRaf:true,frame:30});
                    }
                }else if(distance<correctMin){
                    func=function(){
                        move(correctMin,{useRaf:true,frame:30});
                    }
                }
                move(distance,{useRaf:true,func:func,frame:options['scrollFrame']});
            }


            //touch mousedown
            function mouseDownHandler(e){
                e.stopPropagation();
                _this[0].mousedown=mousedown=true;
                recordIndex=index=(isX?e.pageX:e.pageY);
                _object[0].rafCount= _object[0].rafCount!=undefined?( _object[0].rafCount+1):0;
            }


            function mouseMoveHandler(e){
                if(!mousedown||index==undefined){
                    return true;
                }
                e.stopPropagation();
                e.preventDefault();
                moveCount++;
                if(moveCount>limit){
                    moveCount=0;
                    recordIndex=(isX?e.pageX:e.pageY);
                }
                move((isX?e.pageX:e.pageY)-index+getX());
                index=isX?e.pageX:e.pageY;
            }


            function mouseUpHandler(e){
                _this[0].mousedown=mousedown=false;
                let x;
                let distance;
                let func=function(){options['afterMove'](true);};
                let animationMove=Math.abs((isX?e.pageX:e.pageY)-recordIndex)>( isX?Math.min(_this.outerWidth(),100):Math.min(_this.outerHeight(),20) );
                if(animationMove){
                    if(isX){
                        x=(e.pageX-recordIndex)>0?200:-200;
                    }else{
                        x=(e.pageY-recordIndex)>0?200:-200;
                    }
                    distance=x+getX();
                }else{
                    x=getX();
                    distance=x;
                }
                if(distance>correctMax){
                    func=function(){
                        move(correctMax,{useRaf:true,frame:30});
                    }
                }else if(distance<correctMin){
                    func=function(){
                        move(correctMin,{useRaf:true,frame:30});
                    }
                }
                if(animationMove){
                    move(distance,{useRaf:true,func:func});
                }else{
                    func();
                }
                //fix bug 点击select option 时 e.pageX=0;
                recordIndex=0;
            }


        }


        function listenBtn(){
            let distance;
            let correctDistance;
            let isMoving=false;
            _rightBtn.on('click',function(e){
                e.stopPropagation();
                distance=getX()-options['moveSpeed']();
                // _object[0].rafCount=_object[0].rafCount==undefined?0:_object[0].rafCount++;
                btnClickHandler();
            });
            _leftBtn.on('click',function(e){
                e.stopPropagation();
                distance=getX()+options['moveSpeed']();
                // _object[0].rafCount=_object[0].rafCount==undefined?0:_object[0].rafCount++;
                btnClickHandler(e);
            });

            let btnClickHandler=function(){
                if(isMoving){
                    return true;
                }
                isMoving=true;
                let func=function(){isMoving=false;};
                if(distance>correctMax||distance<correctMin){
                    correctDistance=distance>40?correctMax:correctMin;
                    func=function(){
                        move(correctDistance,{
                            useRaf:true,
                            frame:30,
                            func:function(){isMoving=false}
                        });
                    }
                }
                move(distance,{useRaf:true,func:func,frame:options['clickFrame']});
            }
        }

        function move(x,funOptions,isTrusted){
            funOptions=arguments[1]?arguments[1]:{};
            isTrusted=arguments[2]||arguments[2]===false?arguments[2]:true;
            let moveOptions={
                useRaf:false,
                frame:30,
                func:function(){},
                callback:true,
            };
            moveOptions=$.extend(moveOptions,funOptions);
            if(x>maxX){
                x=maxX;
            }else if(x<minX){
                x=minX;
            }
            if(!moveOptions['useRaf']){
                _object.css(isX?'margin-left':'margin-top',x);
                moveOptions['func']();
                options['afterMove'](isTrusted);
            }else{
                rafMove(x,[_object],isX?'margin-left':'margin-top',moveOptions['frame'],{func:moveOptions['func'],isTrusted:isTrusted});
            }
        }
        function getX(){
            return  parseFloat(_object.css(isX?'margin-left':'margin-top').replace('px',''))
        }

        function getContentWidth(){
            return isX?_object.outerWidth():_object.outerHeight();
        }


        //raf使得滚动效果更加平滑 frame可以手动设置
        function rafMove(y,doms,css,f,inOptions){
            let rafOptions={
                func:function(){},
                isTrusted:true,
            }
            inOptions=arguments[4]?arguments[4]:0;
            rafOptions=$.extend(rafOptions,inOptions);
            let func=rafOptions['func'];
            let index=parseFloat(doms[0].css(css).replace('px',''));
            let originIndex=index;
            let frame=f==0?5:f;
            let addNum=(y-index)/frame;
            if(doms[0][0].rafCount==undefined){
                doms[0][0].rafCount=0;
            }
            let rafSignal=doms[0][0].rafCount;
            let count=0;
            move();
            function move(){
                if(f>15){
                    addNum=Math.pow(count-f,2)*(originIndex-y)/Math.pow(f,2)+(y-index);
                }
                for(let i in doms){
                    doms[i].css(css,(index)+'px');
                }
                options['afterMove'](rafOptions['isTrusted']);
                //最小1px
                addNum=Math.abs(addNum)<1&&addNum!=0?Math.abs(addNum)/addNum:addNum;
                index+=addNum;
                frame--;
                count++;
                if(frame<0||(rafSignal-doms[0][0].rafCount)<0||Math.abs(index-originIndex)>Math.abs(y-originIndex)){
                    for(let i in doms){
                        doms[i].css(css,(y)+'px');
                    }
                    func();
                    return false;
                }
                requestAnimationFrame(move);
            }
        }

        /**
         * 判断是否为移动设备
         */
        let isPC = function ()
        {
            var userAgentInfo = navigator.userAgent.toLowerCase();
            var Agents = new Array("android", "iphone", "symbianOS", "windows phone", "ipad", "ipod");
            var flag = true;
            for (var v = 0; v < Agents.length; v++) {
                if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
            }
            return flag;
        }


    };
})(jQuery);




