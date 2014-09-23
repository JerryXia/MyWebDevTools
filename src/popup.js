//"use strict";

$.fn.coffee = function(obj){
  for(var eName in obj)
    for(var selector in obj[eName])
      $(this).on(eName, selector, obj[eName][selector]);
}

/*  Global  */
var nowDateTime = new Date();
$('p strong.showtime').text(nowDateTime.toLocaleDateString() + ' ' + nowDateTime.toTimeString());

//Cache Killer
if (localStorage["turnOnByDefault"] === "on") {
    document.getElementById("enableOnStartElement").checked = true;
}

$(function(){
  $('#main').coffee({
    click: {
      '.menubox .tab': function(){
        $(this).addClass('hover').siblings().removeClass('hover');
        $('#con'+$(this).data('id')).show().siblings().hide();
        switch(parseInt(this.id.substr(3))){
        case 1:
          break;
        case 2:
          break;
        case 3:
          convertUrl2QR();
          //console.log(url);
          break;
        case 4:
          $container = $('#con4_newfilms');
          $list = $container.find('div.newfilms');
          if($list.length > 0){
            // console.log('1');
          }else{
            var html = '';
            for(var i = 0; i < dylist.length; i++){
              var tmpl = '<div class="newfilms" data-alias="'+dylist[i].alias+'">'+
                  '<h2><a href="'+dylist[i].siteurl+'" target="_blank">'+dylist[i].sitename+'</a></h2>'+
                  '<div class="'+dylist[i].alias+'">加载中....</div></div>';
              html += tmpl;
            }
            $container.append(html);
            $container.find('div.newfilms').each(function(){
              var alias = $(this).data('alias');
              $.get("http://cengshu.apphb.com/api/public/getnewfilm/"+alias, function(res){
                var resHtml = '<ul>';
                if(res.length > 0){
                  for(var i = 0; i < res.length; i++){
                    resHtml += '<li><a href="'+res[i].Href+'" target="_blank" title="'+res[i].UptTime+'"><nobr>'+ res[i].Txt +'</nobr></a></li>';
                  }
                  resHtml += '</ul>';
                  $('#con4_newfilms div.'+ alias).first().html(resHtml);
                }else{
                  $('#con4_newfilms div.'+ alias).first().html('<strong>无数据！</strong>');
                }
                
              });
            });
          }
          break;
        default:
          break;
        }
      },
      '#enableOnStartElement': function(){
        var newValue = "off";
        if (document.getElementById("enableOnStartElement").checked) {
            newValue = "on";
        }
        localStorage["turnOnByDefault"] = newValue;
      },
      '#con2_switch': function(){
        chrome.tabs.executeScript({
            code: 'document.body.contentEditable=document.body.contentEditable=="true"?"false":"true";document.designMode=document.designMode=="on"?"off":"on";'
        });
      },
      '#con2_bdshoucang': function(){
        chrome.tabs.executeScript({
            code: "(function(d) {var e = d.createElement('script'); e.byebj = true; e.src = 'http://s.wenzhang.baidu.com/js/pjt/content_ex/page/bookmark.js?s=bm&t=' + (+new Date()); var b = d.getElementsByTagName('body')[0]; b.firstChild ? b.insertBefore(e, b.firstChild) : b.appendChild(e); })(document)"
        });
      },
      '#con2_btn-export': function(){
        chrome.tabs.getSelected(null, function(tab) {
          chrome.tabs.sendRequest(tab.id, {method: "getHtml"}, function(response) {
            if(response.method=="getHtml"){
              var html = response.data;

              var urlObject = window.URL || window.webkitURL || window,
                builder = new Blob([html], {type: 'text/plain; charset=utf-8'});

              var saveLink = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
              saveLink.href = urlObject.createObjectURL(builder);
              saveLink.download = 'export.html';
              var event = document.createEvent('MouseEvents');
              event.initMouseEvent(
                "click", true, false, window, 0, 0, 0, 0, 0
                , false, false, false, false, 0, null
              );
              saveLink.dispatchEvent(event);
            }
          });
        });
      }
    }
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



/******************
* markdown preview
*******************/
var pageKey, 
  storage = chrome.storage.local,
  themePrefix = 'theme_',
  specialThemePrefix = 'special_',
  defaultThemes = ['Clearness', 'ClearnessDark', 'Github', 'TopMarks'];

storage.get('theme', function(items) {
  var theme = items.theme ? items.theme : 'Clearness';
  $('#current-theme').html(theme);
});

// theme
function getThemes() {
  storage.get(['custom_themes', pageKey], function(items) {
    if(items.custom_themes) {
      var k, v, themes = items.custom_themes;
      var group = $('<optgroup label="Custom themes"></optgroup>');

      $('#theme optgroup[label="Custom themes"]').empty().remove();
      for(k in themes) {
        v = themes[k];
        group.append($("<option></option>").text(v)); 
      }
      $('#theme').append(group);
    }

    if(items[pageKey]) {
      $('#theme').val(items[pageKey]);
    } 
  });
}

chrome.tabs.getSelected(null, function(tab) {
  pageKey = specialThemePrefix + tab.url;
  getThemes();
  $('#theme').change(function() {
    var obj = {};
    obj[pageKey] = $(this).val();
    storage.set(obj);
  });
});



/************************
* url convert to qrcode
************************/
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

var SimpleTplEngine = function(html, options) {
  var re = /<%([^%>]+)?%>/g, 
      reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,
      code = 'var r=[];\n', 
      cursor = 0; 
  var add = function(line, isjs) { 
    isjs ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') : 
          (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
    return add;
  } 
  while(match = re.exec(html)) { 
      add(html.slice(cursor, match.index))(match[1], true); 
      cursor = match.index + match[0].length; 
  } 
  add(html.substr(cursor, html.length - cursor)); 
  code += 'return r.join("");'; // <-- return the result 
  //console.log(code);
  return new Function(code.replace(/[\r\t\n]/g, '')).apply(options); 
}

var dylist = [
  {
    sitename: "飘花电影",
    siteurl: "http://www.piaohua.com",
    alias: "piaohua",
    charset: "utf-8"
  },
  {
    sitename: "放放电影",
    siteurl: "http://www.poxiao.com",
    alias: "ffdy",
    charset: "gb2312"
  },
  {
    sitename: "6v电影",
    siteurl: "http://www.6vdy.com",
    alias: "6vdy",
    charset: "gb2312"
  },
  {
    sitename: "大片网",
    siteurl: "http://www.bigpian.cn",
    alias: "bigpian",
    charset: "utf-8"
  },
  {
    sitename: "经典电影",
    siteurl: "http://www.tbmovie.com",
    alias: "tbmovie",
    charset: "utf-8"
  },
  {
    sitename: "龙部落",
    siteurl: "http://www.xuandy.com",
    alias: "xuandy",
    charset: "utf-8"
  }
];

var getDyListItem = function(dylist, alias){
  for(var i = 0; i < dylist.length; i++){
    if(dylist[i].alias == alias)
      return dylist[i];
  }
  return null;
}