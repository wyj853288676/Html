;(function($){
    $.fn.myComplete=function(inOptions){
        let options={
            ajaxData:function(){
                return {name:_this.val()};
            },
            url:'',
            // ajax confs
            success:function(data){
            },
            error:function(){jAlert('Error')},
            onSearch:function(){},
            stopSearch:function(){},
            // ajax confs end
            onclick:function(_target){},
            returnDataType:'json',//controller f返回的data 类型
            delay:200,
            height:200,
            body:$('body'),
            innerHtml:'',
            minLength:1,//最少输入多少字符
        }
        if($(this).length>1){
            console.log('不支持多个input！！！');
            return;
        }

        $.extend(options,inOptions);
        let _this=$(this).attr('autocomplete','off');//input
        let hoverIndex=-1;
        let compositionFlag=false;//是否正在用输入法
        let timeFunc;
        let _ul=$(document.createElement('ul')).addClass('autocomplete-ul').css({'z-index':9999,'position':'absolute'});
        let count=0;//input count
        let needInnerHtml=(typeof options['innerHtml']=='object'&&options['innerHtml'].length>0) || (typeof options['innerHtml']=='string'&&options['innerHtml']!='');//需要显示innerHtml
        bindListen();

        return _ul;
        /**
         * 渲染ul
         */
        function renderUl(data){
            _ul.html('').removeClass('loading');
            if(options['returnDataType']=='html'){
                _ul.html(data);
            }else{
                for(var i in data){
                    let _li=$(document.createElement('li')).addClass('autocomplete-li');
                    if(typeof(data[i])=='string'){
                        _li.html(data[i]);
                    }else{
                        for(var j in data[i]){
                            if(j=='value'){
                                _li.html(data[i][j]);
                            }else{
                                _li.attr('data-'+j,data[i][j]);
                            }
                        }
                    }
                    _ul.append(_li);
                }
                _ul.animate({maxHeight:options['height']},300,'linear');
            }
        }

        /**
         * 添加监听
         */
        function bindListen(){
            _this.on('compositionstart',function(){compositionFlag=true});
            _this.on('compositionend',function(){compositionFlag=false;completeHandler();});
            if(needInnerHtml){
                _this.on('focus',function(){
                    showUl();
                });
            }
            _this.on('input',completeHandler);
            _this.on('blur',function(){
                options['stopSearch']();
                setTimeout(function(){
                    _ul.detach();
                },200)
            });
            _this.on('keydown',function(e){
                //方向键 ↓ 40 ↑ 38 回车 13
                if(jQuery.inArray(e.keyCode,[40,38,13])<0){
                    return true;
                }
                e.preventDefault();
                e.stopPropagation();
                if(e.keyCode==40){
                    hoverIndex++;
                }else if(e.keyCode==38){
                    hoverIndex--;
                }
                hoverIndex=Math.min(_ul.children('li').length-1,Math.max(0,hoverIndex));
                _hoverLi= _ul.children('li:eq('+hoverIndex+')');
                _ul.children('li').removeClass('hover');
                _hoverLi.addClass('hover');
                if(e.keyCode==13){
                    _hoverLi.click();
                }else{
                    if( (_hoverLi.offset()['top']-_ul.offset()['top']+_hoverLi.outerHeight() )>_ul.outerHeight()){
                        _ul.scrollTop(_hoverLi.offset()['top']-_ul.children('li:eq(0)').offset()['top']-_ul.outerHeight()+_hoverLi.outerHeight());
                    }else if(_hoverLi.offset()['top']<_ul.offset()['top'] ){
                        _ul.scrollTop(_hoverLi.offset()['top']-_ul.children('li:eq(0)').offset()['top']);
                    }
                }
            });
            _ul.delegate('li','mouseover',function(){
                hoverIndex=$(this).index();
                _ul.children('li').removeClass('hover');
                _ul.children('li:eq('+hoverIndex+")").addClass('hover');
            });
            //options['returnDataType']=='json'时候，插件来绑定监听
            _ul.delegate('li','click',function(){
                let _target=$(this);
                chooseLiHandler(_target);
            });
            //resize对齐
            $(window).on('resize',function(){
                alignUl();
            })
            //阻止滚轮事件冒泡
            _ul.on('mousewheel DOMMouseScroll',function(e){e.stopPropagation();});
            //选中li的handler
            function chooseLiHandler(_target){
                // _this.val(_target.html());
                animationVal(_target.html(),_target);
            }
            //动态过度input.value();
            function animationVal(value,_target){
                let limit=value.length;
                let interval=50*10/limit;
                let index=1;
                render();
                function render(){
                    _this.val(value.substring(0,index));
                    index++;
                    if(index>limit){
                        options['onclick'](_target);
                        return true;
                    }else{
                        setTimeout(function(){
                            render();
                        },interval);
                    }
                };
            }

            //ajax方法
            function ajax(signal){
                $.ajax({
                    url: options['url'],
                    type: "POST",
                    data:options['ajaxData'](),
                    dataType: 'json',
                    success:function(data){
                        if(signal<count){
                            return true;
                        }
                        if( (options['success'])(data)===false){
                            return true;
                        };
                        options['stopSearch']();
                        renderUl(data);
                    },
                    error:options['error'],

                })
            }
            //输入完成后执行的函数
            function completeHandler(){
                _ul.html('');
                options['stopSearch']();
                hoverIndex=-1;
                if(compositionFlag){
                    return true;
                }
                count++;
                clearTimeout(timeFunc);
                //清空时取消匹配
                if(myTrim(_this.val())==""||myTrim(_this.val()).length<options['minLength']){
                    if(needInnerHtml){
                        showUl();
                    }else{
                        _ul.detach();
                    }
                    return true;
                }
                timeFunc=setTimeout(function(){
                    options['onSearch']();
                    showUl();
                    _ul.addClass('loading').css({maxHeight:'40px'});
                    ajax(count);
                },options['delay']);
            };
        }
        // bind listen end
        function showUl(){
            _ul.removeClass('loading').html('').css({maxHeight:options['height']});
            if(typeof options['innerHtml']=='object'){
                _ul.append(options['innerHtml']);
            }else if(typeof options['innerHtml']=='string'){
                _ul.html(options['innerHtml']);
            }
            alignUl();
            if(_ul.parent().length==0){
                options['body'].append(_ul);
            }
        }
        //对齐ul
        function alignUl(){
            _ul.css({
                'top':_this.offset()['top']+_this.outerHeight()+2-options['body'].offset()['top'],
                'left':_this.offset()['left']-options['body'].offset()['left'],
                'width':_this.outerWidth(),
            });
        }

        
    }
})(jQuery);



function myTrim(x) {
    return x.replace(/^\s+|\s+$/gm,'');
}
