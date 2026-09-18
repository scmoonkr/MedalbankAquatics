const fs = require('fs');
const pdf = require('pdf-parse');
const { Config }  = require('../../importUTIL/config');
 
// if (process.argv.length < 3) {
// 	console.log("node readPDF (competitionID)",);
// 	// return;
// }
const competitionID 		= Number(process.argv[2]);

//==============================================
//==============================================
const readPDF = (filename)=> new Promise((resolve)=> {
	const options = { pagerender: render_page };
	const dataBuffer = fs.readFileSync(filename);		

	try {
		console.log("pdf...");
		const result = pdf(dataBuffer, options).then((data) => {
			// console.log(data.text.split('\n'));
			const rows = data.text.split('\n');
			// console.log(rows.length);
			const rowArr = [];
			let str = "";
			rows.forEach((row) => {
				// const cols = row.slice(0, -1).split('\t');
				const cols = row.split('\t');
				// console.log(cols);
				rowArr.push(cols);
				str += `${cols.join('|')}\n`;
			})	
			
			// fs.writeFileSync("excel.json", JSON.stringify(rowArr, null, '  '))
			resolve(str);
		});
	} catch (err) {
		console.log("4>error="+err);
		resolve(null);
	}
});

(async () => {

	const filename = getFilename(competitionID);
	const fullpath = `${Config.times_data_path}/times/${filename}`;
	// filename = "pdf/1140 제9회 서울특별시연맹회장배 수영대회 기록지.pdf";
	// filename = "1295 수영대회 최종기록 23.07.16.pdf";
	// filename = "1280 제3회 창원시수영연합회장배 전국 마스터즈 수영대회 기록지(개혼 접영 계영).pdf";
console.log(`competitionID=${competitionID}, filename=${filename}, fullpath=${fullpath}`);
	//-------------------------------------------------
	//-------------------------------------------------
	console.log("readFileSync...");
	const result = await readPDF(fullpath);
	//-------------------------------------------------
	//-------------------------------------------------
	//-------------------------------------------------
	// console.log("file write...", result);
	fs.writeFileSync("excel.json", result)

	
})();

// default render callback
function render_page(pageData) {
	//check documents https://mozilla.github.io/pdf.js/
	let render_options = {
			//replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
			normalizeWhitespace: false,
			//do not attempt to combine same line TextItem's. The default value is `false`.
			disableCombineTextItems: false
	}

	return pageData.getTextContent(render_options)
	.then(function(textContent) {
			let lastY, text = '';
			for (let item of textContent.items) {
					if (lastY == item.transform[5] || !lastY){
							text += item.str + "\t";
					}  
					else{
							text += '\n' + item.str + "\t";
					}    
					lastY = item.transform[5];
			}
			return text;
	});
}

function getFilename(competitionID) {
	result = fs.readdirSync(`${Config.times_data_path}/times`)
	let filename = result.filter(file => file.indexOf(`${competitionID} `) == 0)
	if (filename.length == 0) {
		console.log(`competitionID = [${competitionID}] file not found`);
		return;
	}
	const arr = filename[0].split('.');
	if (! "pdf".includes(arr.slice(-1))) {
		console.log(`no excel file: [${arr.slice(-1)}], filename = [${filename[0]}]` );
		return;
	}
	return filename[0];
}

/*
pdf(dataBuffer).then(function(data) {
 
    // number of pages
    console.log("numpages", data.numpages);
    // number of rendered pages
    // console.log(data.numrender);
    // PDF info
    // console.log(data.info);
    // PDF metadata
    // console.log(data.metadata); 
    // PDF.js version
    // check https://mozilla.github.io/pdf.js/getting_started/
    // console.log(data.version);
    // PDF text
    // console.log(data.text); 
    console.log(data.); 
        
});
*/
// pdfParser.loadPDF("./학생부결과.pdf");
