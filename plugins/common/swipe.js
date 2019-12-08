;(function($){
    $.fn.addSwipe=function(inOptions){
        var options={
            linkPosition:'before', //link在swipe-child-container前还是后,
            useDefaultLink:true,//是否使用默认的link , 允许用户自己绑定link,但是要添加 swipe-link的类,
            linkContainer:null,//自定义link时传入的link-container
            onChange:null, //回调函数 移动前调用的，若返回false则不能移动（用于流程控制）
            afterChange:null,//回调函数 移动后调用的函数
            hideLink:false, //隐藏linkContainer
            listenTouch:false,//是否监听touch
            limitTouchEventTarget:false,//显示e.target=e.currentTarget
        };
        options=$.extend(options,inOptions);
        $(this).each(function(){
            let _this=$(this); //
            let count=_this.children(".swipe-child").length;
            let _activeTab;//目前显示的tab;
            let index;
            //link-container
            let _linkContainer;
            let _touchStart;
            let _touchIndex;
            let _touchEnd;
            let limitSwipe=30;
            process();
            //bindListen
            bindListen();
            //暴露成员函数
            _this[0].swipeTo=swipeTo;

            function process(){
                //index
                if(_this.children(".swipe-child.swipe-active").index()==-1){
                    index=0;
                    _activeTab=_this.children(".swipe-child:eq(0)");
                    _activeTab.addClass('swipe-active');
                }else{
                    index=_this.children(".swipe-child.swipe-active").index();
                    _activeTab=_this.children(".swipe-child.swipe-active");
                }
                if(options['useDefaultLink']){
                    _linkContainer=$(document.createElement("div"));
                    _linkContainer.addClass('swipe-link-container strict-flex-container');
                    for(var i=0;i<count;i++){
                        _linkContainer.append(" <a href='#' class='guide-link "+(i==index?"swipe-active":'')+" swipe-link swipe-form-control'></a>");
                    }
                    //link
                    if(options['linkPosition']=='before'){
                        _this.before(_linkContainer);
                    }else{
                        _this.after(_linkContainer);
                    }
                }else{
                    _linkContainer=options['linkContainer'];

                }
                if(options['hideLink']){
                    _linkContainer.hide();
                }
            }
            function bindListen(){
                //监听 link的点击事件
                _linkContainer.delegate("a.swipe-link",'click',function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    //onChange 回调函数
                    var _thisLink=$(this);
                    var newIndex=_thisLink.index();
                    swipeTo(newIndex);
                   
                });
                if(options['listenTouch']){
                    _this.delegate('div.swipe-child','touchstart',function(e) {
                        if(e.target!=e.currentTarget&&options['limitTouchEventTarget']){
                            return true;
                        }
                        let _touch = e.originalEvent.targetTouches[0];
                        _touchStart= _touch.pageX;
                    });
                    _this.delegate('div.swipe-child','touchmove',function(e) {
                        if(e.target!=e.currentTarget&&options['limitTouchEventTarget']){
                            return true;
                        }
                        let _touch = e.originalEvent.targetTouches[0];
                        _touchIndex=_touch.pageX;
                        if((_touchIndex-_touchStart)>limitSwipe){
                            swipeTo(index-1);
                        }else if((_touchStart-_touchIndex)>limitSwipe){
                            swipeTo(index+1);
                        }
                    });
                    _this.delegate('div.swipe-child','touchend',function(e) {
                        if(e.target!=e.currentTarget&&options['limitTouchEventTarget']){
                            return true;
                        }
                        let _touch = e.originalEvent.changedTouches[0];
                        _touchEnd=_touch.pageX;
                    }); 
                }
            }
            /**
             * 控制显示哪一个的函数，传递的参数是index
             */
            function swipeTo(newIndex){
                if(newIndex=='next'){
                    newIndex=index+1;
                }else if(newIndex=='last'){
                    newIndex=index-1;
                }
                if(newIndex<0||newIndex>(_this.children('.swipe-child').length-1)){
                    return true;
                }
                var _newTab=_this.children(".swipe-child:eq("+newIndex+")");
                if(index==newIndex||_newTab.length==0){
                    return false;
                }
                if(options['onChange']!=null){
                    var onChangeResult=options['onChange'](index,newIndex);
                    if(onChangeResult!=undefined&&!onChangeResult){
                        return false;
                    };
                }
                //link
                _linkContainer.children(".swipe-active").removeClass('swipe-active');
                _linkContainer.children(".swipe-link:eq("+newIndex+")").addClass('swipe-active');
                //tab
                if(newIndex>index){
                    _newTab.addClass('add-left transforming ');
                    _activeTab.addClass("remove-left transforming-relative"); //transform:position absolute会导致高度丢失。
                }else{
                    _newTab.addClass('add-right transforming');
                    _activeTab.addClass("remove-right transforming-relative");
                }
                setTimeout(function(){
                    _activeTab.removeClass('swipe-active transforming-relative remove-right remove-left ');
                    _newTab.removeClass('add-right add-left transforming');
                    _newTab.addClass("swipe-active");
                    //at last
                    _activeTab=_newTab;
                    oldIndex=index;
                    index=newIndex;
                    //afterChange 回调函数
                    if(options['afterChange']!=null){
                        if(options['afterChange'](oldIndex,newIndex)){
                            return false;
                        };
                    }
                },300);
            };
          
            
        });
        // end each
    }

})(jQuery);