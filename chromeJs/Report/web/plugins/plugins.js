/**
 * jAlert 
 */
function jAlert(content,inOptions){
    var options={
        onClose:null,
        parent:$("body"),
        title:"提示",
        removeTime:300,
        whiteImgHeader:false,//使用nint_white.png (.white-img-header)
    }
    $.extend(options,inOptions);
    var _container=$(document.createElement("div"));
    var _panel=$(document.createElement("div"));
    var _panelHeading=$(document.createElement("div"));
    var _panelBody=$(document.createElement("div"));
    var _panelFooter=$(document.createElement("div"));
    var _removeBtnTop=$(document.createElement("button"));
    var _removeBtnBottom=$(document.createElement("button"));

    _container.addClass("alert-container");
    _panel.addClass("alert-panel");
    _panelHeading.addClass("alert-panel-heading");
    _panelBody.addClass("alert-panel-body");
    _panelFooter.addClass("alert-panel-footer");
    _removeBtnTop.addClass("alert-remove-button-top btn-remove btn");
    _removeBtnBottom.addClass("alert-remove-button-bottom btn-remove btn btn-sm btn-info hover-lighting btn-china btn-ec no-radius ").html("決定する");
    
    _panelHeading.html("<span class='alert-title-span title-span-pc low-weight-line'>"+(options['title'])+"</span>").append(_removeBtnTop);
    _panelBody.append(content);
    _panelFooter.append(_removeBtnBottom);
    _panel.append(_panelHeading).append(_panelBody).append(_panelFooter);
    _container.append(_panel);

    //添加class
    if(options['whiteImgHeader']){
        _container.addClass('white-img-header');
    }


    options['parent'].append(_container);

    _container.delegate("button.btn-remove",'click',function(){
        _container.addClass("remove");
        if(typeof(options['onClose'])=='function'){
            options['onClose']();
        }
        setTimeout(function(){
            _container.remove();
        },options['removeTime']);
    });

}