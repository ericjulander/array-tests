/*
 * Finding correct thinggy
 */
function getSearchQuery(obj){
	 return new RegExp("("+obj.title.trim()+")|("+obj.speaker.trim()+")","gi");
}

function getDuration(obj){
	var from = obj.frameURL.match(/(mediaPlayFrom]=\d+)/g);
	if(from)
		from = parseInt(from[0].replace(/[^\d]/g, ""));
	else
		return null;
	var to = obj.frameURL.match(/(mediaPlayTo]=\d+)/g);
		if(to)
			to = parseInt(to[0].replace(/[^\d]/g, ""));
		else
			return null;
var time = [];
var current = to-from;
return (to-from)/60;
}

function matchesData(element, data){
	if(!($(element).find(".dataTd .searchme").text().match(/clip/gi) && $(element).find(".dataTd .searchme").text().match(getSearchQuery(data))))
		return;
	var time = ($(element).find(".thumbTd .duration").text()).split(":").reverse().map(function(item,index){
		return parseInt(item) * ((60*index) || 1)
	}).reduce(function(a,b){return a+b});
	var dataTime = getDuration(data);
	//console.log(dataTime)
	if(Math.round(time/10)*10 === dataTime){
		console.log("Match: ", $(element).find("a").attr("href"));
		return;
    }
}

for(var i of Array.from($("#videosResultsTable tr")))
	matchesData(i, data)
	
/*
 * Getting correct link to thinggy
 */
 