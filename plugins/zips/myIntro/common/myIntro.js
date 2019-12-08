/**
 * author:wyj 853288676@qq.com
 * @param {*} inOptions 
 */
function myIntro(inOptions){
    let options={
        /**
         * {dom:,tip:,align:,sizePlus:} 
         * dom是对应的jQuery对象，tip是该dom的说明，align是限制tip在left,right,bottom,top，sizePlus:panel比dom大多少px
         *  */ 
        doms:[],
        start:0,//开始步骤
        body:$('body'),
        before:function(start,oldStart){},
        observe:false,
        sizePlus:10,
        onClose:function(){},
    };
    options=$.extend(options,inOptions);
    let start=options['start'];
    let oldStart=-1;
    let _panel;
    let _tip;
    let _pagination;
    let _body=options['body'];
    let _window=$(window);
    let _bg=$(document.createElement('div')).addClass('my-intro-bg');
    let intro={};
    let observer; //mutation observer

    intro.resetOptions=function(inOptions){
        options=$.extend(options,inOptions);
    }
    intro.show=function(inOptions){
        options=$.extend(options,inOptions);
        initIntroParams();
        show();
    };
    intro.jumpTo=function(step){
        start=step;
        align();
    }
    intro.align=align;
    intro.hide=hide;
    
    return intro;

    function initIntroParams(){
        start=options['start'];
        oldStart=-1;
        _body=options['body'];
    }

    function show(inOptions){

        let _targetDoms=options['doms'];
        //tip
        _tip=$(document.createElement('div')).addClass('my-intro-tip')
        .append("<div class='my-intro-tip-body'></div><div class='my-intro-tip-footer'><button class='btn-intro-prev btn-intro'><i class='ic ic-left'></i> last</button><button class='btn-intro-next btn-intro' ><i class='ic ic-right'></i> next</button><button class='btn-intro btn-intro-skip align-right'>close</button></div>").attr('hidden',true);
        //panel
        _panel=$(document.createElement('div')).addClass('my-intro-panel');
        //pagination
        _pagination=$(document.createElement('div')).addClass('my-intro-pagination');
        for(var count=0;count<_targetDoms.length;count++){
            _pagination.append("<i class='my-intro-page'></i>");
        }
        //bg
        _bg.html(_panel).append(_tip.append(_pagination));
        if(_bg.parent()[0]==undefined){
            _body.append(_bg.show());
        }
        align();
        bindListen();
        //隐藏多余的panel
    }

    function align(alignOptions){
        let defaultOptions={before:true,after:true,options:false};
        alignOptions=arguments[0]?arguments[0]:{};
        alignOptions=$.extend(defaultOptions,alignOptions);
        options=$.extend(options,alignOptions['options']);
        if(alignOptions['before']){
            if(options['before'](start,oldStart)==false){
                return true;
            }
        };
        //before process
        if(oldStart!=start){
            $('.my-intro-target-active').removeClass('my-intro-target-active');
            observe();
        }
        let _target=options['doms'][start];
        let _targetTip=_target['tip']?options['doms'][start]['tip']:'';
        let _targetDom=_target['dom'].addClass('my-intro-target my-intro-target-active');
        //bg
        _bg.width(_body.innerWidth()).height(_body.innerHeight());
        //tips
        _tip.removeClass('tip-align-top tip-align-left tip-align-bottom tip-align-right').attr('hidden',false);
        _tip.children('.my-intro-tip-body').html("<span class='intro-tip-span'>"+_targetTip+"</span>");
        _tip.find('button.btn-intro-prev').attr('disabled',start==0);
        _tip.find('button.btn-intro-next').attr('disabled',start==(options['doms'].length-1));
        //panel
        _panel.attr('data-intro-step',start+1).removeClass('number-align-top-right number-align-right number-align-left');
        //滚动target到视窗范围内
        scrollIntoView();
        //panel css
        let sizePlus=_target['sizePlus']==undefined?options['sizePlus']:_target['sizePlus'];
        let panelCss={
            top:_targetDom.offset()['top']-sizePlus/2,
            left:_targetDom.offset()['left']-sizePlus/2,
            width:_targetDom.outerWidth()+sizePlus,
            height:_targetDom.outerHeight()+sizePlus,
            boxShadow:' 0 0px 15px rgba(0,0,0,.4) ,'+"0px 0px 0px 99999px"+" rgba(0,0,0,0.2)",
            position:(function(){
                if(typeof options['doms'][start]['position'] == 'function'){
                    return (options['doms'][start]['position'])();
                }else{
                    return  options['doms'][start]['position']!=undefined?options['doms'][start]['position']:'absolute';
                }
            })(),
        };
        if(panelCss['width']>_body.innerWidth()&&_target['sizePlus']==undefined){
            panelCss['width']=_targetDom.outerWidth();
            panelCss['left']=_targetDom.offset()['left'];
        }
        if(panelCss['position']=='fixed'){
            panelCss['left']-=_window.scrollLeft();
            panelCss['top']-=_window.scrollTop();
        }
        _panel.css(panelCss);
        //tip css
        let tipCss={
            position:options['doms'][start]['position']!=undefined?options['doms'][start]['position']:'absolute',
        };
        let offset={
            'left':panelCss['left'],
            'right':(panelCss['position']=='fixed'?_window.outerWidth():_body.outerWidth())-panelCss['left']-panelCss['width'],
            'top':panelCss['top'],
            'bottom':(panelCss['position']=='fixed'?_window.outerHeight():_body.outerHeight())-panelCss['top']-panelCss['height']
        };
        //判断是否指定了tip的位置
        if(_target['align']&&$.inArray(_target['align'],['left','right','top','bottom'])>=0){
            let functions={'left':alignLeft,'right':alignRight,'top':alignTop,'bottom':alignBottom};
            functions[_target['align']]();
        }else{
            //没有指定则通过计算来判断
            switch( Math.max(offset['left'],offset['top'],offset['right'],offset['bottom']) ){
                case offset['left']:
                    alignLeft();
                    break;
                case offset['top']:
                    alignTop();
                    break;
                case offset['right']:
                    alignRight();
                    break;
                case offset['bottom']:
                    alignBottom();
                    break;
            }
        }
        // end switch
        _tip.css(tipCss);
        //pagination css
        _pagination.children('i.my-intro-page').removeClass('active');
        _pagination.children('i.my-intro-page:eq('+start+')').addClass('active');
        oldStart=start;

        //在targetDom或_panel不在视窗范围内的时候滚动到那里
        function scrollIntoView(){
            //vertical scroll
            if(_targetDom.offset()['top']>(_window.scrollTop()+_window.innerHeight()-_targetDom.outerHeight())||(_targetDom.offset()['top']+_targetDom.outerHeight())<_window.scrollTop()){
                // _window.animate({scrollTop:_targetDom.offset()['top']-100});
                scrollAnimation(_targetDom.offset()['top']-100,window);
            }
            //horizon scroll
            if(_targetDom.offset()['left']>(_window.scrollLeft()+_window.innerWidth()-_targetDom.outerWidth())||(_targetDom.offset()['left']+_targetDom.outerWidth())<_window.scrollLeft()){
                // _window.animate({scrollLeft:_targetDom.offset()['left']-100});
                scrollAnimation(_targetDom.offset()['left']-100,window,'left');
            }
        }
        //放置tips
        function alignLeft(){
            tipCss['width']=Math.min(panelCss['left']-20,300);
            tipCss['left']=panelCss['left']-tipCss['width']-20;
            tipCss['top']=panelCss['top']+(panelCss['height']-_tip.outerHeight())/2;
            _tip.addClass('tip-align-left');
        }
        function alignRight(){
            tipCss['width']=Math.min(_body.outerWidth()-panelCss['left']-panelCss['width']-20,300);
            tipCss['left']=panelCss['left']+panelCss['width']+20;
            tipCss['top']=panelCss['top']+(panelCss['height']-_tip.outerHeight())/2;
            //移動number-step的位置到右邊
            _panel.addClass('number-align-top-right');
            _tip.addClass('tip-align-right');
        }
        function alignTop(){
            tipCss['width']=Math.min(_body.outerWidth(),300);
            tipCss['left']=panelCss['left']-tipCss['width']/2+panelCss['width']/2;
            tipCss['top']=panelCss['top']-_tip.outerHeight()-20;
            _tip.addClass('tip-align-top');
        }
        function alignBottom(){
            tipCss['width']=Math.min(_body.outerWidth(),300);
            tipCss['left']=panelCss['left']+(panelCss['width']-tipCss['width'])/2;
            tipCss['top']=panelCss['top']+panelCss['height']+20;
            _tip.addClass('tip-align-bottom');
        }
    }
    // end function align

    function bindListen(){
        $(window).on('resize',function(){
            if(_bg.is(':visible')){
                align();
            }
        });
        _bg.delegate('.btn-intro-prev','click',function(e){
            start--;
            align();
        });
        _bg.delegate('.btn-intro-next','click',function(e){
            start++;
            align();
        });
        _bg.delegate('.btn-intro-skip','click',function(e){
            hide();
        });
        _bg.delegate('i.my-intro-page','click',function(e){
            start=$(this).index();
            align();
        })
    }

    //添加mutation observe
    function observe(){
        if(observer!=undefined){
            observer.disconnect();
        }
        if(!options['observe']&&options['doms'][start]['observe']!=true){
            return true;
        }
        MutationObserver = window.MutationObserver || window.WebkitMutationObserver || window.MozMutationObserver;
        observer= new MutationObserver(function(mutations){
            if(oldStart!=start){
                observer.disconnect();
            }else{
                align({before:false,after:false});    
            }
        });     
        observer.observe(options['doms'][start]['dom'][0],{
            attributes:true,attributeOldValue: true,childList:true, 
            subtree: true,characterData:true,characterDataOldValue:true
        });
    }
    /**
     * distance移动的距离;
     * dom：滚动条对应的元素
     */
    function scrollAnimation(distance,dom,direction,frame){
        let _dom=$(dom);
        direction=arguments[2]?arguments[2]:'top';
        frame=arguments[3]?arguments[3]:20;
        let height=direction=='top'?_dom.scrollTop():_dom.scrollLeft();
        let count=0;
        let limit=frame;
        let num=(height-distance)/limit;
        function move(){
            if(count>limit ){
                switch(direction){
                    case "left":
                        _dom.scrollLeft(distance);
                        break;
                    default:
                        _dom.scrollTop(distance);
                }
                return false;
            }
            switch(direction){
                case "left":
                    _dom.scrollLeft(height);
                    break;
                default:
                    _dom.scrollTop(height);
            }
            height-=num;
            count++;
            requestAnimationFrame(move);
        }
        move(height);
    }

    
    function hide(){
        if(observer!=undefined){
            observer.disconnect();
        }
        $('.my-intro-target-active').removeClass('my-intro-target-active');
        _bg.fadeOut(500,function(){
            _bg.remove();
            (options['onClose'])();
        })
    }
}


