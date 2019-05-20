'use strict';

var scriptTag = document.getElementById('diggingDeeperTemplate');

/*
 * This expects 2 queries from the url:
 * course - the course code for the course it is running from
 * module - what "week" you need to render the digging deeper videos for. This allows flexibility in the block courses. 
 * returns an object which has the query keys paired with their respective values passed into them.
 */
var moduleInfo = (window.location.search.slice(1).split("&").reduce(function (acc, query) {
    var keyValuePair = query.split("=");
    acc[keyValuePair[0]] = keyValuePair[1];
    return acc;
}, {}));


var recievedDataFromQuery = (moduleInfo.course !== undefined && moduleInfo.module !== undefined),
    parentHref, urlChunks, pageUrl, course_module, course;
if (!recievedDataFromQuery) {
    // backwards compatibility
    parentHref = document.referrer;
    urlChunks = parentHref.split('/');
    pageUrl = urlChunks[urlChunks.length - 1].split('?')[0];
    course_module = pageUrl[1] + pageUrl[2];
    course = window.name;
} else {
    // implemented bugfix
    course = moduleInfo.course;
    course_module = convertIntToXBitString(moduleInfo.module, 2);
}

/*
 * Appends missing 0s to the front of the number depending on the specified size of the string.
 */
function convertIntToXBitString(number, bits) {
    var newNumber = (typeof number !== "string") ? number.toString() : number;
    var str = "";
    for (var i = 0; i < bits - newNumber.length; i++)
        str += "0";
    return str + newNumber;

}

var dynamicJavascriptLink = 'https://content.byui.edu/integ/gen/7a262da4-897d-47fc-a0ac-4b07a1f1e964/0/data' + course + 'Week' + course_module + '.js';
console.log(dynamicJavascriptLink);
scriptTag.setAttribute('data-videos', dynamicJavascriptLink);

var diggingDeeper = function () {
    'use strict';

    var currentScript = document.getElementById('diggingDeeperTemplate'),
        dataFile = currentScript.dataset.videos,
        diggingDeeperTemplate,
        dataJs = document.createElement("script"),
        size,
        cssFiles = ["https://content.byui.edu/integ/gen/7a262da4-897d-47fc-a0ac-4b07a1f1e964/0/diggingDeeper.css", "https://cdn.rawgit.com/noelboss/featherlight/1.6.1/release/featherlight.min.css", "https://cdn.rawgit.com/noelboss/featherlight/1.6.1/release/featherlight.gallery.min.css"],
        jsFiles = [dataFile, "https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js", "https://cdn.rawgit.com/noelboss/featherlight/1.6.1/release/featherlight.min.js", "https://cdn.rawgit.com/noelboss/featherlight/1.6.1/release/featherlight.gallery.min.js"];

    function injectCSS(url) {
        var linkTag = document.createElement('link');
        linkTag.rel = "stylesheet";
        linkTag.href = url;
        document.head.appendChild(linkTag);
    }

    function injectJS() {
        var scriptTag = document.createElement('script');
        scriptTag.src = jsFiles.shift();
        if (jsFiles.length > 0) {
            scriptTag.onload = injectJS;
        } else {
            scriptTag.onload = build;
        }
        document.body.appendChild(scriptTag);
    }

    function parseTime(seconds) {
        var hours = seconds >= 60 * 60;
        var time = [];
        for (var i = hours ? 2 : 1; i >= 0; i--) {
            var segment = Math.pow(60, i);
            var tick = seconds >= segment ? (seconds - seconds % segment) / segment : 0;
            time.push(tick);
            seconds -= tick * segment;
        }
        return time.map(function (item, index) {
            if (item < 10 && index > 0) return '0' + item;
            return item;
        }).join(":");
    }

    function allowFullscreen() {
        var item = document.getElementsByTagName("iframe")[0];
        var start = /(mediaPlayFrom]=)(\d+|undefined)/g.exec(item.src);
        if (!start || start === undefined) start = 0;
        start = parseTime(parseInt(start[2]));
        var finish = /(mediaPlayTo]=)(\d+|undefined)/g.exec(item.src);
        if (!finish || finish === undefined) finish = 'the end';
        else finish = parseTime(parseInt(finish[2]));

        item.setAttribute('allowFullScreen', '');
        item.setAttribute('webkitallowfullscreen', '');
        item.setAttribute('mozallowfullscreen', '');
        var notice = 'Note: Once you start the video, it will automatically bring you to the segment that you need to watch. The video will pause when the segment is finished playing. If the video does not function as described above, please start the video at ' + start + ' and you may close the video once you have reached ' + finish + '. ';
        if (!$("#videoLength").html()) {
            var div = $('<div>', {
                id: "videoLength"
            }).html(notice);
            $("div.featherlight-content").prepend(div);
        } else {
            $("#videoLength").html(notice);
        }
    }

    function insertVideo(info) {
        $.featherlight.defaults.afterContent = allowFullscreen;

        var id = info.title.match(/[0-z]/g).join("").toLowerCase().match(/\d|\w/g).join("");

        var html = "";

        info.frameURL = info.frameURL.replace(/uiconf_id\/\d*\/partner_id/, 'uiconf_id/33020032/partner_id');

        if (info.frameURL.match(/kaltura|youtube/g)) {
            html = '<a id="' + id + '" class="internal" href="' + info.frameURL + '" data-featherlight="iframe" data-featherlight-variant="videoIframe">\n                    <p class="title">' + info.title + '</p>\n                </a>\n            ';
        } else {
            html = '<a id="' + id + '" class="external" href="' + info.frameURL + '" target="_blank"><p class="title">' + info.title + '</p>\n                </a>\n            ';
        }

        document.getElementById('flex-container').insertAdjacentHTML('beforeend', html);
        document.querySelector('#' + id).style.backgroundImage = 'url("' + info.imageURL + '")';
        document.querySelector('#' + id + ' p').style.fontSize = size;
        document.querySelector('#' + id + ' p').innerHTML = info.speaker + '<br><span class="sub">' + info.title + '</span>';
    }

    function build() {
        var wrapper = '<div id="flex-container" data-featherlight-gallery data-featherlight-filter=".internal"></div>';

        currentScript.previousElementSibling.innerHTML = wrapper;

        diggingDeeperVideos.forEach(insertVideo);

        $('.external').each(function () {
            $(this).click(function () {
                window.open(this.href, "_blank");
            });
        });
    }

    cssFiles.forEach(injectCSS);
    injectJS();
    return {
        build: build
    };
}();

// "https://cdnapisec.kaltura.com/p/1157612/sp/115761200/embedIframeJs/uiconf_id/29018071/partner_id/1157612?iframeembed=true&playerId=kaltura_player&entry_id=0_t5hvejpv&flashvars[streamerType]=auto&flashvars[mediaProxy.mediaPlayTo]=194&flashvars[mediaProxy.mediaPlayFrom]=2&flashvars[localizationCode]=en&flashvars[leadWithHTML5]=true&flashvars[sideBarContainer.plugin]=true&flashvars[sideBarContainer.position]=left&flashvars[sideBarContainer.clickToClose]=true&flashvars[chapters.plugin]=true&flashvars[chapters.layout]=vertical&flashvars[chapters.thumbnailRotator]=false&flashvars[streamSelector.plugin]=true&flashvars[EmbedPlayer.SpinnerTarget]=videoHolder&flashvars[dualScreen.plugin]=true&&wid=0_oqubdp28"

//https://cdnapisec.kaltura.com/p/1157612/sp/115761200/embedIframeJs/uiconf_id/33020032/partner_id/1157612?iframeembed=true&playerId=kaltura_player_1529691931&entry_id=0_9qpzmrmb&flashvars[streamerType]=auto