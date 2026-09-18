const fs = require('fs');
const pdf = require('pdf-parse');
 
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

let options = {
	pagerender: render_page
}

let dataBuffer = fs.readFileSync("./학생부결과.pdf");


pdf(dataBuffer,options).then((data) => {
	// console.log(data.text.split('\n'));
	const rows = data.text.split('\n');
	console.log(rows.length);
	rows.forEach((row) => {
		const cols = row.slice(0, -1).split('\t');
		console.log(cols);
	})
});


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
