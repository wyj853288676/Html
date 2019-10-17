;(function($){
    $.fn.swiperAxis=function(inOptions){
        let options={

        };
        let _this=$(this).addClass('swiper-axis-container');
        let hasViceTitle=false;
        let _leftBtn=$(document.createElement('button')).addClass('swiper-left-btn swiper-btn');
        let _rightBtn=$(document.createElement('button')).addClass('swiper-right-btn swiper-btn');
        let _contents=_this.children('div.swiper-axis-content')
        let _firstContent;
        let maxX,minX;//limit
        let containerWidth;
        let contentWidth;
        initDom();
        align();
        bindListen();

        _this[0].swiperMove=move;
        _this[0].getX=getX;
        function initDom(){
            //light
            _contents.each(function(index){
                let _content=$(this);
                if(index==0){
                    _firstContent=_content;
                }   
                _content.children("div.swiper-axis-title").after('<i class="swiper-axis-light"></i>');
                if(_content.children('div.swiper-axis-vice-title').length>0){
                    hasViceTitle=true;
                }
            });
            if(hasViceTitle){
                _leftBtn.addClass('align-vice');
                _rightBtn.addClass('align-vice');
            }
            _this.append(_leftBtn).append(_rightBtn);
        }

        function align(){
            contentWidth=getContentWidth();
            containerWidth=_this.width();
            if(contentWidth<=containerWidth){
                maxX=(containerWidth-contentWidth)/2+250;
                minX=(containerWidth-contentWidth)/2+250;
                move((containerWidth-contentWidth)/2);
            }else{
                maxX=250;
                minX=-250-40+(containerWidth-contentWidth);
                move(-40+(containerWidth-contentWidth));
            }

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
                if(Math.abs(e.pageX-recordIndex)>200){
                    x=(e.pageX-recordIndex)>0?800:-800;
                    distance=x+getX();
                }else{
                    x=getX();
                    distance=x;
                }
                if(distance>40){
                    func=function(){
                        move(40,{useRaf:true,frame:30});
                    }
                }else if(distance<(-40+containerWidth-contentWidth)){
                    func=function(){
                        move(-40+containerWidth-contentWidth,{useRaf:true,frame:30});
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
                recordIndex=index=e.pageX;
                _firstContent[0].rafCount= _firstContent[0].rafCount!=undefined?( _firstContent[0].rafCount+1):0;
            });
            _this.on('mousemove',function(e){
                e.preventDefault();
                if(!mousedown||index==undefined){
                    return true;
                }
                moveCount++;
                if(moveCount>limit){
                    moveCount=0;
                    recordIndex=e.pageX;
                }
                move(e.pageX-index+getX());
                index=e.pageX;
            });
        }

        function move(x,funOptions){
            funOptions=arguments[1]?arguments[1]:{};
            let moveOptions={
                useRaf:false,
                frame:30,
                func:function(){}
            };
            moveOptions=$.extend(moveOptions,funOptions);
            let distance;
            if(x>maxX){
                distance=maxX;
                x=maxX;
            }else if(x<minX){
                distance=minX;
                x=minX;
            }
            if(!moveOptions['useRaf']){
                _firstContent.css('margin-left',x);
                moveOptions['func']();
            }else{
                rafMove(x,[_firstContent],'margin-left',moveOptions['frame'],moveOptions['func']);
            }
        }
        function getX(){
            return  parseFloat(_firstContent.css('margin-left').replace('px',''))
        }

        function getContentWidth(){
            let contentWidth=0;
            _contents.each(function(index){
                contentWidth+=$(this).outerWidth();
            });
            return contentWidth;
        }

    };
})(jQuery);




//raf使得滚动效果更加平滑 frame可以手动设置
function rafMove(y,doms,css,f,func){
    f=arguments[3]?arguments[3]:0;
    func=arguments[4]?arguments[4]:function(){};
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
         if(frame<0||(rafSignal-doms[0][0].rafCount)<0){
            func();
            return false;
        }
        if(f>15){
            addNum=Math.pow(count-f,2)*(originIndex-y)/Math.pow(f,2)+(y-index);
        }
        for(let i in doms){
            doms[i].css(css,(index)+'px');
        }
        index+=addNum;
        requestAnimationFrame(move);
        frame--;
        count++;
    }
}
