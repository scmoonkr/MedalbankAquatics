const pdf2excel = require('pdf-to-excel');

let inputPDF = 'path/to/input.pdf';
inputPDF = "pdf/1140 제9회 서울특별시연맹회장배 수영대회 기록지.pdf";
inputPDF = "1295 수영대회 최종기록 23.07.16.pdf";
inputPDF = "1280 제3회 창원시수영연합회장배 전국 마스터즈 수영대회 기록지(개혼 접영 계영).pdf";
// inputPDF = "test.pdf";

const outputExcel = 'output.xlsx';

try {
  const options = {
    // when current pdf page number changes call this function(optional)
    onProcess: (e) => console.warn(`${e.numPage} / ${e.numPages}`),
    // pdf start page number you want to convert (optional, default 1)
    start: 1,
    // pdf end page number you want to convert (optional, default )
    end: 6,
  }

  pdf2excel.genXlsx(inputPDF, outputExcel, options);
} catch (err) {
  console.error(err);
}

// pdf2excel.genXlsx(inputPDF, outputExcel, (err) => {
//   if (err) {
//     console.error('Conversion failed:', err);
//   } else {
//     console.log('Conversion successful! Excel file saved:', outputExcel);
//   }
// });
