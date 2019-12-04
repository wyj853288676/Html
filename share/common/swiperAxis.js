;(function($){
    $.fn.swiperAxis=function(inOptions){
        let options={
            alignVice:true,
            moveSpeed:function(){
                if(options['direction']=='horizon'){
                    return _this.find('div.swiper-axis-content').length>0?_this.find('div.swiper-axis-content:eq(0)').width():_this.width();
                }else{
                    return _this.find('div.swiper-axis-content').length>0?_this.find('div.swiper-axis-content:eq(0)').height():_this.height();
                }
            },
            fixWidth:false,
            direction:'horizon',
        };
        options=$.extend(options,inOptions);
        let _this=$(this).addClass('swiper-axis-container').addClass(options['direction']=='horizon'?'':'vertical-align');
        let _leftBtn=$(document.createElement('button')).addClass('swiper-left-btn swiper-btn').attr('type','button');
        let _rightBtn=$(document.createElement('button')).addClass('swiper-right-btn swiper-btn').attr('type','button');
        let _contents=_this.children();
        let _object=$(document.createElement('div')).addClass('swiper-object');
        let maxX,minX;//limit
        let correctMax,correctMin;
        let containerWidth;
        let contentWidth;
        let isX=options['direction']=='horizon';//是横向还是纵向
        initDom();
        align();
        bindListen();
        listenBtn();
        _this[0].swiperMove=move;
        _this[0].getX=getX;


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
                correctMax=40;
                correctMin=-40+(containerWidth-contentWidth)
            }
            maxX=correctMax+250;
            minX=correctMin-250;
            move(correctMin);
        }

        function bindListen(){
            let mousedown=false;
            let index;
            let moveCount=0;
            let limit=10;//10次以内move事件
            let recordIndex;//10次前的index
            // _this.on('mouseout',function(){mousedown=false});
            function mouseUpHandler(e){
                let x;
                let distance;
                let func=function(){};
                if(Math.abs(isX?e.pageX:e.pageY-recordIndex)>150){
                    x=(isX?e.pageX:e.pageY-recordIndex)>0?800:-800;
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
                if(Math.abs(e.pageX-recordIndex)>100){
                    move(distance,{useRaf:true,func:func});
                }else{
                    func();
                }
            }
            $(document).on('mouseup',function(e){
                if(!mousedown){
                    return true;
                }
                mouseUpHandler(e);
                mousedown=false;
            });
            _this.on('mouseup',function(e){
                e.stopPropagation();
                mousedown=false;
                mouseUpHandler(e);
            })
            _this.on('mousedown',function(e){
                mousedown=true;
                recordIndex=index=(isX?e.pageX:e.pageY);
                _object[0].rafCount= _object[0].rafCount!=undefined?( _object[0].rafCount+1):0;
            });
            $(document).on('mousemove',function(e){
                moveCount++;
                if(moveCount>limit){
                    moveCount=0;
                    recordIndex=(isX?e.pageX:e.pageY);
                }
            })
            _this.on('mousemove',function(e){
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
            });

            $(window).on('resize',function(){
                align();
            })
        }


        function listenBtn(){
            let distance;
            let correctDistance;
            let isMoving=false;
            _rightBtn.on('click',function(){
                distance=getX()-options['moveSpeed']();
                // _object[0].rafCount=_object[0].rafCount==undefined?0:_object[0].rafCount++;
                btnClickHandler();
            })
            _leftBtn.on('click',function(){
                distance=getX()+options['moveSpeed']();
                // _object[0].rafCount=_object[0].rafCount==undefined?0:_object[0].rafCount++;
                btnClickHandler();
            })

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
                move(distance,{useRaf:true,func:func});
            }
        }

        function move(x,funOptions){
            funOptions=arguments[1]?arguments[1]:{};
            let moveOptions={
                useRaf:false,
                frame:30,
                func:function(){}
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
            }else{
                rafMove(x,[_object],isX?'margin-left':'margin-top',moveOptions['frame'],{func:moveOptions['func']});
            }
        }
        function getX(){
            return  parseFloat(_object.css(isX?'margin-left':'margin-top').replace('px',''))
        }

        function getContentWidth(){
            return isX?_object.outerWidth():_object.outerHeight();
        }

    };
})(jQuery);




//raf使得滚动效果更加平滑 frame可以手动设置
function rafMove(y,doms,css,f,inOptions){
    let options={
        func:function(){},
    }
    inOptions=arguments[4]?arguments[4]:0;
    options=$.extend(options,inOptions);
    let func=options['func'];
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
            console.log();
            doms[i].css(css,(index)+'px');
        }
        //最小1px
        addNum=Math.abs(addNum)<1&&addNum!=0?Math.abs(addNum)/addNum:addNum;
        index+=addNum;
        frame--;
        count++;
        if(frame<0||(rafSignal-doms[0][0].rafCount)<0||Math.abs(index-originIndex)>=Math.abs(y-originIndex)){
            func();
            return false;
        }
        requestAnimationFrame(move);
  
    }
}
