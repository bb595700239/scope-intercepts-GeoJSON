

var fs = require("fs");
var path = require("path");
var readline = require("readline");
const readliner = readline.createInterface({
    input: fs.createReadStream(path.join(__dirname, './gis_osm_water_a_free_1.json')),
});

let round = [[120.204615, 36.286494],
    [120.202641, 36.242134],
    [120.351987, 36.242411],
    [120.346751, 36.287463]];


function isInPolygon(checkPoint, polygonPoints) {
    var counter = 0;
    var i;
    var xinters;
    var p1, p2;
    var pointCount = polygonPoints.length;
    p1 = polygonPoints[0];

    for (i = 1; i <= pointCount; i++) {
        p2 = polygonPoints[i % pointCount];
        if (
            checkPoint[0] > Math.min(p1[0], p2[0]) &&
            checkPoint[0] <= Math.max(p1[0], p2[0])
        ) {
            if (checkPoint[1] <= Math.max(p1[1], p2[1])) {
                if (p1[0] != p2[0]) {
                    xinters =
                        (checkPoint[0] - p1[0]) *
                        (p2[1] - p1[1]) /
                        (p2[0] - p1[0]) +
                        p1[1];
                    if (p1[1] == p2[1] || checkPoint[1] <= xinters) {
                        counter++;
                    }
                }
            }
        }
        p1 = p2;
    }
    if (counter % 2 == 0) {
        return false;
    } else {
        return true;
    }
}








readliner.on('line', function (chunk) {
    if (chunk.indexOf('[[')>-1){
        if (chunk[chunk.length - 1] == ','){
            chunk = chunk.substr(0, chunk.length - 1)
        }
        let obj = JSON.parse(chunk)
        let subArr = []
        let arr = []
        if (Object.prototype.toString.call(obj.coordinates[0][0]) === '[object Array]'){
            arr = obj.coordinates[0]
        }else{
            arr = obj.coordinates
        }
        arr.forEach(co => {
            if (isInPolygon(co, round)) {
                subArr.push(co)
            }
        })
        if (subArr.length>1){
            let body = ({ "type": "LineString", "coordinates": subArr })

            fs.appendFile('./water.txt', JSON.stringify(body)+',', 'utf-8', function (err) {
                if (err) {
                    console.log(err)
                }
            })
        }
        
    }
});

readliner.on('close', function () {
    console.log('文件读取结束!');
})


