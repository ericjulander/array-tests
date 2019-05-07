// EXERCISE 1

/*
 * Takes an array of objects containing a "key" and "value" property and condenses it into one object
 */
function condenseArray(data) {
    // goes though and colapses the objects into arrays
    return data.map(function (info) {
        return [info.key, info.value];
    }).reduce(function (a, b, index) {
        //takes the arrays and throws it into an object matching each arrays key with its value
        a[b[0]] = b[1];
        return a;
    }, {});
}

/*
 * MAIN FUNCTION
 * Creates the car info, condenses it, and then prints it to the console
 */
(function () {
    // THE INFORMATION TO CONDENSE
    var carInfo = [{
            key: "year",
            value: "2016"
        },
        {
            key: "make",
            value: "Porsche"
        },
        {
            key: "model",
            value: "911 R"
        },
        {
            key: "color",
            value: "white"
        },
        {
            key: "msrp",
            value: "$184,900"
        }
    ];
    // CONDENSE THE DATA
    var collapsedData = (condenseArray(carInfo));
    // REMOVE THE UNWANTED MSRP
    if (collapsedData) delete collapsedData["msrp"];
    //LOG THE DATA
    console.log(collapsedData);

    /* OUTPUT: 
        {
          year: '2016',
          make: 'Porsche',
          model: '911 R',
          color: 'white' 
        }
    */

})();