'use strict';

var diggingDeeper = function () {
    'use strict';

    var currentScript = document.getElementById('diggingDeeperTemplate'),
        dataFile = currentScript.dataset.videos,
        dataJs = document.createElement("script"),
        size,
        cssFiles = ["https://localhost:8000/diggingDeeper.css",
    //            "https://content.byui.edu/integ/gen/7a262da4-897d-47fc-a0ac-4b07a1f1e964/0/diggingDeeper.css",
    "https://cdn.rawgit.com/noelboss/featherlight/1.6.1/release/featherlight.min.css", "https://cdn.rawgit.com/noelboss/featherlight/1.6.1/release/featherlight.gallery.min.css"],
        jsFiles = [dataFile, "https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js", "https://cdn.rawgit.com/noelboss/featherlight/1.6.1/release/featherlight.min.js", "https://cdn.rawgit.com/noelboss/featherlight/1.6.1/release/featherlight.gallery.min.js"];

    console.log(dataFile);

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
    //var resizer = $('<div />', {id: 'hidden-resizer'}).hide().appendTo(document.body);

    function parseTime(seconds) {
        var hours = seconds >= 60 * 60;
        var time = [];
        for (var i = hours ? 2 : 1; i >= 0; i--) {
            var segment = Math.pow(60, i);
            var tick = seconds >= segment ? (seconds - seconds % segment) / segment : 0;
            //console.log(segment,tick, seconds);
            time.push(tick);
            seconds -= tick * segment;
        }
        return time.map(function (item, index) {
            if (item < 10 && index > 0) return '0' + item;
            return item;
        }).join(":");
    }

    function allowFullscreen() {
        //            alert("Worked!");
        var item = document.getElementsByTagName("iframe")[0];
        console.log(item.src);
        var start = /(mediaPlayFrom]=)(\d+|undefined)/g.exec(item.src);
        if (!start || start === 'undefined') start = 0;
        start = parseTime(parseInt(start[2]));
        console.log(start);
        var finish = /(mediaPlayTo]=)(\d+|undefined)/g.exec(item.src);
        console.log(finish);
        if (!finish || finish === 'undefined') finish = 'the end';else finish = parseTime(parseInt(finish[2]));
        console.log(finish);

        item.setAttribute('allowFullScreen', '');
        item.setAttribute('webkitallowfullscreen', '');
        item.setAttribute('mozallowfullscreen', '');
        var notice = 'Note: Once you start the video, it will automatically bring you to the segment that you need to watch. The video will pause when the segment is finished playing. If the video does not function as described above, please start the video at ' + start + ' and you may close the video once you have reached ' + finish + '. ';
        console.log("length: ", $("#videoLength").html());
        if (!$("#videoLength").html()) {
            console.log("Creating.");
            var div = $('<div>', {
                id: "videoLength"
            }).html(notice);
            console.log(div);
            $("div.featherlight-content").prepend(div);
        } else {
            console.log("Set Text!");
            $("#videoLength").html(notice);
        }
    }

    function insertVideo(info) {
        $.featherlight.defaults.afterContent = allowFullscreen;
        var id = info.title.match(/[0-z]/g).join("").toLowerCase().match(/\d|\w/g).join("");
        console.log(id);
        var html = "";
		if(info.frameURL.match(/kaltura|youtube/g)) 
			html = '<a id ="' + id + '" class="internal" href="' + info.frameURL + '" data-featherlight="iframe" data-featherlight-variant="videoIframe">\n                <!--<img src="' + info.imageURL + '" alt="">-->\n                <p class="title">' + info.title + '</p>\n            </a>' 
		else
			html = '<a id ="' + id + '" class="external" href="' + info.frameURL + '" target="_blank">\n                <!--<img src="' + info.imageURL + '" alt="">-->\n                <p class="title">' + info.title + '</p>\n            </a>';
        document.getElementById('flex-container').insertAdjacentHTML('beforeend', html);
        /*resizer.html(info.title);
        while(resizer.width() > 200) {
            size = parseInt(resizer.css("font-size"), 10);
            resizer.css("font-size", size - 1);
        }*/
        $('#' + id).css({
            "background-image": 'url("' + info.imageURL + '")'
        });
        $('#' + id + ' p').css("font-size", size).html(info.speaker + '<br><span class="sub">' + info.title + '</span>');
        /*$(`#${id}`).click(function () {
            console.log("ouch!", info);
            var start = /(mediaPlayFrom]=)(\d+|undefined)/g.exec(info.frameURL)[2];
            if (start === 'undefined')
                start = 0;
            start = parseTime(parseInt(start));
            console.log(start);
            var finish = /(mediaPlayTo]=)(\d+|undefined)/g.exec(info.frameURL)[2];
            if (finish === 'undefined')
                finish = 'end';
            else finish = parseTime(parseInt(finish));
            console.log(finish);
            currentDurration.start = start;
            currentDurration.finish = finish;
        });*/
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
        $(document).on("keyup", function () {
            console.log("wasupbro");
        });
    }

    // Inject required files
    cssFiles.forEach(injectCSS);
    injectJS();
    return {
        build: build
    };
}();