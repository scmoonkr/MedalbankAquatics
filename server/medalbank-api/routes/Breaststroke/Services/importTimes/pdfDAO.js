const fs = require('fs');
const pdf = require('pdf-parse');
const { Config }  = require('./importUTIL/config');
 
// if (process.argv.length < 3) {
// 	console.log("node readPDF (competitionID)",);
// 	// return;
// }
const competitionID 		= Number(process.argv[2]);


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

//==============================================
//==============================================
exports.readPDF = (filename)=> new Promise((resolve)=> {
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

//==============================================
//==============================================
const streamPDF = (dataBuffer)=> new Promise((resolve)=> {
	const options = { pagerender: render_page };
	// const dataBuffer = fs.readFileSync(filename);		

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
