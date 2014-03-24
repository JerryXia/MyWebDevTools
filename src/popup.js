/*  Global  */
$(function(){
    $('.tab').click(function(){
        //console.log(this.id);
        $(this).addClass('hover').siblings().removeClass('hover');
        $('#con'+$(this).data('id')).show().siblings().hide();
        
        switch(parseInt(this.id.substr(3))){
            case 1:
                break;
            case 2:
                break;
            case 3:
                break;
            case 4:
                convertUrl2QR();
                //console.log(url);
                break;
            default:
                break;
        }
    });
    $('#con2_switch').click(function(){
        chrome.tabs.executeScript({
            code: 'document.body.contentEditable=document.body.contentEditable=="true"?"false":"true";document.designMode=document.designMode=="on"?"off":"on";'
        });
    });
    $('#con2_bdshoucang').click(function(){
        chrome.tabs.executeScript({
            code: "(function(d) {var e = d.createElement('script'); e.byebj = true; e.src = 'http://s.wenzhang.baidu.com/js/pjt/content_ex/page/bookmark.js?s=bm&t=' + (+new Date()); var b = d.getElementsByTagName('body')[0]; b.firstChild ? b.insertBefore(e, b.firstChild) : b.appendChild(e); })(document)"
        });
    });
});

/*  Coookie  */

$("#qie_name").val(localStorage['qie_name'])
$("#qie_value").val(localStorage['qie_value'])
$("#open").click(function(){
    chrome.tabs.getSelected(undefined, function(tab){
        chrome.cookies.set({
            url:tab.url,
            name:$("#qie_name").val(),
            value:$("#qie_value").val()
        }, function(){
            $("#name").val("")
            $("#value").val("")
            chrome.cookies.getAll({
                url:tab.url
            },function(cookies){
                $("#cookies").html("")
                update(tab.url,cookies)
            })
        })
    });
    localStorage['qie_name']=$("#qie_name").val()
     localStorage['qie_value']=$("#qie_value").val()
})
$("#close").click(function(){
    chrome.tabs.getSelected(undefined, function(tab){
        chrome.cookies.remove({
            url:tab.url,
            name:$("#qie_name").val(),
        }, function(){
            $("#name").val("")
            $("#value").val("")
            chrome.cookies.getAll({
                url:tab.url
            },function(cookies){
                $("#cookies").html("")
                update(tab.url,cookies)
            })
        })
    });
     localStorage['qie_name']=$("#qie_name").val()
     localStorage['qie_value']=$("#qie_value").val()
})
chrome.tabs.getSelected(undefined, function(tab){
    chrome.cookies.getAll({
        url:tab.url
    },function(cookies){
        update(tab.url,cookies)
    })
})
var cache=[
    
]
var update=function(url,cookies){
    $.each(cookies,function(i,n){
        var item=document.createElement("div");
        
        var key=document.createElement("input");
        key.type="text";
        key.className="name"
        key.style.width="150px"
        key.style.marginLeft="10px"
        key.value=n.name

        item.appendChild(key)
        var value=document.createElement("input");
        value.type="text";
        value.className="value"
        value.style.width="150px"
        value.style.marginLeft="10px"
        value.value=n.value
        item.appendChild(value)
        var check=document.createElement("a")
        check.href=""
        check.innerHTML="更改"
        item.appendChild(check);
        var del=document.createElement("a")
        del.innerHTML="删除"
        del.href=""
        item.appendChild(del);
        $("#cookies").append(item);
        
        $(del).click(function(){
            var name=$(this.parentNode).children(".name").val();
            var value=$(this.parentNode).children(".value").val()
            chrome.cookies.remove({
                url:url,
                name:$(this.parentNode).children(".name").val()
            }, function(){
                cache.push({
                    name:name,
                    value:value,
                    url:url,
                    isClose:true
                })
                chrome.cookies.getAll({
                    url:url
                },function(cookies){
                    $("#cookies").html("")
                    update(url,cookies)
                })
            })
        })
        $(check).click(function(){
            var name=$(this.parentNode).children(".name").val();
            var value=$(this.parentNode).children(".value").val()
            chrome.cookies.set({
                url:url,
                name:name,
                value:value
            }, function(){
                chrome.cookies.getAll({
                    url:url
                },function(cookies){
                    $("#cookies").html("")
                    update(url,cookies)
                })
            })
        })
    })
}
$("#add").click(function(){
    chrome.tabs.getSelected(undefined, function(tab){
        chrome.cookies.set({
            url:tab.url,
            name:$("#name").val(),
            value:$("#value").val()
        }, function(){
            $("#name").val("")
            $("#value").val("")
            chrome.cookies.getAll({
                url:tab.url
            },function(cookies){
                $("#cookies").html("")
                update(tab.url,cookies)
            })
        })
    })
})
$("#value").keydown(function(e){
    if(e.keyCode!=13) return;
    chrome.tabs.getSelected(undefined, function(tab){
        chrome.cookies.set({
            url:tab.url,
            name:$("#name").val(),
            value:$("#value").val()
        }, function(){
            $("#name").val("")
            $("#value").val("")
            chrome.cookies.getAll({
                url:tab.url
            },function(cookies){
                $("#cookies").html("")
                update(tab.url,cookies)
            })
        })
    })
})


function convertUrl2QR(){
    chrome.tabs.getSelected(null, function(tab) {
        var url = "https://chart.googleapis.com/chart?cht=qr"+
                  "&chs=200x200&choe=UTF-8&chld=Q|0&chl=" + tab.url + "";

        if (tab.favIconUrl) {
            $("#fav").attr("src", tab.favIconUrl).show();
        }

        $("#fav, #qr").bind("error", function(e) {
            $(e.target).hide();
        });

        $("#qr").attr("src", url);
    });
}




