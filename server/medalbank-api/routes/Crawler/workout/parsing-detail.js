const cheerio = require('cheerio');
const utilLibrary = require('../../Util/utilLibrary');

/**********************************************
 * 
 * parsing Page
 * 
 ***********************************************/
exports.parsingTable = (html) => {
    let $ = cheerio.load(html);

    let contents = {};
    let workout = {
        workoutID: 0,
        title: "",
        description: '',    
        type: '',
        level: '',
        unit: '',
        distance: '',
        creator: '',
        site: "",
        sets: [],
    };

    //-----> workout table
    let anchor = $("div.panel-body");
    // console.log("panel-body=", anchor.length);
    let table = anchor.eq(0).find("table tbody.workoutBody tr.workoutRow");
    for (let no=0; no<table.length; no++) {
        let round = { };
        let td = table.eq(no).find("td");
        round.distance = td.eq(0).text().replace(/(|)|\t|\n/gi, "").trim();
        round.distance = Number(round.distance);
        round.rounds = td.eq(1).find("span.hidden-xs").text().replace(/(|)|\t|\n/gi, "").replace(" X {", "").trim();
        round.rounds = Number(round.rounds);
        let sets = td.eq(2).find("table tbody tr");
        let setArr = [];
        for (let n1=0; n1<sets.length; n1++) {
            let settd = sets.eq(n1).find("td");
            let set = {};
            set.repetition = settd.eq(0).text().replace(/(|)|\t|\n/gi, "").trim();
            const arr = (set.repetition+"x").split("x");
            set.repetition = Number(arr[0]);
            set.distance = Number(arr[1]);
            set.type = settd.eq(1).text().replace(/(|)|\t|\n/gi, "").trim().toLowerCase();
            set.stroke = settd.eq(2).text().replace(/(|)|\t|\n/gi, "").replace(/\(|\)/gi, "").trim().toLowerCase();
            set.description = settd.eq(3).text().replace(/(|)|\t|\n/gi, "").trim().toLowerCase();
            set.efforts = settd.eq(4).text().replace(/(|)|\t|\n/gi, "").replace("Effort", "").trim();
            // console.log("----->", set);
            if (set.type != "") {
                setArr.push(set)
            }
        }
        round.sets = setArr;
        workout.sets.push(round);
        // console.log(workout);
    }

    let infoAnchor = anchor.eq(1);
    let irow = infoAnchor.find("div.panel-body div.row");
    let infos = [];
    for (let no=0; no<irow.length; no++) {
        let info = irow.eq(no).text().replace(/(|)|\t|\n/gi, "").trim();
        infos.push(info);
    }
    let info = {};
    for (let no=0; no<infos.length; no++) {
        if (infos[no] === "Workout Title:") {
            info.title = infos[++no];
            const arr = info.title.split(" - ");
            if (arr.length > 1) {
              try {
                const dt = arr[arr.length-1].split("/");
                if (dt.length == 3) {
                  const date = new Date(dt[2], Number(dt[0])-1, dt[1], 9);
                  if (!isNaN(date)) {
                    info.datetime = date;
                    info.title = arr.slice(0, -1).join(' - ');
                    console.log(info.workoutID, info.title, info.datetime);
                    //------------------------------------------
                  }
                }
              } catch (e) {}
            }
        } else if (infos[no] === "Workout Description:") {
            info.description = infos[++no];
        } else if (infos[no] === "Workout Type:") {
            info.type = infos[++no].toLowerCase();
        } else if (infos[no] === "Workout Level:") {
            info.level = infos[++no].toLowerCase();
        } else if (infos[no] === "Distance unit:") {
            info.unit = infos[++no].toLowerCase();
        } else if (infos[no] === "Total Yards:") {
            info.distance = Number(infos[++no]);
        } else if (infos[no] === "Creator:") {
            info.creator = infos[++no].toLowerCase();
        }
        // console.log("------------------", no, infos[no], info)        
    }
    workout = { ...workout, ...info };
// console.log(info);

    // let site = $("div.panel-support div.panel-body");
    // workout.site = site.text().replace(/(|)|\t|\n/gi, "").trim();
    workout.site = 'swimworkouts';
    return workout;
}
