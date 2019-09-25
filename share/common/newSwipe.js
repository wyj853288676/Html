;(function ($){
    $.fn.addSwipe=function(inOptions){
        let options={
            linkContainer:null,
            container:null,
            width:"100%",
            onSwipe:function(){return true},
            afterSwipe:function(){return true},
            navBtn:false,
        }
        options=$.extend(options,inOptions);
        let _linkContainer=options['linkContainer'];
        let _container=options['container'].addClass(isPc?'is-pc':'is-mobile');
        let _object=$(document.createElement('div')).addClass('swipe-object');
        //多少个swipe-child
        let count=_container.children('.swipe-child').length;
        //起点
        let index=0;
        _object.append(_container.children());
        _container.append(_object);

        //设定宽度
        _container.css({width:options['width']});
        let innerWidth=_container.innerWidth();
        _object.outerWidth(innerWidth*count);
        _object.children().outerWidth(innerWidth);
        let _lastBtn;
        let _nextBtn;
        //添加按钮 
        if(options['navBtn']){
            _lastBtn=$(document.createElement('button')).addClass('swipe-last-btn swipe-nav-btn');
            _nextBtn=$(document.createElement('button')).addClass('swipe-next-btn swipe-nav-btn');
            _object.append(_lastBtn).append(_nextBtn);
            _lastBtn=_object.children('button.swipe-last-btn.swipe-nav-btn');
            _nextBtn=_object.children('button.swipe-next-btn.swipe-nav-btn');
        }
        
        //绑定监听
        bindListen();

        //添加方法
        _container[0].swipeTo=swipeTo;

        //移动算法
        function swipeTo(number){
            number=number<0?0:number;
            number=number%count;
            if(options['onSwipe'](index,number)===false){
                return true;
            }
            _linkContainer.children('.swipe-link:eq('+index+')').removeClass('active');
            _linkContainer.children('.swipe-link:eq('+number+')').addClass('active');
            _targetChild=_object.children('div.swipe-child:eq('+number+')');
            _container.scrollLeft(_targetChild.offset()['left']-_object.offset()['left']);
            index=number;
        }

        //绑定监听
        function bindListen(){
            if(options['navBtn']){
                _lastBtn.on('click',function(){swipeTo(index-1)});
                _nextBtn.on('click',function(){swipeTo(index+1)});
            }
            _linkContainer.delegate('.swipe-link','click',function(){
                swipeTo($(this).index());
            })
            let autoMove=function(){
                let number=getNumber();
                let x=_container.scrollLeft()-number*innerWidth;
                if(x==0&&number==index){
                    return true;
                }
                if(x*3>innerWidth){
                    swipeTo(number+1);
                }else{
                    swipeTo(number);
                }
            }
            let getNumber=function(){
                return parseInt(_container.scrollLeft()/innerWidth);
            }
            let scrollTimeFunc;
            let touchend=true;
            //手机下的滚动监听
            if(!isPc){
                _container.on('touchstart',function(){
                    _container.css('overflow-x','scroll');
                    touchend=false;
                });
                _container.on('touchend',function(e){
                    _container.css('overflow-x','hidden');
                    autoMove();
                    touchend=true
                });
                _container.on('scroll',function(e){
                    if(scrollTimeFunc!=undefined){
                        clearTimeout(scrollTimeFunc);
                    }
                    scrollTimeFunc=setTimeout(function(){
                        if(!touchend||getNumber()==index){
                            return true;
                        }
                        autoMove();
                    },20);
                });
            }
        }
    }
})(jQuery);



/**
 * 判断是否为移动设备
 */
var isPc = ( function ()
{
    var userAgentInfo = navigator.userAgent.toLowerCase();
    var Agents = new Array("android", "iphone", "symbianOS", "windows phone", "ipad", "ipod");
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
    }
    return flag;
})();
