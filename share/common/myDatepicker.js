
/**
 * author: wang.yajie
 * 基于swiperAxis.js开发，请先引入swiperAxis.js swiperAxis.css
 * options:
 *      startDate： 开始日期 yyyy-mm-dd
 *      endDate: 结束日期 默认是当前日期
 *      view:0 1 2 3 4 表示 "年月日周季"五个视图 
 *      parent: query selector； 选择器添加到哪一个dom下面，默认是'body';
 */

;(function($){
    $.fn.myDatePicker=function(inOptions){
        $(this).each(function(){
            let options={
                view:2,//0 1 2 3 4 年 月 日 周 季  
                startDate:'2014-01-01 00:00:00',
                endDate:(new Date()).Format("yyyy-mm-dd hh:ii:ss"),
                onDateChange:function(value,lastValue){

                },
                parent:'body',
            };
            options=$.extend(options,inOptions);
            //这里采用eval是为了方便动态去判断parent
            // options['parent']=eval(options['parent']);
            let format='yyyy-mm-dd';
            let _this=$(this);
            let value=_this.val()==''?(new Date()).Format("yyyy-mm-dd hh:ii:ss"):_this.val(),originalValue=value;
            let year,month,day,maxYear,maxMonth,maxDay,minYear,minMonth,minDay;
            let _bg=$(document.createElement('div')).addClass('my-date-picker-bg'),
            _container=$("<div class='my-date-picker-container "+('date-view-'+options['view'])+" '></div>").attr('tabindex','-1'),
            _yearPanel=$("<div class='my-date-picker-panel year-panel'></div>"),
            _monthPanel=$("<div class='my-date-picker-panel month-panel'></div>"),
            _dayPanel=$("<div class='my-date-picker-panel day-panel'></div>");
            let _yearUl,_monthUl,_dayUl;
            let _operatorContainer;
            // process
            initDom();
            fixDate();//保留部分日期（格式合法 且 在区间 内）
            initSwiperAxis();
            bindListen();
            // api
            _this[0].resetDatePicker=function(inOptions){
                let prevView=options['view'];
                options=$.extend(options,inOptions);
                _container.removeClass('date-view-'+prevView).addClass('date-view-'+options['view']);
                initDom();
                fixDate();
                initSwiperAxis();
                swipeDateToValue();
            };


            function initDom(){
                if($(options['parent']).css('position')=='static'){
                    $(options['parent']).css('position','relative');
                }
                _container.html('')
                if(_bg.html()==''){
                    _bg.html(_container);
                }
                //计算实际的最大/最小年月日;
                fixDateLimit();
                // title
                _container.append('<div class="operator-container"></div>');
                _operatorContainer=_container.children('.operator-container');
                let functions=[
                    [initYear],                  //year
                    [initYear,initMonth],        //month
                    [initYear,initMonth,initDay],//day
                    [initYear,initMonth,initDay],//week
                    [initYear,initMonth],        //season
                ];
                for(var i in functions[options['view']]){
                    functions[options['view']][i]();
                }
            }


            function initYear(){
                _yearPanel.html('<div class="my-date-picker-panel-body"><ul class="date-picker-ul"></ul></div><div class="my-date-picker-panel-header"><span class="date-title">年</span></div><button class="date-picker-btn increase-btn" type="button"></button><button class="date-picker-btn decrease-btn" type="button"></button>');
                let tempYear=minYear;
                year=value.toDate(format).getFullYear();
                _yearUl=_yearPanel.find('ul.date-picker-ul');
                while(tempYear<=maxYear){
                    _yearUl.append('<li date-value='+tempYear+'>'+tempYear+'</li>');
                    tempYear++;
                }
                _container.append(_yearPanel);   
            }
            function initMonth(){
                _monthPanel.html('<div class="my-date-picker-panel-body"><ul class="date-picker-ul"></ul></div><div class="my-date-picker-panel-header"><span class="date-title">月</span></div><button class="date-picker-btn increase-btn" type="button"></button><button class="date-picker-btn decrease-btn" type="button"></button>');
                let tempMonth=1;
                month=value.toDate(format).getMonth()+1;
                _monthUl=_monthPanel.find('ul.date-picker-ul');
                while(tempMonth<=12){
                    let monthText=tempMonth.length==1?('0'+tempMonth):tempMonth;
                    _monthUl.append('<li date-value='+tempMonth+'>'+monthText+'</li>');
                    tempMonth++;
                }
                _container.append(_monthPanel)
            }
            function initDay(){
                _dayPanel.html('<div class="my-date-picker-panel-body"><ul class="date-picker-ul"></ul></div><div class="my-date-picker-panel-header"><span class="date-title">日</span></div><button class="date-picker-btn increase-btn" type="button"></button><button class="date-picker-btn decrease-btn" type="button"></button>');
                let tempDay=1;
                day=value.toDate(format).getDate();
                _dayUl=_dayPanel.find('ul.date-picker-ul');
                while(tempDay<=31){
                    let dayText=tempDay.length==1?('0'+tempDay):tempDay;
                    _dayUl.append('<li date-value='+tempDay+'>'+dayText+'</li>');
                    tempDay++;
                }
                _container.append(_dayPanel);
            }



            function initSwiperAxis(){
                _container.find('div.my-date-picker-panel-body').each(function(){
                    let _body=$(this);
                    let _ul=$(this).find('ul');
                    let _span=$(this).parent().find('span.date-title');
                    let timeFunc;
                    $(this).swiperAxis({
                        direction:'vertical',
                        scrollSpeed:function(){
                            return  _ul.children('li:visible').outerHeight();;
                        },
                        scrollFrame:5,
                        clickFrame:3,
                        moveSpeed:function(){
                            return _ul.children('li:visible').outerHeight();
                        },
                        fixLimit:function(){
                            let liHeight=_span.outerHeight();
                            //限制
                            let correctMax=_span.offset()['top']-_ul.offset()['top']+_body[0].getX();
                            let correctMin=_span.offset()['top']-_ul.offset()['top']-_ul.outerHeight()+liHeight+_body[0].getX();
                            let minX=correctMin-liHeight;
                            let maxX=correctMax+liHeight;
                            return {
                                correctMin:correctMin,
                                correctMax:correctMax,
                                maxX:maxX,
                                minX:minX
                            }
                        },
                        resize:function(e){
                            return false;
                        },
                        afterMove:function(isTrusted){
                            // let diff=_span.offset()['top']-_ul.offset()['top'];
                            isTrusted=arguments[0]||arguments[0]===false?arguments[0]:true;
                            clearTimeout(timeFunc);
                            if(!isTrusted||_body[0].mousedown||!_container.is(':visible')){
                                return 0;
                            }
                            _body[0].rafCount++;
                            //更新日期
                            timeFunc=setTimeout(function(signal){
                                if(signal<_body[0].rafCount||!_container.is(':visible')){
                                    return true;
                                }
                                _body[0].rafCount++;
                                let diff=_span.offset()['top']-_ul.offset()['top'];
                                let index= Math.floor(diff/_ul.children('li:visible').outerHeight());
                                let offset= diff%_ul.children('li:visible').outerHeight()>_ul.children('li:visible').outerHeight()/2?1:0;
                                index+=offset;
                                index=Math.max(0,Math.min(index,_ul.children('li:visible').length-1));
                                let distance=_body[0].getX()+_span.offset()['top']-_ul.children('li:visible:eq('+index+')').offset()['top'];
                                _body[0].swiperTo(distance,{frame:10,useRaf:true});
                                updateDateByDistance();
                            },20,_body[0].rafCount);
                            //记得用let声明
                            let updateDateByDistance=function(){
                                let diff=_span.offset()['top']-_ul.offset()['top'];
                                let index= Math.floor(diff/_ul.children('li:visible').outerHeight());
                                let offset= diff%_ul.children('li:visible').outerHeight()>_ul.children('li:visible').outerHeight()/2?1:0;
                                index+=offset;
                                index=Math.max(0,Math.min(_ul.children('li:visible').length-1,index));
                                let _panel=_body.parent();
                                let dateValue=parseInt(_ul.children('li:visible:eq('+index+')').attr('date-value'));
                                let viewIndex=0;
                                if(_panel.hasClass('year-panel')){
                                    year=dateValue;
                                    viewIndex=0;
                                }else if(_panel.hasClass('month-panel')){
                                    month=dateValue;
                                    viewIndex=1;
                                }else if(_panel.hasClass('day-panel')){
                                    day=dateValue;
                                    viewIndex=2;
                                }
                                // newDateText=value=year+'-'+(month<10?('0'+month):month)+'-'+(day<10?('0'+day):day);
                                fixDate();
                                resetSwiper(viewIndex);
                                swipeDateToValue();
                            }
                        },
                    });
                }); 
            }


            function bindListen(){
                let focus=false;
                let hover=false;
                function timeoutFunc(){
                    setTimeout(function(){
                        if(!focus&&!hover){
                            _this.removeClass('date-picker-focus');
                            _bg.detach();
                        }
                    },100);
                }
                _this.on('focus',function(){
                    //初始化value
                    _this.val()==''?(new Date()).Format("yyyy-mm-dd hh:ii:ss"):_this.val();
                    _this.addClass('date-picker-focus');
                    focus=true;
                    if(_container.is(':visible')) return true;
                    _container.css({
                        top:_this.offset()['top']+_this.outerHeight()+4-$(options['parent']).offset()['top'],
                        left:_this.offset()['left']-$(options['parent']).offset()['left'],
                        width:_this.outerWidth(),
                    });
                    $(options['parent']).append(_bg);
                    resetSwiper();
                    //移动到指定日期
                    swipeDateToValue();
                });
                _container.on('mouseover',function(){
                    hover=true;
                })
                _this.on('blur',function(){
                    focus=false;
                    timeoutFunc();
                });
                _container.on('mouseout',function(){
                    hover=false;
                    _this.focus();
                    timeoutFunc();
                });
                _container.delegate('button.date-picker-btn','click',function(e){
                    let _btn=$(this);
                    if(_btn.hasClass('decrease-btn')){
                        _btn.parent().children('div.my-date-picker-panel-body')[0].swiperLeftBtn.click();
                    }else{
                        _btn.parent().children('div.my-date-picker-panel-body')[0].swiperRightBtn.click();
                    }
                });
                _container.delegate('div.my-date-picker-panel-body','mouseover',function(){
                    this.alignSwiper();
                });
            }

            function resetSwiper(viewIndex){
                viewIndex=arguments[0]==undefined?-1:arguments[0];
                if(viewIndex>=0){
                    _container.find('div.my-date-picker-panel-body')[viewIndex].reset();
                }else{
                    _container.find('div.my-date-picker-panel-body').each(function(){
                        this.reset();
                    });
                }

            }

            /**
             * 移动到value对应的日期
             */
            function swipeDateToValue(){
                let fixFunctions=[
                    [swipeYear],                  //year
                    [swipeYear,swipeMonth],        //month
                    [swipeYear,swipeMonth,swipeDay],//day
                    [swipeYear,swipeMonth,swipeDay],//week
                    [swipeYear,swipeMonth],        //season
                ];
                value=_this.val();
                for(var i in fixFunctions[options['view']]){
                    fixFunctions[options['view']][i]();
                }
                function swipeYear(){
                    year=value.toDate().getFullYear();
                    let _body=_yearPanel.children('div.my-date-picker-panel-body');
                    let _span=_yearPanel.find('span.date-title');
                    let _li=_body.find('ul li[date-value='+year+']');
                    let distance=_span.offset()['top']-_li.offset()['top']+_body[0].getX();
                    _body[0].swiperTo(distance);
                }

                function swipeMonth(){
                    month=value.toDate().getMonth()+1;
                    let _body=_monthPanel.children('div.my-date-picker-panel-body');
                    let _span=_monthPanel.find('span.date-title');
                    let _li=_body.find('ul li[date-value='+month+']');
                    let distance=_span.offset()['top']-_li.offset()['top']+_body[0].getX();
                    _body[0].swiperTo(distance);
                }

                function swipeDay(){
                    day=value.toDate(format).getDate();
                    let _body=_dayPanel.children('div.my-date-picker-panel-body');
                    let _span=_dayPanel.find('span.date-title');
                    let _li=_body.find('ul li[date-value='+day+']');
                    let distance=_span.offset()['top']-_li.offset()['top']+_body[0].getX();
                    _body[0].swiperTo(distance);
                }
            }


           /**
            * 检查不符合要求的日期
            */ 
            function fixDate(){
                let fixFunctions=[
                    [fixYear],                  //year
                    [fixYear,fixMonth],        //month
                    [fixYear,fixMonth,fixDay],//day
                    [fixYear,fixMonth,fixDay],//week
                    [fixYear,fixMonth],        //season
                ];
                let times=[];
                let weeks=['周日','周一','周二','周三','周四','周五','周六'];
                for(var i in fixFunctions[options['view']]){
                    times.push(fixFunctions[options['view']][i]());
                }
                value=[times.slice(0,3).join('-'),times.slice(3).join(':')].join(' ');
                _this.val(value);
                if(options['view']!=4){
                    let dateText=value+(options['view']>=2?("  "+weeks[value.toDate(format).getDay()]):'');
                    _operatorContainer.html("<span class='date-title'>"+dateText+"</span>") ;
                }else{
                    let seasonText=['一季度','二季度','三季度','四季度'][(month-1)/3]
                    _operatorContainer.html("<span class='date-title'>"+ year + "  " + seasonText +"</span>") ;
                }
            }

            function fixDateLimit(){
                let startDate=options['startDate'].toDate(format);
                let endDate=options['endDate'].toDate(format);
                switch(options['view']){
                    case 3:
                        //周 判断endDate所在月是否有周一没有则endDate前移一个月
                        if(endDate.getLastMonday()<0){
                            endDate=new Date(endDate.getFullYear(),endDate.getMonth(),endDate.getLastMonday());
                        }
                        //startDate调整为前一个周一
                        startDate=new Date(startDate.getFullYear(),startDate.getMonth(),startDate.getLastMonday());
                        break;
                    case 4:
                        //季度 将startDate endDate改变成他们所在的季度的开始的那一个月 
                        endDate=new Date(endDate.getFullYear(),endDate.getMonth()-endDate.getMonth()%3,1);
                        break;
                }
                startDate=new Date(Math.min(startDate,endDate));
                maxYear=endDate.getFullYear();
                minYear=startDate.getFullYear();
                minDay=startDate.getDate();
                maxDay=endDate.getDate();
                maxMonth=endDate.getMonth()+1;
                minMonth=startDate.getMonth()+1;
            }

            function fixYear(){
                if(_yearPanel.parent().length==0){
                    return true;
                }
                year=Math.min(maxYear,Math.max(minYear,year));
                return year;
            }


            function fixMonth(){
                if(_monthPanel.parent().length==0){
                    return true;
                }
                if(year==maxYear){
                    month=Math.min(month,maxMonth);
                } 
                if(year==minYear){
                    month=Math.max(month,minMonth);
                }
                if(options['view']>=4){
                    month=month-(month-1)%3;
                }
                _monthUl.children('li').each(function(){
                    let _li=$(this);
                    let tempMonthText=_li.attr('date-value').length==1?('0'+_li.attr('date-value')):_li.attr('date-value');
                    let dateText=year+'-'+tempMonthText;
                    if(checkMonth(dateText)){
                       _li.css('display',''); 
                    }else{
                        _li.hide();
                    }
                    //季度，只取 1 4 7 10 每个季度开始月
                    if(options['view']>=4&&new Date(dateText).getMonth()%3!=0){
                        _li.css('display','none');
                    }
                });
                return month<10?('0'+month):month;
            }

            function fixDay(){
                if(_dayPanel.parent().length==0){
                    return true;
                }
                if(year==maxYear&&month==maxMonth){
                    day=Math.min(day,maxDay);
                }
                if(year==minYear&&month==minMonth){
                    day=Math.max(day,minDay);
                }
                day=Math.min(day,getLastDay(year+'-' + (month<10?('0'+month):month) + '-01'));
                switch(options['view']){
                    case 3:
                        //week 取上一个周一
                        day=new Date(year,month-1,day).getLastMonday();
                        //获取本月第一个周一
                        if(day<=0){
                            day=new Date(year,month-1,1).getNextMonday();
                        }
                        break;
                    case 4:
                        //season
                        day=1;
                        break;
                }
                _dayUl.children('li').each(function(){
                    let _li=$(this);
                    let tempDayText=_li.attr('date-value').length==1?('0'+_li.attr('date-value')):_li.attr('date-value');
                    let tempMonthText=month<10?('0'+month):month;
                    let tempDateText=year+'-'+tempMonthText+'-'+tempDayText;
                    //day
                    if(checkDate(year+'-'+tempMonthText+'-'+tempDayText)){
                        _li.css('display',''); 
                     }else{
                         _li.hide();
                     }
                    //week 和 season week 只显示每周 的周一 季度只显示该月第一天 
                    switch(options['view']){
                        case 3:
                            //week
                            if(new Date(tempDateText).getDay()!=1){  
                                _li.hide();
                            }
                            break;
                        case 4:
                            //season
                            if(tempDayText!='01'){
                                _li.hide();   
                            }
                            break;
                    }
                });
                return day<10?('0'+day):day;
            }

            function checkDate(date){
                let parseDate=date.toDate(format);
                let startDate=new Date(minYear,minMonth-1,minDay);
                let endDate=new Date(maxYear,maxMonth-1,maxDay);
                return checkDayLegal(date)&&Date.parse(parseDate)>=Date.parse(startDate)&&Date.parse(parseDate)<=Date.parse(endDate);
            }

            function checkMonth(date){
                let startDate=new Date(minYear,minMonth-1,1);//取当月第一天
                let endDate=new Date(maxYear,maxMonth-1,1);//取当月第一天
                return Date.parse(date.toDate())>=Date.parse(startDate)&&Date.parse(date.toDate())<=Date.parse(endDate);
            }

            /**
             * 检查日是否合法
             */
            function checkDayLegal(date){
                return (date.toDate(format).getDate()==parseInt(date.substring(date.length-2)))
            }

            /**
             * get last day of the month
             */
            function getLastDay(str){
                let tempDate=new Date(str);
                tempDate.setMonth(tempDate.getMonth()+1);
                tempDate.setDate(0);
                let lastDay=tempDate.getDate();   
                return lastDay;       
            }

        });
    };
}(jQuery));




Date.prototype.Format = function (fmt) { 
    fmt=arguments[0]?arguments[0]:"yyyy-mm-dd";
    var o = {
        "m+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "i+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
    };
    if (/(y+)/.test(fmt)){
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    } 
    for (var k in o){
        if (new RegExp("(" + k + ")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        } 
    }
  
    return fmt;
}

Date.prototype.getLastMonday=function(){
    let day=this.getDate();
    let week=this.getDay();
    let monday=day-((week==0?7:(week%7))-1);
    //返回值<=0表示在上一个月
    return monday;
}
Date.prototype.getNextMonday=function(){
    let day=this.getDate();
    let week=this.getDay();
    let monday=day + (8-week)%7;
    return monday;
}


String.prototype.toDate = function (fmt){
    fmt=arguments[0]?arguments[0]:"yyyy-mm-dd";
    var o = ["y+","m+","d+","h+","i+","s+"];
    var times=[];
    let now=new Date();
    for( var i in o){
        reg=new RegExp("("+o[i]+")");
        let time='';
        if(reg.test(fmt)){
            time=this.substr(fmt.match(reg)['index'],RegExp.$1.length);
        }
        if(time==''){
            time=(i==0?now.getFullYear():(i<=2?'01':'00'));
        }
        times.push(time);
    }
    //safari不兼容 2019-10-10 只能2019/10/10
    return new Date([times.slice(0,3).join('/'),times.slice(3).join(':')].join(' '));
}