/*
 * This is a tool that takes all of the old javascript files which contained that data and then puts them as a hierarchical object into a JSON file.
 */
const [fs, Async] = [require("fs"), require("async")];
const stringify = require("json-stringify-pretty-compact");

/*
Appends custom flag

function to the console
Node | Vanilla */
console = (function () {
    "use strict";
    //Grabs console for Web or Node
    var CONSOLE = console.prototype || console;

    /*
     Prints a star border around the specified text.
     There is an 80 character limit per line before it wraps.
     */
    function flag() {
        var me = this;
        var args = Array.prototype.slice.call(arguments);
        args.map(function (arg) {
            arg = arg.toString();
            var message = "";
            var length = ((arg.length < 80) ? arg.length : 80) + 4;
            for (var i = 0; i < length; i++) message += "*";
            var sections = arg.match(/.{1,80}/g);
            sections.map(function (section) {
                message += "\n*";
                var minlen = (length - section.length) - 2;
                for (var i = 0; i < minlen / 2; i++) message += " ";
                message += section;
                for (var i = 0; i < (minlen / 2) - minlen % 2; i++) message += " ";
                message += "*";
            });
            message += "\n";
            for (var i = 0; i < length; i++) message += "*";
            me.log(message);
        });
    }
    CONSOLE.flag = flag;
    return CONSOLE;
}());

function consolidateByKey(objectArray, sortingKey) {
    return objectArray.reduce(function (consolidatedObject, object2Sort) {
        var depositArray = consolidatedObject[object2Sort[sortingKey]];
        consolidatedObject[object2Sort[sortingKey]] = (depositArray !== undefined) ? [].concat(depositArray, object2Sort) : object2Sort;
        return consolidatedObject;
    }, {});
}

function createHarchObject(object2Reduce, arrayName = "values") {
    var newArray = [];
    for (var i in object2Reduce) {
        var tempObject = {};
        tempObject["name"] = i;
        tempObject[arrayName] = object2Reduce[i];
        newArray.push(tempObject);
    }
    return newArray;
}


function cleanWeekData(video) {
    return {
        title: video.title,
        speaker: video.speaker,
        imageURL: video.imageURL,
        frameURL: video.frameURL
    }
}


function determineNumbericOrder(number, number2Compare) {
    return (number - number2Compare) / Math.abs(number - number2Compare) || 0;
}

function determineAlphOrder(string1, string2) {
    var length = (string1.length < string2.length) ? string1.length : string2.length;
    var pos;
    // loops until it finds the correct placenment for the specified work
    for (var i = 0; i < length; i++) {
        // gets the the character at the specified position in the array
        var [c1, c2] = [string1.charCodeAt(i), string2.charCodeAt(i)];
        // determines the correct order of the two items
        pos = determineNumbericOrder(c1, c2);
        //leaves the loop when it finds one character that is different and places it
        if (pos !== 0) break;
    }
    return pos;
}


/*
 * A sort function to sort the harch object in alphabetical order.
 */
function sortHarchObjectAlph(object1, object2) {
    return determineAlphOrder(object1.name, object2.name);
}



function writeToJSON(data) {
    // writes the video data into the json file
    fs.writeFileSync("./digging-deeper-video-data.json", stringify(data).replace(/\,\n\s*(\{\})/g, ""), "utf8");
}

function cleanJSON(data, filename, itemToAppend) {
    //this strips all of the javascript stuff off so we just have the JSON format
    var newData = data.replace(/.*(?:= \[)|(\]\;)/g, "");
    // this fixes the error where quotation marks were not put around key names for the following items.
    ["title", "speaker", "imageURL", "frameURL"].forEach(function (keyToFix) {
        var regex = new RegExp(keyToFix + "\:", "g");

        if (regex.test(newData)) {

            newData = (newData.replace(regex, '"' + keyToFix + '":'));

        }
    });
    // adds metadata to the object to help sort it into the hierarchical object
    // 0 - the course code 
    // 1 - the module (week) number 
    var metaData = filename.replace(".js", "").replace(/data/g, "").replace(/Week/g, ",").split(",");
    // formats it into a more JSON parse friendly string and ties loose ends.
    newData = '{ "' + "data" + '":[' + newData + (itemToAppend || "") + ']}';

    var jsonData = JSON.parse(newData);
    // adds the metadata to the JSON object and also cleans up the weeks numbers by taking off all preceding 0ss
    jsonData.data = jsonData.data.map(function (videoObject) {
        videoObject.courseCode = metaData[0];
        videoObject.week = metaData[1].replace(/0*(?=[1-9])/g, "");
        return videoObject;
    });
    return jsonData.data;
}

function getScriptFileObject(directory, filename, callback) {
    // reads all the script files in the specified directory
    fs.readFile(directory + "\\" + filename, "utf8", function (e, fileData) {

        if (e) callback(e);
        var compressedData = fileData;
        //takes out all the new lines to make regex easier :)
        while (/\n/g.test(compressedData))
            compressedData = (compressedData.replace(/\n/g, ""));

        try {
            //try compiling the file assuming there are straggling commas 
            var jsonData = cleanJSON(compressedData, filename, "{}");
            callback(null, jsonData);
        } catch (e) {
            try {
                // We assumed incorrectly! Lets pretend that never happened...
                // We will compile it assuming there are no errors to fix in the file
                var jsonData = cleanJSON(compressedData, filename);
                callback(null, jsonData);
            } catch (e) {
                // This file is hopeless! Lets just skip it.
                console.flag("Couldn't make file: " + filename);
                callback(e);
            }
        }


    });
}
/* 
 * Gets all the scripts in the specified directory and puts it into one JSON file.
 */
function condenseObjets(path, complete) {

    var dirItems = fs.readdir(path, function (e, dir) {
        if (e) console.error(e);

        Async.map(dir, function (a, cb) {
            // goes though all the files and converts them into JSON objects
            getScriptFileObject(path, a, cb)
        }, function (er, res) {
            if (er) {
                console.error(er);
                return;
            }
            // Take all of the objects and put them into one big object 
            var completeData = res.reduce(function (acc, videoData) {
                console.log(acc)
                acc.videos.push(...videoData);
                return acc;
            }, {
                videos: []
            });

            complete(completeData);

        });
    })
}

// MAIN
(function () {
    // gets the raw list of videos from all the files in the inputed directory
    condenseObjets(process.argv[2], function (data) {
        var consolidatedObject = consolidateByKey(data.videos, "courseCode");
        // takes the array of objects and turns it into a harch object
        var courses = createHarchObject(consolidatedObject, "weeks");
        // sifts through the courses and turns the weeks into harch objects and then sorts the courses and in alphabetical order
        var completeData = courses.map(function (course) {
            // separates the weeks in the courses
            var courseList = consolidateByKey(course.weeks, "week");
            // turns the weeks into harch objects and sorts them in alphabetical order
            var weeks = createHarchObject(courseList, "videos").map(function (week) {
                // cleans the video data
                week.videos = week.videos.map(cleanWeekData);
                return week;
            }).sort(sortHarchObjectAlph);
            course.weeks = weeks;
            return course;
        }).sort(sortHarchObjectAlph);

        // takes the now clean data and puts it into a JSON file.
        writeToJSON(completeData.reduce(function (acc, courseObject) {
            console.log(courseObject);
            acc[courseObject.name] = courseObject.weeks;
            return acc;
        }, {}));
    });
})();