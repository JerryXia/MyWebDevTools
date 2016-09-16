// ==UserScript==
// @name               MyTools
// @name:zh-CN         我的私有工具集
// @name:zh-TW         我的私有工具集
// @namespace          http://www.guqiankun.com/
// @homepageURL        https://greasyfork.org/scripts/10453-mytools
// @version            0.9.14
// @description        我的工具集：DirectGoogle、百度音乐盒去广告、豆瓣补全下载连接、网页右键解锁、购物党比价工具、解决百度云大文件下载限制、知乎界面美化、知乎真实链接地址重定向，默认快捷键：ALT + M
// @description:zh-CN  我的工具集：DirectGoogle、百度音乐盒去广告、豆瓣补全下载连接、网页右键解锁、购物党比价工具、解决百度云大文件下载限制、知乎界面美化、知乎真实链接地址重定向，默认快捷键：ALT + M
// @description:zh-TW  我的工具集：DirectGoogle、百度音樂盒去廣告、豆瓣補全下載連接、網頁右鍵解鎖、購物黨比價工具、解決百度雲大文件下載限制、知乎界面美化、知乎真實鏈接地址重定向，默認快捷鍵：ALT + M
// @author             JerryXia
// @icon               http://7xrmpf.com1.z0.glb.clouddn.com/avatar/3320138fe4724dbf2b3f8728ca264a32?s=48&r=G&d=
// @license            The MIT License (MIT); http://opensource.org/licenses/MIT
// @match              *://*/*
// @include            /^https?\:\/\/(www|news|maps|docs|cse|encrypted)\.google\./
// @include            http://play.baidu.com/*
// @include            http://movie.douban.com/subject/*
// @include            http://book.douban.com/subject/*
// @exclude            http://blog.guqiankun.com/*
// @exclude            http://localhost*
// @require            https://cdn.bootcss.com/jquery/2.2.0/jquery.min.js
// @require            https://cdn.bootcss.com/mustache.js/2.2.1/mustache.min.js
// @require            https://cdn.bootcss.com/vue/2.0.0-rc.5/vue.min.js
// @grant              unsafeWindow
// @grant              GM_log
// @grant              GM_addStyle
// @grant              GM_setValue
// @grant              GM_getValue
// @grant              GM_deleteValue
// @grant              GM_listValues
// @grant              GM_addValueChangeListener
// @grant              GM_removeValueChangeListener
// @grant              GM_getResourceText
// @grant              GM_getResourceURL
// @grant              GM_openInTab
// @grant              GM_xmlhttpRequest
// @run-at             document-end
// @noframes
// ==/UserScript==

var GmUtils = (function () {
    function GmUtils(environment) {
        this.env = environment;
    }
    GmUtils.prototype.setEnv = function (environment) {
        this.env = environment;
    };
    GmUtils.prototype.getAll = function () {
        var rtnVal = GM_listValues();
        this.log('getAll:' + rtnVal);
        return rtnVal;
    };
    GmUtils.prototype.getVal = function (key, defaultVal) {
        var rtnVal = GM_getValue(key, defaultVal);
        this.log('getVal:' + rtnVal);
        return rtnVal;
    };
    GmUtils.prototype.setVal = function (key, val) {
        GM_setValue(key, val);
    };
    GmUtils.prototype.delVal = function (key) {
        GM_deleteValue(key);
    };
    GmUtils.prototype.log = function (message) {
        //level 是可选的，默认值是0。其有效的值有：0 - 信息、1 - 警告、2 - 错误。
        if (this.env.toLowerCase() === 'debug') {
            GM_log('调试信息: ' + message);
        }
        else {
            //GM_log(message);
        }
    };
    GmUtils.prototype.addStyle = function(css){
        GM_addStyle(css);
    };
    GmUtils.prototype.DOMAttrModified = function(obj, fn){
        obj.addEventListener("DOMAttrModified", fn, false);
    };
    return GmUtils;
})();


(function(gmUtils, MutationObserver){

    function newGuid() {
        var guid = '';
        for (var i = 1; i <= 32; i++) {
            var n = Math.floor(Math.random() * 16.0).toString(16);
            guid += n;
            if ((i == 8) || (i == 12) || (i == 16) || (i == 20)){
                guid +=  "-";
            }
        }
        return guid;
    }
    String.prototype.contains = function(s) {
        return -1 !== this.indexOf(s);
    };
    String.prototype.startsWith = function(s) {
        return this.slice(0, s.length) == s;
    };

    function convertUrl2QR(url) {
        url = url || location.href;
        var imgUrl = "https://chart.googleapis.com/chart?cht=qr&chs=200x200&choe=UTF-8&chld=Q|0&chl=" + encodeURIComponent(url);
        var favUrl = $("head link[rel*='icon']").attr('href') || '//' + location.hostname + '/favicon.ico';
        $('#fav'+currentGuid).attr("src", favUrl).show();
        $('#fav'+currentGuid, '#qr'+currentGuid).bind("error", function(e) {
            $(e.target).hide();
        });
        $('#qr'+currentGuid).attr("src", imgUrl);
    }

    /*Direct Google*/
    function blockListeners(element, events) {
        function stopBubbling(event) {
            event.stopPropagation();
        }
        var eventList = events.split(' ');
        if(eventList) {
            var i, event;
            for(i = eventList.length - 1; i > -1; i--) {
                event = eventList[i].trim();
                if(event) {
                    element.removeEventListener(event, stopBubbling, true);
                    element.addEventListener(event, stopBubbling, true);
                }
            }
        }
    }
    function modifyGoogle() {
        var hostname = location.hostname;
        var pathname = location.pathname;
        var href = location.href;
        //remove web/video search redirects
        $('a[onmousedown^="return rwt("]').removeAttr('onmousedown');
        //remove custom search redirects
        $('.gsc-results a[href][data-cturl]').each(function() {
            blockListeners(this, 'mousedown');
        });
        //remove image search redirects
        $('a').filter('[class^="irc_"], [class*=" irc_"], [id^="irc_"]').each(function() {
            blockListeners(this, 'mousedown');
        });
        //remove news search redirects
        if(href.contains('tbm=nws') || hostname.startsWith('news.google.')) {
            $('a.article[href^="http"]').each(function() {
                blockListeners(this, 'click contextmenu mousedown mousemove');
            });
        }
        //remove shopping search redirects
        else if(href.contains('tbm=shop') || pathname.startsWith('/shopping/')) {
            $('a').filter('[href*="/aclk?"], [href*="/url?"]').each(function() {
                var m = this.href.match(/(?:\&adurl|\?q|\&url)\=(http.*?)(\&|$)/i);
                if(m && m[1]) {
                    var link = decodeURIComponent(m[1]);
                    m = link.match(/\=(https?(\%3A\%2F\%2F|\:\/\/).*?)(\&|$)/i);
                    if(m && m[1]) {
                        link = decodeURIComponent(m[1]);
                    }
                    this.href = link;
                }
            });
        }
        //remove map search redirects; does not remove redirects of advertisement
        else if(pathname.startsWith('/maps/') || '/maps' == pathname) {
            $('a[href^="http"]').each(function() {
                blockListeners(this, 'click contextmenu');
                //legacy
                if(this.href.contains('url?')) {
                    var m = this.href.match(/(?:\&|\?)q\=(http.*?)(\&|$)/i);
                    if(m && m[1]) {
                        this.href = decodeURIComponent(m[1]);
                    }
                }
            });
        }
        //remove legacy search redirects and docs redirects
        //should be done last as shopping uses the same url pattern
        $('a[href*="/url?"]').each(function() {
            var m = this.href.match(/\/url\?(?:url|q)\=(http.*?)(\&|$)/i);
            if(m && m[1]) {
                this.href = decodeURIComponent(m[1]);
            }
        });
        //expose cached links
        $('div[role="menu"] ul li a[href^="http://webcache.googleusercontent."]').each(
            function() {
                this.style.display = 'inline';
                $(this).closest('div.action-menu.ab_ctl, div._nBb')
                .after(' <a href="https' + this.href.substring(4) + '">(https)</a> ')
                .after($(this));
            }
        );
    }
    /* DouBanDownload */
    function appendLinks(items, appendTo){
        items.forEach(function(item, i){
            $("<a>")
            .html(item.html)
            .attr({
                href: item.href,
                target: "_blank"
            })
            .appendTo(appendTo);

            if(i != items.length -1){
                appendTo.append(" / ");
            }
        });
    }

    function startFeaturesByConfig(){
        gmUtils.log(location.hostname);
        if(vm.enabledBdMusicRemoveAd && location.hostname === 'play.baidu.com'){
            // 参考：https://greasyfork.org/zh-CN/scripts/2248-%E7%99%BE%E5%BA%A6%E9%9F%B3%E4%B9%90%E7%9B%92%E5%8E%BB%E5%B9%BF%E5%91%8A
            var i=0,t=window.setInterval(function(){//百度云把一些内容放到后面加载,因此我设置了一个延时循环，每隔100ms选择一下所需的元素，当所需的元素存在时，开始脚本，同时停止延时循环
                if($('#pauseAd').length>0 || i>100){
                    window.clearInterval(t);
                    var width_c4=$('.column4').width();
                    var right_c2=$('.column2').css('right');
                    $('.column3').css({'right':0});
                    $('.column4').css({'display':'none'});
                    $('.column2').css({'right':function(){return parseInt(right_c2,10)-width_c4;}});
                    $('.m-client-product').css({'display':'none'});
                    $('#pauseAd').remove();
                    $('.down-mobile').remove();
                    gmUtils.log('BdMusicRemoveAd:Ads have been removed by MyTools');
                }
                i++;
                gmUtils.log('BdMusicRemoveAd:waiting');
            }, 100);
        }

        var expTestDirectGoogle = /^https?\:\/\/(www|news|maps|docs|cse|encrypted)\.google\./.test(location.href);
        gmUtils.log('expTestDirectGoogle:'+expTestDirectGoogle);
        if(vm.enabledDirectGoogle && expTestDirectGoogle){
            // 参考：https://greasyfork.org/zh-CN/scripts/568-direct-google
            if(MutationObserver) {
                var observer = new MutationObserver(function(mutations) {
                    modifyGoogle();
                });
                //tiny delay needed for firefox
                setTimeout(function() {
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                    modifyGoogle();
                }, 100);
            }
            //for chrome v18-, firefox v14-, internet explorer v11-, opera v15- and safari v6-
            else {
                setInterval(function() {
                    modifyGoogle();
                }, 500);
            }
        }

        if(vm.enabledDouBanDownload){
            // 参考：https://greasyfork.org/zh-CN/scripts/300-douban-download-search
            var movieTitle = $('h1 span:eq(0)').text();
            var title = $('html head title').text();
            var keyword1 = title.replace( '(豆瓣)', '' ).trim();
            var keyword2 = encodeURIComponent( keyword1 );
            var movieSimpleTitle = movieTitle.replace(/第\S+季.*/, "");

            var Movie_links = [
                // { html: "百度盘", href: "http://www.baidu.com/s?wd=" + encodeURIComponent(keyword1 + " site:pan.baidu.com")},
                { html: "百度盘", href: "https://www.google.com/search?q=" + keyword1 + " site:pan.baidu.com"},
                { html: "人人影视", href: "http://www.yayaxz.com/search/" + movieSimpleTitle },
                { html: "VeryCD", href: "http://www.verycd.com/search/folders/" + keyword2 },
                { html: "SimpleCD", href: "http://simplecd.me/search/entry/?query=" + keyword1 },
                { html: "Donkey4u", href: "http://donkey4u.com/search/" + movieTitle },
                { html: "Torrent Project", href: "http://torrentproject.com/?&btnG=Torrent+Search&num=20&start=0&s=" + keyword2 },
                { html: "Google MiniSD", href: "https://www.google.com/search?ie=UTF-8&q=" + movieTitle + "+MiniSD" }
            ];
            var Book_links = [
                { html: "百度盘", href: "https://www.google.com/search?q=" + keyword1 + " site:pan.baidu.com"},
                { html: "mLook", href: "http://www.mlook.mobi/search?q=" + keyword2 },
                { html: "VeryCD", href: "http://www.verycd.com/search/folders/" + keyword2 },
                { html: "SimpleCD", href: "http://simplecd.me/search/entry/?query=" + keyword1 },
                { html: "Donkey4u", href: "http://donkey4u.com/search/" + movieTitle },
                { html: "Torrent Project", href: "http://torrentproject.com/?&btnG=Torrent+Search&num=20&start=0&s=" + keyword2 },
                { html: "Google", href: "https://www.google.com/search?ie=UTF-8&q=" + movieTitle },
            ];
            var link = $("<div>").append(
                $("<span>").attr("class", "pl").html("下载链接:")
            );
            switch(location.host){
                case "movie.douban.com":
                    appendLinks(Movie_links, link);

                    link.append('<br>')
                        .append('<span class="pl">字幕链接:</span>')
                        .append(
                            $("<a>").attr({
                                href: "http://shooter.cn/search/" + movieTitle,
                                target: "_blank"
                            }).html("Shooter")
                        );

                    break;
                case "book.douban.com":
                    appendLinks(Book_links, link);
                    break;
            }
            $('#info').append(link);
        }

        if(vm.enabledCopyPage){
            with (document.wrappedJSObject || document) {
                onmouseup = null;
                onmousedown = null;
                oncontextmenu = null;
                ondragstart = null;
                onselectstart = null;
                onselect = null;
                oncopy = null;
                onbeforecopy = null;
            }
            var arAllElements = document.getElementsByTagName('*');
            for (var i = arAllElements.length - 1; i >= 0; i--) {
                var elmOne = arAllElements[i];
                with (elmOne.wrappedJSObject || elmOne) {
                    onmouseup = null;
                    onmousedown = null;
                }
            }
        }

        if(vm.enabledGwd){
            var includeUrls = [
                'taobao.com',
                'tmall.com',
                'jd.com',
                'jd.hk',
                'amazon.cn',
                'amazon.com',
                'yhd.com',
                'suning.com',
                'gome.com.cn',
                'dangdang.com',
                'vip.com',
                'ebay.com',
                '6pm.com',
                'zol.com',
                'yixun.com',
                '51buy.com',
                'newegg.cn',
                'okhqb.com',
                'paipai.com',
                'sfbest.com',
                'womai.com',
                'kaola.com'
            ];
            for(var urlIndex = 0, len = includeUrls.length; urlIndex < len; urlIndex++){
                if(window.location.hostname.indexOf(includeUrls[urlIndex]) > -1){
                    var s = document.createElement("script");
                    s.type="text/javascript";
                    s.charset="utf-8";
                    s.src='https://browser.gwdang.com/get.js?f=/js/gwdang_extension.js';  //"//www.gwdang.com/get.js?f=/js/gwdang_extension.js";
                    document.body.appendChild(s);
                    break;
                }
            }
        }

        if(vm.enabledBdYunLargeFileDownload){
            var includeUrls = [
                'pan.baidu.com',
                'yun.baidu.com'
            ];
            for(var urlIndex = 0, len = includeUrls.length; urlIndex < len; urlIndex++){
                if(window.location.hostname.indexOf(includeUrls[urlIndex]) > -1){
                    if(window.location.protocol === 'http:' && /http:/.test(window.location.href)) {
                        window.location.href = 'https' + window.location.href.slice(4);
                    }
                }
            }
        }

        if(vm.enabledFlatZhihu){
            // 参考：https://github.com/Frizen/Plains-Gate/blob/master/flat_zhihu.CSS
            // @resource     wwwzhihucomcss http://7xrmpf.com1.z0.glb.clouddn.com/www.zhihu.com.css
            // @resource     zhuanlanzhihucomcss http://7xrmpf.com1.z0.glb.clouddn.com/zhuanlan.zhihu.com.css
            // @resource     wwwzhihucomquestioncss http://7xrmpf.com1.z0.glb.clouddn.com/www.zhihu.com_question.css
            var wwwzhihucomcss = '@media only screen and (-webkit-min-device-pixel-ratio: 2), not all{.icon,i[class^=z-icon-],.modal-dialog-title-close,.goog-option-selected .goog-menuitem-checkbox,.zg-content-img-icon,.zg-content-video-icon,.tr-icon,.tr-inline-icon,.zg-icon,.icon-external,.feed-item .ignore,.side-topic-item .up,.side-topic-item .delete,.zu-edit-button-icon,.zg-blue-edit,.zm-add-question-detail-icon,.zh-hovercard-arrow,.zu-top-live-icon,.zm-profile-details-items .zm-profile-tag-btn,.zm-item-top-btn,.zm-profile-icon,.zm-profile-header-icon,.zm-profile-empty-icon,.zu-global-notify-icon,.zu-global-notify-close,.zm-modal-dialog-guide-title-msg,.zm-modal-dialog-guide-title-dropdown,.zm-noti7-popup-tab-item .icon,.zu-noti7-popup .zu-top-live-icon,.icon-info,.icon-green-check,.icon-big-arrow-left,.icon-big-arrow-right,.icon-weibo,.icon-qzone,.icon-weibo-corner,.icon-big-white-sina,.icon-big-white-qq,.icon-big-white-mail,.icon-sign-arrow{background-image:url(http://frizen.qiniudn.com/sprites-1.1.2@2x.png);background-size:308px 250px}}@media screen and (-webkit-min-device-pixel-ratio: 2), not all{.z-ico-wechat-right-panel, .z-ico-show-password, .z-ico-hide-password, .z-ico-weibo, .z-ico-wechat-unlogin-page, .z-ico-weibo-share, .z-ico-wechat-share, .z-ico-green-check, .z-ico-gray-check, .z-ico-daily-share, .z-ico-qq, .z-ico-wechat, .z-ico-textedit, .z-ico-shameimaru-close, .z-ico-left, .z-ico-close, .z-ico-community:hover, .z-ico-community {background-image: url(http://www.zhihu.com/static/img/compiled/icons@2x_4ecd3000b1.png);background-size:109px 76px}}@media only screen and (-webkit-min-device-pixel-ratio: 2), not all{.zg-icon-rare{background-image:url(http://www.zhihu.com/static/img/sprites-rare-0.1.png);background-size:256px 30px}}@media screen and (-webkit-min-device-pixel-ratio: 2), not all{.z-ico-play-video, .z-ico-wechat-right-panel, .z-ico-show-password, .z-ico-hide-password, .z-ico-weibo, .z-ico-wechat-unlogin-page, .z-ico-weibo-share, .z-ico-wechat-share, .z-ico-green-check, .z-ico-gray-check, .z-ico-daily-share, .z-ico-qq, .z-ico-wechat, .z-ico-textedit, .z-ico-shameimaru-close, .z-ico-left, .z-ico-close, .z-ico-community:hover, .z-ico-community, .z-ico-video, .z-ico-extern-gray, .z-ico-extern-blue {background-image: url(http://www.zhihu.com/static/revved/img/compiled/icons@2x_e9908158f6.7089d725.png);background-size:108px 93px}}html body,html input,html textarea,html select,html button{font-family:".SFNSText-Regular", "Helvetica Neue", Helvetica, Arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;letter-spacing:.02em;text-rendering:optimizeLegibility}a{color:#259;text-decoration:none!important;-webkit-transition:all .2s ease-in-out;-moz-transition:all .2s ease-in-out;-ms-transition:all .2s ease-in-out;-o-transition:all .2s ease-in-out;transition:all .2s ease-in-out}i,em{font-style:normal!important}strong,b{font-weight:600;letter-spacing:.02em;font-family:".SFNSDisplay-Regular", "Helvetica Neue", Helvetica, Arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif}h1,h2,h3,h4,h5{font-weight:600;letter-spacing:.02em;font-family:".SFNSDisplay-Regular", "Helvetica Neue", Helvetica, Arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif}.zg-wrap{width:1200px}.zu-main-sidebar{margin:0 0 0 -310px;width:310px}h1,h2,h3,h4,h5{font-size:15px}body,input,textarea,select,button{font-size:15px;line-height:1.9;color:#444}@media (max-width: 1400px) and (min-width: 968px){.zg-wrap{width:960px!important}.zu-main-sidebar{margin:0 0 0 -270px!important;width:270px!important}body,input,textarea,select,button{font-size:13px!important}h1,h2,h3,h4,h5{font-size:14px!important}}.feed-item .content h2{font-size:16px}.feed-item .entry-body,.feed-item .zm-item-answer{margin-top:5px}.feed-main{margin:-5px 0 2px 48px}.feed-item .author-info,.feed-item .author-info a{font-size:14px}.feed-item .zm-item-answer-author-info{font-size:14px;font-weight:bold}.zm-item-rich-text.js-collapse-body,.zm-item-answer-author-info,.zh-summary.summary.clearfix{line-height:1.9}#zh-question-title>.zm-item-title{font-size:22px}.zm-item-vote-info .text{font-size:14px}.zm-item-vote-info{margin:5px 0}.zm-meta-panel{padding:3px 0;font-size:14px}.feed-item{padding:21px 0 18px 0}.zh-summary{padding-top:3px}@media (max-width: 1400px) and (min-width: 968px){html body,html input,html textarea,html select,html button{font-size:13px!important;line-height:1.9em!important}.feed-main{margin-top:-3px}.feed-main{margin-bottom:2px}.feed-item .content h2{font-size:14px!important}.feed-item .author-info,.feed-item .author-info a{font-size:13px!important}.feed-item .zm-item-vote-info,.feed-item .zm-item-answer-author-info{font-size:13px!important}.zm-item-rich-text.js-collapse-body,.zm-item-answer-author-info,.zh-summary.summary.clearfix{font-size:13px!important;line-height:1.9!important}.feed-item .entry-body,.feed-item .zm-item-answer{margin-top:2px!important}#zh-question-title>.zm-item-title{font-size:18px!important}.zm-item-vote-info .text{font-size:12px!important}.zm-item-vote-info{margin:7px 0!important}.zm-meta-panel{padding:3px 0!important;font-size:13px!important}.feed-item{padding:18px 0 13px 0}.zh-summary{padding-top:0}}address,blockquote,sup{line-height:1.8em}@media (max-width: 1400px) and (min-width: 968px){address,blockquote,sup{line-height:1.9em!important}}.feed-source,.feed-source a{font-size:14px}@media (max-width: 1400px) and (min-width: 968px){.feed-source,.feed-source a{font-size:13px!important}}.zu-main-content-inner{position:relative;margin:0 388px 0 0!important}@media (max-width: 1400px) and (min-width: 968px){.zu-main-content-inner{position:relative;margin:0 328px 0 0!important}}.zm-side-nav-link{height:34px}@media (max-width: 1400px) and (min-width: 968px){.zm-side-nav-link{height:31px!important}}.zm-item-answer-author-wrap{font-size:14px}@media (max-width: 1400px) and (min-width: 968px){.zm-item-answer-author-wrap{font-size:13px!important}}.zu-top-search{margin:7px 0 0 34px}@media (max-width: 1400px) and (min-width: 968px){.zu-top-search{margin:7px 0 0 12px!important}}.zu-top-search-form{width:400px}@media (max-width: 1400px) and (min-width: 968px){.zu-top-search-form{width:367px!important}}.zu-top-nav-ul{margin:0 0 0 40px}@media (max-width: 1400px) and (min-width: 968px){.zu-top-nav-ul{margin:0 0 0 18px!important}}.zu-top-nav-link{width:60px;height:46px;font-size:15px}@media (max-width: 1400px) and (min-width: 968px){.zu-top-nav-link{width:54px!important;font-size:14px!important}}.zu-noti7-popup.zu-top-nav-live{left:136px;top:50px;font-size:13px}.zu-top-nav-count{left:45px}@media (max-width: 1400px) and (min-width: 968px){.zu-noti7-popup.zu-top-nav-live{left:51px!important}.zu-top-nav-count{left:31px!important}}.feed-item .time{font-size:13px;margin-top:-6px}.editable{font-size:14px}@media (max-width: 1400px) and (min-width: 968px){.editable{font-size:13px!important}}@media (max-width: 1400px) and (min-width: 968px){.feed-item .time{font-size:13px!important;margin-top:-4px!important}}.comment-app-holder,.zm-comment-box{max-width:764px}@media (max-width: 1400px) and (min-width: 968px){.comment-app-holder,.zm-comment-box{max-width:540px!important}}.feed-item .author-info,.feed-item .author-info a{margin-bottom:5px!important;color:#444!important}@media (max-width: 1400px) and (min-width: 968px){.feed-item .author-info,.feed-item .author-info a{margin-bottom:6px}}.feed-item .zm-item-vote-info,.feed-item .zm-item-answer-author-info{margin:2px 0 5px 0}@media (max-width: 1400px) and (min-width: 968px){.feed-item .zm-item-vote-info,.feed-item .zm-item-answer-author-info{margin:2px 0 6px 0!important}}.zu-top-add-question{margin:7px 10px 0 0}@media (max-width: 1400px) and (min-width: 968px){.zu-top-add-question{margin:7px 0 0 0!important}}.zh-backtotop{margin-left:300px}@media (max-width: 1400px) and (min-width: 968px){.zh-backtotop{margin-left:230px!important}}.feed-item .source{font-size:13px}@media (max-width: 1400px) and (min-width: 968px){.zm-side-my-columns .column-link{padding-bottom:4px!important}}.zm-side-my-columns .column-link{line-height:32px;padding-bottom:2px}.profile-navbar .item{padding:12px 30px;font-size:15px;line-height:30px}@media (max-width: 1400px) and (min-width: 968px){.profile-navbar .item{padding:12px 20px!important;font-size:14px;line-height:22px}}#zu-distraction-free-editor .title,#zu-distraction-free-editor .wrapper,#zu-distraction-free-editor .toolbar,#zu-distraction-free-editor .content{width:1200px}#zu-distraction-free-editor .goog-scrollfloater{width:1200px}@media (max-width: 1400px) and (min-width: 968px){#zu-distraction-free-editor .title,#zu-distraction-free-editor .wrapper,#zu-distraction-free-editor .toolbar,#zu-distraction-free-editor .content{width:800px!important}}@media (max-width: 1400px) and (min-width: 968px){#zu-distraction-free-editor .goog-scrollfloater{width:800px!important}}.zh-profile-card{width:400px}.zh-profile-card .upper span.name{font-size:16px}.zh-profile-card .upper div.tagline{font-size:14px}@media (max-width: 1400px) and (min-width: 968px){.zh-profile-card{width:380px!important}.zh-profile-card .upper span.name{font-size:13px!important}.zh-profile-card .upper div.tagline{font-size:13px!important}}.zu-top-nav-li{padding:0 6px}@media (max-width: 1400px) and (min-width: 968px){.zu-top-nav-li{padding:0!important}}.zm-profile-section-main.zm-profile-section-activity-main .question_link,.zm-profile-section-main.zm-profile-section-activity-main .post-link,h2.zm-profile-question{font-size:15px}.skilled-topics .item .content .content-inner a,.skilled-topics .item .content .content-inner p,.zg-gray{font-size:14px}.zm-profile-vote-count{height:42px}.zm-profile-vote-num{padding:4px 0 4px}.HomeEntry-box{margin-left:0;border:0 solid #f0f0f0;background:#f9f9f9}@media (max-width: 1400px) and (min-width: 968px){.zm-profile-section-main.zm-profile-section-activity-main .question_link,.zm-profile-section-main.zm-profile-section-activity-main .post-link,h2.zm-profile-question{font-size:14px!important}.skilled-topics .item .content .content-inner a,.skilled-topics .item .content .content-inner p,.zg-gray{font-size:13px!important}.zm-profile-vote-count{height:38px!important}.zm-profile-vote-num{padding:2px 0 4px!important}}.zm-editable-editor-field-wrap{padding:10px 24px}@media (max-width: 1400px) and (min-width: 968px){.zm-editable-editor-field-wrap{padding:8px 10px!important}}.zm-item-rich-text li,.zm-editable-content li,.editable li{margin:8px 5px 5px 30px}@media (max-width: 1400px) and (min-width: 968px){.zm-item-rich-text li,.zm-editable-content li,.editable li{margin:8px 5px 5px 30px!important}}blockquote{padding:0 0 0 16px}.Avatar--l{width:150px;height:150px;border:none;border-radius:10px;position:absolute}.zm-profile-header-main .top .bio{font-size:15px}@media (max-width: 1400px) and (min-width: 968px){.Avatar--l{width:136px!important;height:136px!important}.ProfileAvatarEditor{width:136px!important;height:136px!important}.zm-profile-header-info{margin-left:120px!important;padding-top:0}.zm-profile-header-description.editable-group{margin:10px -18px 0 -122px!important}.zm-profile-header .items{margin-left:40px!important}.title-section.ellipsis{margin-left:46px!important}.zm-profile-header-main .top .bio{font-size:13px}.zm-profile-side-columns .link,.zm-profile-side-topics .link,.zm-profile-side-columns .Avatar,.zm-profile-side-topics .Avatar{height:34px!important;width:34px!important}}.zm-profile-header-main{padding:12px 18px 0 18px}.zm-profile-header-description.editable-group{border-top:none;margin:18px -18px 0 -132px;color:#444}.zm-profile-header-description{padding:0 0 6px 0}.zm-profile-header .zm-profile-header-user-describe .item+.item{margin-top:5px}.zm-profile-header-marked{padding:6px 18px 14px 18px;border-top:none}.ProfileAvatarEditor{width:150px;height:150px;box-shadow:none;border-radius:10px}.zm-profile-header .items{margin-left:50px;min-height:78px;color:#444}.title-section.ellipsis{margin-left:65px;max-width:380px;color:#666;font-family:".SFNSDisplay-Regular", "Helvetica Neue", Helvetica, Arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif}.zm-profile-header-info{margin-left:132px;padding-top:5px}.zg-link-litblue{font-size:inherit}#zh-fav-list-side-related .zm-item-title{font-size:inherit}.HomeEntry-boxArrow{display:none}.HomeEntry-avatar{display:none}.feed-item{padding:18px 0 13px 0}#zh-home-list-title{color:#999}.zm-noti-cleaner-setting{opacity:0;position:relative;top:2px;transition:none}.zg-section:hover .zm-noti-cleaner-setting{opacity:1}.zu-main-feed-con{border-top:1px solid #ddd;border-bottom:1px solid #ddd}a.zu-main-feed-fresh-button{border:1px solid #f9f9f9;background-color:#f9f9f9;text-shadow:none;transition:all .2s ease-in-out;color:#999}.zm-editable-content .answer-date-link-wrap{margin-top:5px}a.zu-main-feed-fresh-button:hover,a.zu-main-feed-fresh-button:active{background:#E4EAFF;border:1px solid #E4EAFF;color:#698ebf}.zg-btn-white.zu-button-more:hover{background-color:#E4EAFF;color:#698ebf!important}.zg-btn-white.zu-button-more{background-color:#F9F9F9;transition:all .2s ease-in-out}.zg-btn-white.zu-button-more:active{background:#daedf5}._CommentBox_root_G_1m._CommentBox_bordered_3Fo-{box-shadow:none;border:none;border-top:1px solid #ddd;border-radius:0}.zm-comment-box{box-shadow:none;border:none;border-top:1px solid #ddd;border-radius:0}.zm-item-comment+.zm-item-comment{border-top:dotted 1px #ddd}.zm-item-comment .zm-comment-hd,.zm-item-comment .zm-comment-ft{margin:4px 0 4px 0}.zm-item-comment{border-bottom:dotted 1px #ddd}.zm-item-comment+.zm-item-comment{border-bottom:dotted 1px #ddd;border-top:solid 0 #eee}._CommentForm_bordered_2isg{background:none;border-radius:0;border-top:0 dotted #ddd;border-bottom:1px solid #ddd}._CommentBox_pagerBorder_yuO1{border-top:1px solid #eee;margin:0 1em 0 1em;border-bottom:1px solid #eee}.zm-comment-box.empty.cannot-comment .zm-comment-box-ft,.zm-comment-box .zm-comment-box-ft{background:none;border-radius:0;border-top:0 dotted #ddd;border-bottom:1px solid #ddd}._InputBox_root_1Xwi{border:1px solid #ddF;border-radius:3px;box-shadow:none;color:#333;line-height:1.8;background-color:#F9F9FF;transition:all .2s ease-in-out}._InputBox_root_1Xwi:focus{border:1px solid #ddF;background-color:#FCFCFF}.zm-comment-form .zm-comment-textarea,.zm-comment-form .zm-comment-editable{border:1px solid #ddF;border-radius:3px;box-shadow:none;background-color:#F9F9FF;transition:all .2s ease-in-out}.zm-comment-form .zm-comment-textarea,.zm-comment-form .zm-comment-editable:focus{border:1px solid #ddF;background-color:#FCFCFF}.modal-dialog-buttons button[name=cancel]{color:#999;background:transparent;cursor:none}html.no-touch .modal-dialog-buttons button[name=cancel]:hover{text-decoration:none}.goog-buttonset-default{background-color:#2c93ee;background-image:none;text-shadow:none;border:0;color:#fff!important;box-shadow:none;border-radius:3px}.goog-buttonset-default:hover{background:#35A0FF;background-color:#35A0FF;background-image:none;box-shadow:none}.goog-buttonset-default:active{background:#35A0FF;background-color:#35A0FF;background-image:none;box-shadow:none}.zg-btn-blue{background-color:#2c93ee;background-image:none;text-shadow:none;border:0;color:#fff!important;box-shadow:none;border-radius:3px}.zg-btn-blue:hover{background:#35A0FF;background-color:#35A0FF;background-image:none;box-shadow:none}.zg-btn-blue:active{background:#35A0FF;background-color:#35A0FF;background-image:none;box-shadow:none}.zm-command-cancel{font-size:13px;margin:0;border:0 solid #6EBBFF;padding:8px 11px 6px 11px;border-radius:3px 0 0 3px;line-height:1.7;color:#999}.zm-command-cancel:hover{text-decoration:none}.feed-item .ignore:hover{background-position:-261px -62px}.zm-comment-box .load-more{border:0;border-bottom:1px dotted #ddd;color:#999;box-shadow:none;text-shadow:none;margin:0 12px}.zm-comment-box .load-more{border:0;border-bottom:1px dotted #ddd;color:#999;box-shadow:none;text-shadow:none;margin:0 12px}html.no-touch .zm-comment-box .load-more:hover{background:#fcfcfc;text-decoration:none}.feed-item .time{opacity:0;margin-top:-2px;transition:.1s}.feed-item:hover .time{opacity:1}.feed-item .avatar img{opacity:.5;border-radius:3px;transition:.1s}.feed-item:hover .avatar img{opacity:1}.zm-item-vote-count{opacity:.65;line-height:inherit}.feed-item:hover .zm-item-vote-count{opacity:1;transition:.1s}.feed-item .ignore{visibility:visible!important;opacity:0;right:-4px}.feed-item:hover .ignore{opacity:1}.zu-autohide{transition:.1s}.feed-item.combine.first-combine .content,.feed-item.combine.first-combine .entry-body{margin-top:0}.zh-summary .inline-img{display:none}.zh-summary{min-height:26px}.video-box.thumbonly{display:none}.video-box-thumbnail{display:none}.video-box-thumbnail .thumbnail{display:none}a.toggle-expand{transition:.1s}.zm-noti7-frame-border.top::after{box-shadow:none}.zm-noti7-frame-border.bottom::after{box-shadow:none}.zm-comment-box .load-more+.zm-item-comment{border-top:0 solid #eee}.toggle-expand.btn-toggle-question-detail{left:0}.feed-item .roundtable .left img,.feed-item .column .left img{display:none}.feed-item .roundtable .content,.feed-item .column .content{padding:0 0 10px;color:#333}.feed-item .roundtable .info,.feed-item .column .info{padding:10px 0 0}.feed-item .avatar{margin:3px 0 0}.source .zg-bull{display:none;font-size:14px}.feed-item:hover .source .zg-bull{display:inline!important}.zm-meta-panel>a,.zm-meta-panel>span{color:#999}.zg-bull{margin-bottom:-1px}html.no-touch .meta-item:hover .goog-menu-button-caption{text-decoration:none!important}img.avatar.avatar-xs{max-width:none}.zm-item-rich-text li,.zm-editable-content li,.editable li{list-style-position:inherit}#zu-distraction-free-editor .editable{font:16px/2 "Helvetica Neue", Arial, "Liberation Sans", FreeSans, "Hiragino Sans GB", sans-serif!important}span.bio{font-weight:normal}.SidebarListNav-hint{display:none}.zm-side-nav-link{margin-bottom:3px;display:block;line-height:31px;color:#666;border-radius:3px;background-color:transparent}.zm-side-nav-link.active,html.no-touchevents .zm-side-nav-link:hover{color:#259;border-left:3px solid #ddf;margin-left:10px;background-color:#E4EAFF;border-radius:3px;text-decoration:none}.SidebarListNav-itemLink{margin-bottom:3px;display:block;color:#666;border-radius:3px;background-color:transparent}.SidebarListNav-itemLink:active,html.no-touchevents .SidebarListNav-listItem .follow-link:hover+.SidebarListNav-itemLink,html.no-touchevents .SidebarListNav-itemLink:hover{color:#259;border-left:3px solid #ddf;margin-left:10px;background-color:#E4EAFF;border-radius:3px;text-decoration:none}.SidebarListNav-sideLink{opacity:0}.SidebarListNav:hover .SidebarListNav-sideLink{opacity:1}.zu-main-sidebar h3,.zm-side-section h3,.zu-main-sidebar h2,.zm-side-section h2{color:#999}.zm-side-section:hover a.zg-link-litblue{visibility:visible}a.zg-link-litblue.zg-right{visibility:hidden}.zm-side-section+.zm-side-section>.zm-side-section-inner{padding:0;border-top:0 solid #eee}.zm-side-nav-group+.zm-side-nav-group{border-top:1px solid #ddd;padding-top:15px}.zm-side-nav-group{margin-bottom:15px}.zm-side-list-content{border-top:1px solid #ddd}a.shameimaru-link{opacity:.6}a.shameimaru-link:hover{opacity:1}.zu-top{position:fixed;background:#137ad5;background-color:#137ad5;background-image:none;border-bottom:none;box-shadow:none;height:46px}.zu-top-search-form .zu-top-search-button{width:40px;height:31px;background:#2C93EE;background-color:#2C93EE;background-image:none;border:1px solid #2C93EE;box-shadow:none;border-top-right-radius:3px;border-bottom-right-radius:3px;transition:all .1s}.zu-top-search-button:hover{background-color:#35A0FF;border:1px solid #35A0FF}.hide-text{display:none}.zu-top-search-input{height:31px;padding:0 50px 0 10px;border:none;box-shadow:none;background-color:#F1F1FF;line-height:17px!important;color:#999;border-radius:3px 4px 4px 3px;font-size:13px}.zu-top-search-input:focus{background-color:#FFF;box-shadow:none;border:none}.zu-top-add-question{background-color:#2c93ee;background-image:none;border:none;height:31px;box-shadow:none;text-shadow:none;border-radius:3px;display:none}.zu-top-add-question:hover{background-color:#35A0FF;border:none;box-shadow:none}.zu-top-add-question:active{background-color:#35A0FF;background:#35A0FF;border:0 solid #0659ac;box-shadow:none}.ac-renderer{left:0;-moz-box-shadow:0 0 2px rgba(0, 0, 0, .3);box-shadow:0 0 2px rgba(0, 0, 0, .3)}.zu-top-link-logo{background-position:0 8px}.top-nav-dropdown{display:block;top:-175px!important;transition:all .2s;z-index:-1}.open .top-nav-dropdown,html.no-touchevents .top-nav-profile:hover .top-nav-dropdown{top:46px!important}.zu-top-nav-userinfo.selected,html.no-touchevents .top-nav-profile:hover .zu-top-nav-userinfo{height:46px!important;background-image:-webkit-linear-gradient(top, #137AD5, #1069bd)!important;background-image:-moz-linear-gradient(top, #137AD5, #1069bd)!important;box-shadow:none}html.no-touchevents .top-nav-dropdown a:hover{background-color:#1376DA}.top-nav-dropdown .zg-icon{margin:0 8px 0 20px}.zu-top-nav-link:hover{color:#FFF!important}.zu-top-nav-link,.zu-top-nav-link:visited,.zu-top-nav-link:active{color:#ddd}.zu-top-nav-li.current{background-image:-webkit-linear-gradient(top, #137AD5, #1069bd);background-image:-moz-linear-gradient(top, #137AD5, #1069bd);box-shadow:none}.zu-top-nav-userinfo .zu-top-nav-pm-count{left:34px}.top-nav-profile:hover .zu-top-nav-userinfo{background-image:-webkit-linear-gradient(top, #137AD5, #1069bd)!important;background-image:-moz-linear-gradient(top, #137AD5, #1069bd)!important}.zu-top-nav-userinfo.selected,html.no-touch .top-nav-profile:hover .zu-top-nav-userinfo{height:46px!important;background-image:-webkit-linear-gradient(top, #137AD5, #1069bd)!important;background-image:-moz-linear-gradient(top, #137AD5, #1069bd)!important;box-shadow:none}.zg-noti-number{background:#CA3939;border:1px solid #fff;box-shadow:none;font-weight:400}.top-nav-dropdown li a{border-top:none;box-shadow:none;height:44px;line-height:44px}.top-nav-profile{min-width:130px}.top-nav-profile a{background-color:#1069bd;width:130px;text-shadow:none}.top-nav-profile .top-nav-dropdown a{width:130px;transition:all .1s ease-in-out}.zu-top-nav-userinfo .avatar{left:18px;border:none;box-shadow:none;border-radius:2px;background-size:25px 25px;position:absolute;z-index:3}.top-nav-profile .zu-top-nav-userinfo{text-indent:52px;transition:none;background:#137AD5}.zu-top-nav-userinfo .Avatar{left:15px}html.no-touch .top-nav-dropdown a:hover{width:130px;background-color:#1b78d0;background-image:none;transition:all .1s}html.no-touch .zg-follow:hover{color:#698ebf}.zm-profile-header{border:none;box-shadow:none;border-radius:0;color:#999}.zm-profile-side-columns .link,.zm-profile-side-topics .link,.zm-profile-side-columns .Avatar,.zm-profile-side-topics .Avatar{position:inherit}.zm-profile-header-avatar-container .zm-entry-head-avatar-edit-button{background:rgba(0, 0, 0, .4)}.zm-entry-head-avatar-edit-button{width:118px;border-radius:0 0 7px 7px}.zm-profile-header .zm-profile-header-user-describe .item .topic-link{color:#444}.zm-profile-header-avatar-container{float:left;top:-34px;box-shadow:none;border-radius:0;width:118px;height:118px}.zm-profile-header .zm-profile-header-user-detail{display:none}h3.ellipsis{left:0}i.icon.icon-profile-location{margin-left:1px;margin-right:5px!important}i.icon.icon-profile-education{margin-bottom:3px}.zm-profile-header-main .name{font-family:".SFNSDisplay-Regular", "Helvetica Neue", Helvetica, Arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;font-weight:600;color:#444}.zm-profile-header-operation{padding:0 18px;margin:0 0 16px 0;border-top:none}#zh-question-side-header-wrap .follow-button{min-width:78px}.zg-btn-green,.zg-btn-follow{background-color:#E4EAFF;background-image:none;text-shadow:none;border:none;color:#698ebf!important;box-shadow:none}.zg-btn-green:active{background:#E4EAFF;color:#698ebf;background-color:#E4EAFF;background-image:none;box-shadow:none}.zg-btn-unfollow,.zg-btn-disabled{background:#eee;color:#999;border:0 solid #ddd}.zg-btn-follow:active{background:#E4EAFF;background-color:#E4EAFF;color:#698ebf!important;background-image:none;box-shadow:none}.zg-btn-white{background:#eee;background-color:#eee;background-image:none;text-shadow:none;border:none;box-shadow:none;color:#999!important}.profile-navbar{background-color:#fff;border-top:1px solid #ddd;border-bottom:1px solid #ddd;box-shadow:none;margin-top:20px;border-radius:0}.profile-navbar .item{color:#666;position:relative;top:1px}.profile-navbar .item.home{border-right:none}.profile-navbar .item.active{color:#666;border:none;border-width:0 1px;background-color:#fff;box-shadow:none;border-radius:0;border-bottom:3px solid #666}.profile-navbar .item.home.active{border-color:#ddd;border-width:1px}.profile-navbar .item .num{margin-left:4px}.zm-profile-side-following .item{padding:2px 55px 8px 0}.zm-profile-header-user-weibo .zm-profile-header-icon.sina{background-position:-193px -108px;width:18px}.zm-profile-header-icon{vertical-align:-5px;height:18px;margin-right:2px}.profile-navbar .item.home{border-right:0}.zm-profile-section-list{padding:4px 14px}.zm-item+.zm-item{padding-top:12px}.zm-profile-header-user-agree .zm-profile-header-icon{background-position:-123px -146px}.zm-profile-header-operation strong{letter-spacing:.02em;font-weight:600;color:#666;font-family:".SFNSDisplay-Regular", "Helvetica Neue", Helvetica, Arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif}.zm-profile-side-following .item strong{font-weight:600;letter-spacing:.02em;font-family:".SFNSDisplay-Regular", "Helvetica Neue", Helvetica, Arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif}.vote-thanks-relation p+p{margin-top:2px}.skilled-topics .item .avatar,.expert-item-moving .avatar{position:relative;top:4px}.zm-profile-section-more-btn{visibility:hidden}.zm-profile-section-wrap{border:none;border-radius:0;box-shadow:none;border-bottom:1px solid #ddd}.skilled-topics .item,.expert-item-moving{border-right:none;margin-left:-1px}.zm-profile-section-head{border-bottom:1px solid #DDD}.zm-profile-section-name{color:#666;font-size:14px}.zg-gray-darker{color:#666}.skilled-topics .item .content .content-inner h3,.expert-item-moving .content .content-inner h3,.skilled-topics .item .content .content-inner a,.expert-item-moving .content .content-inner a,.skilled-topics .item .content .content-inner p,.expert-item-moving .content .content-inner p{line-height:1.8}.skilled-topics .item .content .meta,.expert-item-moving .content .meta{color:#999;font-weight:400}.profile-navbar .item .num{color:#999;font-weight:400}i.zm-profile-header-icon.sina{vertical-align:-3px}.zm-profile-vote-count{margin:3px 0 0 0;color:#259}.zm-votebar .up,.zm-votebar .down{margin:5px 0 0 0}.zm-profile-section-main.zm-profile-section-activity-main .question_link,.zm-profile-section-main.zm-profile-section-activity-main .post-link{font-weight:600;line-height:1.8em;margin-bottom:5px}.zu-noti7-popup .zu-top-nav-live-inner{box-shadow:0 0 3px rgba(0, 0, 0, .3)}.zm-profile-side-following{border-bottom:1px solid #ddd;margin:10px 0 15px 0}.vote-thanks-relation .zg-icon.vote{display:none}.vote-thanks-relation .zg-icon.be-voted{display:none}.zm-profile-side-section+.zm-profile-side-section{border-top:1px solid #ddd}.zu-main-sidebar .zh-footer .zg-wrap{border-top-color:#ddd;letter-spacing:0;width:auto!important}.zm-profile-side-following .item+.item{border-left:0 solid #ddd;padding-left:10px}i.icon.icon-profile-female{margin-top:-3px}i.icon.icon-profile-male{margin-top:-2px}.popover .popover-content{border-radius:4px}#zh-tooltip.goog-hovercard.popover{margin-top:-1px}.zh-profile-card .lower .meta .item{margin-left:6px;padding:0 12px;border-right:0 solid #eee}.zh-profile-card .lower .meta .item .value{font-size:15px;font-weight:600;color:#600;letter-spacing:.02em;font-family:".SFNSDisplay-Regular", "Helvetica Neue", Helvetica, Arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif}.zh-profile-card .lower .meta .item .key{font-size:13px;color:#999}.zh-profile-card .lower{background:#FAFAFF}.zu-noti7-popup.zu-top-nav-live{border:none}.popover.bottom .arrow{display:none}.popover.bottom .arrow2{top:0;display:none}.popover.top .arrow{display:none}.popover.top .arrow2{bottom:0;border-top:13px solid #fcfcfc;display:none}.popover .popover-content{border:none;box-shadow:0 0 2px rgba(0, 0, 0, .3)}.zm-noti7-popup-tab-item+.zm-noti7-popup-tab-item{border-left:0 solid #ddd}.zu-noti7-popup .zm-noti7-content-item{border-bottom:1px dotted #ddd}.zm-noti7-content-body .zm-noti7-content-item.unread{border-bottom:1px dotted #ddd}.zu-noti7-popup .zm-noti7-content-item::after{background:none}.zm-noti7-frame-border{background:#ddd}.modal-dialog-title{background-color:#1575d5;background-image:none;padding:10px 15px;border-radius:6px 6px 0 0;border:0 solid #0D6EB8;box-shadow:none;margin:0}.modal-dialog-title-text{font-size:14px;font-weight:600;color:#fff;text-shadow:none}.modal-dialog{border:0 solid #888;box-shadow:0 0 4px 0 rgba(0, 0, 0, .4)}.zg-form-text-input{box-shadow:none;border-radius:3px;border:1px solid #ddd;color:#999}textarea.zg-form-text-input,.zg-form-text-input>textarea{color:#444}.zm-editable-editor-field-wrap{border:1px solid #ddd;box-shadow:none}.zm-add-question-form-topic-wrap .zm-tag-editor-editor{box-shadow:none;border:1px solid #ddd!important;padding:8px 8px 3px;position:relative}.zh-add-question-form .zm-add-question-form-sns-wrap .goog-checkbox.goog-checkbox-checked{box-shadow:none}.zm-item-tag,.zm-tag-editor-edit-item{background:#E4EAFF;color:#698ebf;transition:all .1s}html.no-touch .zm-item-tag:hover,html.no-touch .zm-item-tag-x:hover{background:#698ebf;color:#fff;text-decoration:none}.zg-icon-dropdown-menu{width:30px}.zu-edit-button{transition:all .1s}.question-invite-panel{margin:15px 0 35px;color:#444;border:0 solid #ddd;border-bottom:1px solid #ddd;border-top:1px solid #ddd;box-shadow:none;border-radius:0}.question-invite-panel .search-input{color:#666;background:#F9F9FF;border:1px solid #ddF}.zg-form-text-input:focus{box-shadow:none;border:1px solid #E2E0FF;position:relative;background:#FCFCFF}.goog-toolbar{border-top:1px solid #ddd;border-left:1px solid #ddd;border-right:1px solid #ddd;box-shadow:none;background-color:#f3f3f3;background-image:none}.goog-toolbar-button,.goog-toolbar-menu-button:hover{box-shadow:none}.zu-global-notify{top:0;box-shadow:none}.zm-item-answer-author-wrap{margin:1px 0 0 0}.zm-item-vote-info{margin:7px 0}.zh-answer-form{margin-bottom:15px;margin-top:15px}.goog-menu{background:#fff;color:#666;border:solid 1px #eee;box-shadow:none}.zm-tag-editor-remove-button{transition:none}.side-topic-content.ellipsis{left:0}.pin-topic-avatar-link{position:relative;top:5px}.side-topic-item{padding:13px}.zm-topic-cat-sub p{height:3.4em}';
                //GM_getResourceText('wwwzhihucomcss');
            var zhuanlanzhihucomcss = 'html body,html input,html textarea,html select,html button{font-family:".SFNSText-Regular", "Helvetica Neue", Helvetica, Arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;letter-spacing:.02em;text-rendering:optimizeLegibility}body,input,textarea,select,button{font-size:16px;line-height:1.9;color:#444}a{color:#259;text-decoration:none!important;-webkit-transition:all .2s ease-in-out;-moz-transition:all .2s ease-in-out;-ms-transition:all .2s ease-in-out;-o-transition:all .2s ease-in-out;transition:all .2s ease-in-out}i,em{font-style:normal!important}strong,b{font-weight:600;letter-spacing:.02em;font-family:".SFNSDisplay-Regular", "Helvetica Neue", Helvetica, Arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif}h1,h2,h3,h4,h5{font-weight:600;letter-spacing:.02em;font-family:".SFNSDisplay-Regular", "Helvetica Neue", Helvetica, Arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif}.entry-content{line-height:2}.review-comment-panel.fold{height:60px}.pop-panel-title{padding:10px 0 0 18px}.home .card-item,.home .column-card-item,.home .post-card-item{height:279px}.review-comment-panel .toggle,.review-comment-panel .close{top:11px}body,input,textarea,select,button{font-size:18px;line-height:2;color:#444}.receptacle{width:1080px}.post-write .title{font-size:32px!important}.post-write .toolbar-holder{width:1080px}.post-write .entry-content{min-width:1080px;margin-left:-540px}.navbar-title-container{width:1080px;margin-left:-540px}.post-view .entry-title{font-size:40px;line-height:60px}@media (max-width: 1400px) and (min-width: 968px){.receptacle{width:660px!important}.post-write .toolbar-holder{width:660px!important}.post-write .entry-content{min-width:660px!important;margin-left:-330px!important}.navbar-title-container{width:660px!important;margin-left:-330px!important}body,input,textarea,select,button{font-size:15px!important}.post-view .entry-title{font-size:32px!important;line-height:45px!important}}';
                //GM_getResourceText('zhuanlanzhihucomcss');
            var wwwzhihucomquestioncss = '.zm-meta-panel{padding:7px 0 13px 0}@media (max-width: 1400px) and (min-width: 968px){.zm-meta-panel{padding:3px 0!important}}';
                //GM_getResourceText('wwwzhihucomquestioncss');

            if(window.location.hostname === 'www.zhihu.com'){
                gmUtils.addStyle(wwwzhihucomcss);
            }
            if(window.location.hostname === 'zhuanlan.zhihu.com'){
                gmUtils.addStyle(zhuanlanzhihucomcss);
            }
            if(window.location.hostname === 'www.zhihu.com' && window.location.pathname.indexOf('/question') > -1){
                gmUtils.addStyle(wwwzhihucomquestioncss);
            }
        }

        if(vm.enabledDirectZhihuLink){
            $('a.external').each(function(i, dom){
                if(dom.nodeName.toUpperCase()==='A') {
                    var old = dom.href;
                    if(old && old.indexOf('//link.zhihu.com/?') >= 0) {
                        old = old.match(/target=(.+?)(&|$)/);
                        if(old && old.length >= 2) {
                            dom.href = decodeURIComponent(old[1]);
                        }
                    }
                    return;
                }
            });
        }

    }

    // View
    var currentGuid = newGuid();
    function viewInit(){
        // View模版
        var tpl = { css: '', html: '' };
        tpl.css = '#body{{guid}} {color:#333; margin: 0 auto; background: white; padding: 10px; height: 406px; overflow-y: auto; }'+
        '#mytools_top_buttons{{guid}} {background: none repeat scroll 0% 0% rgb(255, 255, 255); margin-left: 10px; display: block;  }'+
        '#body{{guid}} input {font-size: 12px; margin-right: 3px; vertical-align: middle; } '+
        '#body{{guid}} .form-row{{guid}} {overflow: hidden; padding: 1px 12px; margin-top: 3px; font-size: 11px; text-align: left; } '+
        '#body{{guid}} .form-row{{guid}} label {padding-right: 10px; font-weight: normal; } '+
        '#body{{guid}} .form-row{{guid}} input {vertical-align: middle; margin-top: 0px; } '+
        '#body{{guid}} .form-row{{guid}} input {padding: 2px 4px; border: 1px solid #e5e5e5; background: #fff; border-radius: 4px; color: #666; -webkit-transition: all linear .2s; transition: all linear .2s; } '+
        '#body{{guid}} input:focus {border-color: #99baca; outline: 0; background: #f5fbfe; color: #666; } ';

        tpl.html = [
'<div id="mytoolsWrapper{{guid}}" v-show="showMenu || showBox">',
'    <div id="toolMenu" v-if="showMenu" v-on:click="switchShowBox" style="position:fixed; top:100px; left:30px; z-index:999; padding:20px 5px; width:50px; height:20px; line-height:20px; text-align:center; border:1px solid; border-color:#888; border-radius:50%; background:rgba(0,0,0,.5); color:#FFF; font:12px/1.5 \'Microsoft YaHei\', sans-serif;cursor: pointer;-webkit-box-sizing: content-box; -moz-box-sizing:content-box; box-sizing:content-box;">工具集</div>',
'    <div id="uil_blocker{{guid}}" v-if="showBox" style="position:fixed;top:0px;left:0px;right:0px;bottom:0px;background-color:#000;opacity:0.5;z-index:9999;"></div>',
'    <div id="mytools_preferences{{guid}}" v-if="showBox" style="position:fixed;top:12%;left:30%;width: 500px;z-index:10000;">',
'        <div id="body{{guid}}">',
'            <form>',
'                <div id="mytools_top_buttons{{guid}}">',
'                    <input type="button" id="mytools_save_button{{guid}}" value="√ 确认" v-on:click="saveVmDataToConfig" title="部分选项需要刷新页面才能生效" />',
'                    <input type="button" id="mytools_close_button{{guid}}" value="X 取消" v-on:click="switchShowBox" title="关闭" />',
'                </div>',
'                <div class="form-row{{guid}}">',
'                    MyTools 配置项',
'                    <label><input type="checkbox" id="mytools_debug{{guid}}" v-model="enabledDebugModel" />调试模式</label>',
'                    <a href="http://blog.guqiankun.com/contact" target="_blank" style="color:#065488;">反馈地址</a>',
'                </div>',
'                <div class="form-row{{guid}}">',
'                    <label title="绕过Google重定向直接访问网页"><input type="checkbox" id="mytools_DirectGoogle{{guid}}" v-model="enabledDirectGoogle" />Direct Google</label>',
'                    <label title="百度音乐盒去广告"><input type="checkbox" id="mytools_BdMusicRemoveAd{{guid}}" v-model="enabledBdMusicRemoveAd" />百度音乐盒去广告</label>',
'                    <label title="增加豆瓣电影、图书的下载搜索链接"><input type="checkbox" id="mytools_DouBanDownload{{guid}}" v-model="enabledDouBanDownload" />Douban Download Search</label>',
'                </div>',
'                <div class="form-row{{guid}}">',
'                    <label title="网页右键解锁"><input type="checkbox" id="mytools_CopyPage{{guid}}" v-model="enabledCopyPage" />网页右键解锁</label>',
'                    <label title="购物党比价工具"><input type="checkbox" id="mytools_Gwd{{guid}}" v-model="enabledGwd" />购物党比价工具</label>',
'                    <label title="解决百度云大文件下载限制"><input type="checkbox" id="mytools_bdYunLargeFileDownload{{guid}}" v-model="enabledBdYunLargeFileDownload" />解决百度云大文件下载限制</label>',
'                </div>',
'                <div class="form-row{{guid}}">',
'                    <label title="知乎扁平化UI"><input type="checkbox" id="mytools_flatZhihu{{guid}}" v-model="enabledFlatZhihu" />知乎扁平化UI</label>',
'                    <label title="知乎真实链接地址重定向"><input type="checkbox" id="mytools_directZhihuLink{{guid}}" v-model="enabledDirectZhihuLink" />知乎真实链接地址重定向</label>',
'                </div>',
'                <div class="form-row{{guid}}">',
'                    <label>工具面板快捷键：</label>',
//'                    <select v-model="bindKeyCodeOne">',
'                    <select disabled="disabled">',
//'                        <option value="16">Shift</option>',
//'                        <option value="17">Ctrl</option>',
'                        <option value="18" selected="selected">Alt</option>',
'                    </select>',
'                    <span>+</span>',
'                    <input type="text" v-model="bindKeyCode1" style="width:24px" />',
'                    <label title="通过快捷键切换或在 Greasemonkey 用户脚本命令处打开设置窗口"><input type="checkbox" id="mytools_showMenu{{guid}}" v-model="showMenu" />显示菜单</label>',
'                </div>',
'            </form>',
'            <div id="conqr{{guid}}" style="position:relative; width:200px;">',
'                <img id="qr{{guid}}" src="" style="background: #fff;padding: 5px;" />',
'                <img id="fav{{guid}}" src="" style="display:none; opacity:.95; position:absolute; top:50%; left:50%; background:#fff; padding:3px; width:32px; height:32px; margin-left:-16px; margin-top:-16px; border-radius:5px;" />',
'            </div>',
'        </div>',
'    </div>',
'</div>'
].join('');

        // View模版的ViewModel
        var tplViewModel = {
            guid: currentGuid
        };
        // View模版的css生成
        var cssStyle = Mustache.render(tpl.css, tplViewModel);
        gmUtils.addStyle(cssStyle);
        // View模版的Html生成
        boxHtml = Mustache.render(tpl.html, tplViewModel);
        $('body').append(boxHtml);
    }
    // 第1步
    viewInit();

    // 第2步：数据绑定
    var vm = new Vue({
        el: '#mytoolsWrapper' + currentGuid,
        data: {
            showMenu: false,
            bindKeyCodeOne: 0,
            bindKeyCode1: 0,
            enabledDebugModel: false,
            enabledDirectGoogle: false,
            enabledBdMusicRemoveAd: false,
            enabledDouBanDownload: false,
            enabledCopyPage: false,
            enabledGwd: false,
            enabledBdYunLargeFileDownload: false,
            enabledFlatZhihu: false,
            enabledDirectZhihuLink: false,
            // 操作界面
            showBox: false
        },
        computed: {
            showWrapper: function () {
                // 一个计算属性的 getter
                // 不用了
                if(this.showMenu === false && this.showBox === false){
                    return false;
                } else {
                    return true;
                }
            }
        },
        methods: {
            switchShowBox: function () {
                this.showBox = !this.showBox;
            },
            saveVmDataToConfig: function(){
                gmUtils.setVal('config_showMenu', vm.showMenu);
                gmUtils.setVal('config_bindKeyCodeOne', vm.bindKeyCodeOne);
                gmUtils.log(vm.bindKeyCodeOne);
                gmUtils.setVal('config_bindKeyCode1', vm.bindKeyCode1);
                gmUtils.setVal('config_enabledDebugModel', vm.enabledDebugModel);
                gmUtils.setVal('config_enabledDirectGoogle', vm.enabledDirectGoogle);
                gmUtils.setVal('config_enabledBdMusicRemoveAd', vm.enabledBdMusicRemoveAd);
                gmUtils.setVal('config_enabledDouBanDownload', vm.enabledDouBanDownload);
                gmUtils.setVal('config_enabledCopyPage', vm.enabledCopyPage);
                gmUtils.setVal('config_enabledGwd', vm.enabledGwd);
                gmUtils.setVal('config_enabledFlatZhihu', vm.enabledFlatZhihu);
                gmUtils.setVal('config_enabledBdYunLargeFileDownload', vm.enabledBdYunLargeFileDownload);
                gmUtils.setVal('config_enabledDirectZhihuLink', vm.enabledDirectZhihuLink);
                vm.showBox = !vm.showBox;

                var env = vm.enabledDebugModel ? 'Debug' : 'Release';
                gmUtils.setEnv(env);
            }
        }
    });
    vm.$watch('showBox', function (newVal, oldVal) {
        if(newVal){
            convertUrl2QR();
        }
    });

    function loadConfigToVmData(){
        vm.enabledDebugModel = gmUtils.getVal('config_enabledDebugModel', false);
        var env = vm.enabledDebugModel ? 'Debug' : 'Release';
        gmUtils.setEnv(env);

        vm.showMenu = gmUtils.getVal('config_showMenu', true);
        vm.bindKeyCodeOne = gmUtils.getVal('config_bindKeyCodeOne', 18);
        gmUtils.log(vm.bindKeyCodeOne);
        vm.bindKeyCode1 = gmUtils.getVal('config_bindKeyCode1', 77);
        vm.enabledDirectGoogle = gmUtils.getVal('config_enabledDirectGoogle', true);
        vm.enabledBdMusicRemoveAd = gmUtils.getVal('config_enabledBdMusicRemoveAd', true);
        vm.enabledDouBanDownload = gmUtils.getVal('config_enabledDouBanDownload', true);
        vm.enabledCopyPage = gmUtils.getVal('config_enabledCopyPage', true);
        vm.enabledGwd = gmUtils.getVal('config_enabledGwd', true);
        vm.enabledFlatZhihu = gmUtils.getVal('config_enabledFlatZhihu', true);
        vm.enabledBdYunLargeFileDownload = gmUtils.getVal('config_enabledBdYunLargeFileDownload', true);
        vm.enabledDirectZhihuLink = gmUtils.getVal('config_enabledDirectZhihuLink', true);
    }
    // 第3步：加载配置到ViewModel的中
    loadConfigToVmData();
    // 第4步：功能启动
    startFeaturesByConfig();

    $('body').keydown(function(e){
        var config_bindKeyCodeOne = gmUtils.getVal('config_bindKeyCodeOne', 18);
        var config_bindKeyCode1 = gmUtils.getVal('config_bindKeyCode1', 77);
        gmUtils.log('当前按键：'+ e.keyCode);

        if(config_bindKeyCodeOne == 16 || config_bindKeyCodeOne == '16') {
            gmUtils.log('进入config_config_bindKeyCodeOne 16');
            if(e.shiftKey && e.keyCode == config_bindKeyCode1){
                vm.showBox = !vm.showBox;
            }
        }else if(config_bindKeyCodeOne == 17 || config_bindKeyCodeOne == '17') {
            gmUtils.log('进入config_config_bindKeyCodeOne 17');
            if(e.ctrlKey && e.keyCode == config_bindKeyCode1){
                vm.showBox = !vm.showBox;
            }
        }else if(config_bindKeyCodeOne == 18 || config_bindKeyCodeOne == '18') {
            gmUtils.log('进入config_config_bindKeyCodeOne 18');
            if(e.altKey && e.keyCode == config_bindKeyCode1){
                vm.showBox = !vm.showBox;
            }
        }else{
            gmUtils.log('进入default');
        }
    });

})(new GmUtils('Release'), (window.MutationObserver || window.WebKitMutationObserver));
