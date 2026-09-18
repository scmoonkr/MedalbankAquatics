// const moment    	= require('moment');
// const utilLibrary = require("../../Util/utilLibrary");
const { timeConversion } = require('geolib');
const extend 				= require('node.extend');
const xlsx        	= require('xlsx');
const XlsxPopulate	= require('xlsx-populate');

//----------------------------------------------------
function getHeader(rows, headers) {
	let nameArr = [];
	console.log(rows.slice(0, 2));
	//----->
	for ( let no=0; no<10; no++) {
		let find = 0;

		let nno = 0;
		Object.keys(rows[no]).forEach(key => {
			const value = rows[no][key].toString().replace(/ /gi, '');
			if ((ck=headers.find(el => el.label.indexOf(value) >= 0)) != undefined) {
				if (++find > 3) {
					return;
				}
			}
		})
		const row = rows[no];

		if (find > 4) {
			for(let n2=0; n2<Object.keys(row).length; n2++) {
				const key = Object.keys(row)[n2];
				for (let n1=0; n1<headers.length; n1++) {
					const value = row[key].toString().replace(/ /gi, '');
					if (headers[n1].label.indexOf(value) >= 0) {
						nameArr.push({ name: headers[n1].name, key: key.length > 10 ? "": key, });
						break;
					}
				}
			}
			break;
		}
	}
	//----->

	return nameArr;
}

const _color = {
	White: "FFFFFF",
	Black: "000000",
	Grey: "ECECEC",
	greyLight: "F8F8F8",
	GreyDark: "969696",

	// Red 
	red: "FF0000",
	IndianRed: "CD5C5C",
	LightCoral: "F08080",

	// Pink 
	Pink: "FFC0CB",
	LightPink: "FFB6C1",
	HotPink: "FF69B4",
	DeepPink: "FF1493",
	
	// orange
	Orange: "FFA500",
	LightSalmon: "FFA07A",
	Coral: "FF7F50",
	Tomato: "FF6347",
	OrangeRed: "FF4500",
	DarkOrange: "FF8C00",

	// Yellow 
	Yellow: "FFFF00",
	Gold: "FA07A",
	LightYellow: "FFFFE0",

	// Purple
	Purple: "800080",
	Lavender: "E6E6FA",
	Magenta: "FF00FF",
	Indigo: "4B0082",

	// Green 
	Green: "00FF00",
	LightGreen: "90EE90",

	// Blue 
	Blue: "0000FF",
	Cyan: "00FFFF",
	MediumBlue: "0000CD",	
	DarkBlue: "00008B",

	// Brown 
	Brown: "A52A2A",
	
}
const defaultHeight = 15;
const defaultWidth = 10;

class Excel {
	constructor() {
	}
	//-----------------------------
	// getter
	//-----------------------------
	// get holidays() 				{ return this._holidaysArr; }

	//-----------------------------
	// set holiday(holiday)   { this._holidays.push(holiday); }
	//-----------------------------

  //============================================
  write_excel(filename, rowArr, header) {
    const alpha = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ"];
    for (let no=0; no<header.length; no++) {
      header[no].cell = header[no].cell == undefined ? alpha[no] : header[no].cell;
    }

    try {
      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(rowArr);

      const wscols = [];
      header.forEach(hdr => {
        if (hdr.width == undefined) hdr.width = 80;
        wscols.push({ wpx: hdr.width });
      })
      worksheet['!cols'] = wscols;
      
      xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      const ws = workbook.Sheets.Sheet1;
      const records = xlsx.utils.sheet_to_json(ws);

      // const header = [
      //   { label: "no", column: "no", type: "s", call: "A", options: { width: 100, color: "red", bcolor: "#eee", }, },
      // ];
      header.forEach(hdr => {
        add_to_sheet(ws, hdr.cell+"1", 's', hdr.label);
      })

      for (const [no, row] of rowArr.entries()) {
        const nos = (no+2).toString();
        header.forEach(hdr => {
          add_to_sheet(ws, hdr.cell+nos, hdr.type, row[hdr.column]);
        })
      }
      xlsx.writeFile(workbook, filename);
    } catch (e) {
      console.error(e);
    }
    
  }
	
	//============================================
	write_excel_sheet_new(filename, rows, header=timesHeader) {
		const alpha = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ"];

		XlsxPopulate.fromBlankAsync().then(workbook => {
			// Get the first sheet
			const sheet = workbook.sheet(0);

			let rowno = 1;
			//{ label: "#", column: "timeID", type: "n", width: 30, },
			for (let col=0; col < header.length; col++) {
				const style = {
					fontSize						: header[col].fontSize	? header[col].fontSize 	: 10,
					fontColor						: header[col].fontColor ? header[col].fontColor : _color.Black,
					fill								: header[col].backColor ? header[col].backColor : _color.greyLight,
					bold								: header[col].bold 	 != undefined ? header[col].bold 			: false,
					italic							: header[col].italic != undefined ? header[col].italic 		: false,
					horizontalAlignment	: "center",
					verticalAlignment		: "center",
				};
				sheet.cell(`${alpha[col]}${rowno}`).value(header[col].label).style(style);
				// sheet.cell(`${alpha[col]}1`).style({ fontSize: 10, fontColor: _color.Black, fill: _color.greyLight, bold: true, italic: true, horizontalAlignment: "center", verticalAlignment: "center", });
				
				// Set cell width (column A)
				sheet.column(alpha[col]).width(header[col].width ? header[col].width / 8 : defaultWidth);

				// Set cell height (column A)
				sheet.row(rowno).height(header[col].height ? header[col].height : defaultHeight);

			}

			
			//{ label: "#", column: "timeID", type: "n", width: 30, align: "left|center|right", valign: "top|center|bottom", fontSize, fontColor, fill, bold, italic },
			//------------------------------
			for (let row=0; row < rows.length; row++) {
				rowno++;
				//------------------------------
				for (let col=0; col < header.length; col++) {
					const style = {
						fontSize						: header[col].fontSize	? header[col].fontSize 	: 10,
						fontColor						: header[col].fontColor ? header[col].fontColor : _color.Black,
						fill								: header[col].backColor ? header[col].backColor : _color.White,
						bold			: header[col].bold != undefined 	? header[col].bold 			: false,
						italic		: header[col].italic != undefined ? header[col].italic 		: false,
						horizontalAlignment	: header[col].align 		? header[col].align 		: header[col].type == 'n' ? "right" : "left",
						verticalAlignment		: header[col].valign 		? header[col].valign 		: "center",
					};
					sheet.cell(`${alpha[col]}${rowno}`).value(rows[row][header[col].column]);
					sheet.cell(`${alpha[col]}${rowno}`).style(style);
					// sheet.cell(`${alpha[no]}1`).style({ fontSize: 10, fontColor: _color.Black, fill: _color.greyLight, bold: true, italic: true, horizontalAlignment: "center", verticalAlignment: "center", });
				} // end for col
				//------------------------------

				// Set cell height (column A)
				sheet.row(rowno).height(header[0].height ? header[0].height : defaultHeight);

			} // end for row
			//------------------------------

			// Set cell border style
			let cellRange = sheet.range(`A1:${alpha[header.length-1]}${rowno}`);
			cellRange.style({ border: true });
			
			// Save the workbook as a file
			return workbook.toFileAsync(filename);
		}).then(() => {
			console.log("File saved successfully!");
		}).catch(error => {
			console.error("Error occurred:", error);
		});

	}

	
	//=============================================
	//	_sheets : { sheetName: [] }
	//=============================================
	write_excel_sheet(filename, _sheets, header) {
		const alpha = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ"];
		for (let no=0; no<header.length; no++) {
			header[no].cell = header[no].cell == undefined ? alpha[no] : header[no].cell;
		}

		try {
			const workbook = xlsx.utils.book_new();

			Object.keys(_sheets).forEach(sheetName => {
				if (_sheets[sheetName].length > 0) {
					const worksheet = xlsx.utils.json_to_sheet(_sheets[sheetName]);

					const wscols = [];
					header.forEach(hdr => {
						if (hdr.width == undefined) hdr.width = 80;
						wscols.push({ wpx: hdr.width });
					})
					worksheet['!cols'] = wscols;

					xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
					const ws = workbook.Sheets[sheetName];
					const records = xlsx.utils.sheet_to_json(ws);
			
					// const header = [
					//   { label: "no", column: "no", type: "s", call: "A", options: { width: 100, color: "red", bcolor: "#eee", }, },
					// ];
					header.forEach(hdr => {
						add_to_sheet(ws, hdr.cell+"1", 's', hdr.label);
					})
			
					for (const [no, row] of _sheets[sheetName].entries()) {
						const nos = (no+2).toString();
						header.forEach(hdr => {
							add_to_sheet(ws, hdr.cell+nos, hdr.type, row[hdr.column]);
						})
					}
				}
			})

			xlsx.writeFile(workbook, filename);
		} catch (e) {
			console.error(e);
		}	
	}

  //============================================
  read_excel(filename, sheet="Sheet1") {
    const workbook = xlsx.readFile(filename);
    const ws = workbook.Sheets[sheet];
    const rows = xlsx.utils.sheet_to_json(ws); // TODO: 강좌에서 header 옵션 보여주기
    
    let rowArr = [];
    for (const [index, row] of rows.entries()) {
      rowArr.push(row);
      // if (index > 10) break;
    }

    return rowArr;
  }
	//============================================
	read_excel_raw(filename, headers) {
		const workbook = xlsx.readFile(filename);
		const sheets = Object.keys(workbook.Sheets);
		let rowArr = [];
		//---------------------
		sheets.forEach(sheet => {
			const ws = workbook.Sheets[sheet];
			const rows = xlsx.utils.sheet_to_json(ws);
			
			rows.forEach(row => {
				const time = {};
				Object.keys(row).forEach(key => {
					try {
						const ck = headers.find(hdr => hdr.label==key);
						time[ck.name] = row[key];
					} catch (e) {}
				})
				
				//----------------------------
				time.sheet = sheet;
				rowArr.push(time);
				//----------------------------
			})
		})
		//---------------------
		return rowArr;
	}

	//============================================
	read_excel_org(filename, headers) {
		const workbook = xlsx.readFile(filename);
		const sheets = Object.keys(workbook.Sheets);
		let rowArr = [];
		//---------------------
		sheets.forEach(sheet => {
			const ws = workbook.Sheets[sheet];
			const rows = xlsx.utils.sheet_to_json(ws);

			// headers.forEach(hdr => time[hdr.name] = '');
			
			rows.forEach(row => {
				row.sheet = sheet;
				rowArr.push(row);
			})
		})
		//---------------------
		return rowArr;
	}
		
  //============================================
  read_excel_all(filename, headers) {

    let names = [];
    let rowArr = [];

    let headerName = [];
    const workbook = xlsx.readFile(filename);
    const sheets = Object.keys(workbook.Sheets);
    const rows1 = xlsx.utils.sheet_to_json(workbook.Sheets[sheets[0]]);
		// console.log(filename);
		// console.log("+++", rows1.slice(0, 20)); return1;
		//----------------------------------
		const nameArr = getHeader(rows1, headers);
		//----------------------------------
		// console.log("-------", headers, nameArr);

		sheets.forEach(sheet => {
      const ws = workbook.Sheets[sheet];
      const rows = xlsx.utils.sheet_to_json(ws);
			console.log(`read_excel_all.sheet: ${sheet}, rows: ${rows.length}`, nameArr, );


			for (let no=0; no<rows.length; no++) {
				const row = {};
				nameArr.forEach(name => {
					row[name.name] = '';
					if (name.name != undefined) {
						if (typeof rows[no][name.key] == "number") {
							row[name.name] = rows[no][name.key] == undefined ? "" : rows[no][name.key].toString();
						} else {
							row[name.name] = rows[no][name.key] == undefined ? "" : rows[no][name.key].trim();
						}
					}
				})
				if (row.name == undefined || row.name == '' || headers[1].label.indexOf(row.name) < 0) {
					rowArr.push(row);
				}
			} 
			// console.log("rows: ", rows.slice(-1), rowArr.length, rowArr.slice(-1));
			// console.log("rows: ", rows.slice(0, 1), rowArr.length);
    })
    return rowArr;
  }
}
module.exports = Excel;

//============================================
function range_add_cell(range, cell) {
  var rng = xlsx.utils.decode_range(range);
  var c = typeof cell === 'string' ? xlsx.utils.decode_cell(cell) : cell;
  if (rng.s.r > c.r) rng.s.r = c.r;
  if (rng.s.c > c.c) rng.s.c = c.c;

  if (rng.e.r < c.r) rng.e.r = c.r;
  if (rng.e.c < c.c) rng.e.c = c.c;
  return xlsx.utils.encode_range(rng);
}

//============================================
function add_to_sheet(sheet, cell, type, raw) {
  // console.log( cell, type, raw);
  sheet['!ref'] = range_add_cell(sheet['!ref'], cell);
  sheet[cell] = { t: type, v: raw };
}
