const cheerio = require('cheerio');

/**********************************************
 * 
 * parsing Page
 * 
 ***********************************************/
exports.parsingTable = async function(html, config) {

    let $ = cheerio.load(html);
    // let total = $(config.header.selector).text().trim();

    const tableArr = $(config.lineSelector);

    let tablePtr = tableArr;
    if (config.tableNo !== undefined && tableArr.length > config.tableNo) {
        tablePtr = tableArr[config.tableNo];
    }
    if (config.subSelector !== undefined) {
        tablePtr = tablePtr.find(config.subSelector);
    }

    let trJson = [];
    tablePtr.each(function(index, elem){

        const tds = $(this).find(config.fieldSelector);
        try {
            const children = $(this).children(); 
            let tdJson =  {};

            config.body.forEach(body => {
                if (body.type == "text") {
                    tdJson[body.name] = children.eq(body.no).text().trim();
                }
                else {
                    tdJson[body.name] = (
                        children.eq(body.no).find(body.type).attr(body.attr) == undefined
                            ? children.eq(body.no).text()
                            : children.eq(body.no).find(body.type).attr(body.attr)
                    ).trim();
                }
            })   // forEach
            
            trJson.push(tdJson);
        }
        catch (e) {
            console.log("==========================>"+e);
            console.log($(this).children().html);
        }
    })
// console.log("parsing-table="+JSON.stringify(trJson));
    return trJson;
}

