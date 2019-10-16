;(function($){
    $.fn.swiperAxis=function(inOptions){
        let options={
            width:'100%',
            parent:$('body'),
        };
        let _this=$(this);
        let _parent=options['parent'].addClass('swiper-axis-container');
        _this.each(function(){
            let _dom=$(this);
            let _content=$(document.createElement('div')).addClass('swiper-axis-content');
        })
    };
})(jQuery);