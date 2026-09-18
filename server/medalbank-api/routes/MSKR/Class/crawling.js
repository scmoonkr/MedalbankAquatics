const cheerio = require('cheerio');

'use strict';

class CrawlingClass {
	constructor(html="", baseSelector="") {
		this.html 				= html;
		this.baseSelector	= baseSelector;	// html의 anchor selector
    this.crawlingJSON	= {};
    this.crawlings 		= [];
    this.$ 						= cheerio.load(html);
	}

	//-----------------------------
	// getter
	//-----------------------------
	get html() 					{ return this._html }
	get crawlingJSON() 	{ return this._crawlingJSON }

	//-----------------------------
	// setter
	//-----------------------------
	set html(val) {
    this._html = val
    this.$ = cheerio.load(val);
  }
	set anchor(val) 			{ this._anchor = val }
	set crawlingJSON(val) { this._crawlingJSON = val }

	//---------------------------------------
	//	baseSelector가 있는경우
	//		selector가 'body', '#' 로 시작되면 ----> base selector 무시
	//		아니면 base selector.find(selector)
	//---------------------------------------
	getSelector(anchor) {
		let selector = this.baseSelector && anchor.slice(0, 4) != "body" && anchor.slice(0, 1) != "#"
										? this.$(this.baseSelector).find(anchor) 
										: this.$(anchor);
		return selector;
	}
  //---------------------------------
  //---------------------------------
  getData(anchor, fieldname, type) {
		let selectors = this.getSelector(anchor);
		let name = [];
		selectors.each((index, elem) => {
			switch (type) {
				case "html":
					name.push(selectors.html())
					break;
				case "text":
					name.push(selectors.text())
					break;
				case "src":
				case "href":
				default:
					name.push(selectors.attr(type))
					break;
			}
		})
		this._crawlingJSON[fieldname] = name;
		return name;
  }

  //---------------------------------
  //---------------------------------
  selectorsFunc(config) {
		//------------------------------------
		// config: { name:"images",   selector: "div > div ul > li > div", 
		// 		selectors: [
		// 			{ name:"image",   type:"src", selector: "img",   },
		// 		]
		// },
		//------------------------------------
		let selectors = this.getSelector(config.selector);
    console.log("1----------------", config.selector, selectors.length);
    const childArr = [];
		//--------------------------
		selectors.each((index, elem) => {
      console.log("2----------------", index, this.$(elem).length);
      const childObj = {};
      //-------------------------
      //-------------------------
      //-------------------------
      for (const record of config.selectors) {
        const childPtr = record.selector
														? this.$(elem).find(record.selector)
														: this.$(elem);		
console.log("childPtr=", childPtr.length, record.selector);										
				//========================
				//	selectors > selectors
				//========================
        if (record.selectors) {
          //----------->
					const obj = {};
          for (const loop of record.selectors) {
						try {
							const ptr = loop.selector ? childPtr.find(loop.selector) : childPtr;
							obj[loop.name] = [];
							ptr.each((idx, el) => {
								let val = "";
								if (loop.type=="text") {
									val = this.$(el).text();
								} else if (loop.type=="html") {
									val = this.$(el).html();
								} else {
									val = this.$(el).attr(loop.type)
								}
								obj[loop.name].push(val);
							})
							childObj[record.name] = obj;	
						} catch (e) {
							console.log("4----->selectors.selectors.catch.", e);
						}
          }
          //----------->
        }
				//========================
				//	selectors > children
				//========================
				else if (record.children) {
          //----------->
          const obj = {};
          record.children.forEach(loop => {
            const ptr = childPtr.eq(loop.eq);
            obj[loop.name] = [];
						ptr.each((idx, el) => {
							let val = "";
              if (loop.type=="text") {
								val = this.$(el).text();
							} else if (loop.type=="html") {
								val = this.$(el).html();
							} else {
								val = this.$(el).attr(loop.type)
							}
							obj[loop.name].push(val);
						})
						childObj[record.name] = obj;	
          })
          //----------->
        }
				//========================
				//	selectors > data
				//========================
				else {
          //----------->
					try {
						childObj[record.name] = childObj[record.name] || [];
						childPtr.each((idx, el) => {
							let val = "";
							if (record.type=="text") {
								val = this.$(el).text();
							} else if (record.type=="html") {
								val = this.$(el).html();
							} else {
								val = this.$(el).attr(record.type)
							}
							childObj[record.name].push(val);						
						})	
					} catch (e) {
						console.log("7-----> selectors.data.catch.", e);
					}
          //----------->
        }
				//========================
      }
      //-------------------------
      //-------------------------
      //-------------------------
      childArr.push(childObj);
    })
		this._crawlingJSON[config.name] = childArr;
    return this._crawlingJSON[config.name];

  }
	
  //---------------------------------
  //---------------------------------
  childrenFunc(config) {
		this._crawlingJSON[config.name] = [];
		let selectors = this.getSelector(config.selector);
		//--------------------------
    selectors.each((index, elem) => {
			const childArr = {};
      let childPtr = this.$(elem).children();
      config.children.forEach(record => {
				let ptr = this.$(childPtr).eq(record.eq);
				//========================
				//	children > selectors
				//========================
        if (record.selectors) {
          //----------->
          childArr[record.name] = []
          const obj = {};
          if (record.selector) {
						ptr = ptr.find(record.selector);
					}
          for (const loop of record.selectors) {
            const childPtr = ptr.find(loop.selector);
            if (loop.type=="text") {
              obj[loop.name] = childPtr.text();
            } else if (loop.type=="html") {
                obj[loop.name] = childPtr.html();
            } else {
              obj[loop.name] = childPtr.attr(loop.type)
            }
          }
          childArr[record.name].push(obj);
          //----------->
        }
				//========================
				//	children > children
				//========================
				else if (record.children) {
          //----------->
          const obj = {};
          if (record.selector) {
						ptr = ptr.find(record.selector);
					}
          record.children.forEach(loop => {
            const childPtr = ptr.eq(loop.eq);
            if (loop.type=="text") {
              obj[loop.name] = childPtr.text();
            } else if (loop.type=="html") {
                obj[loop.name] = childPtr.html();
            } else {
              obj[loop.name] = childPtr.attr(loop.type)
            }
          })
          childArr[record.name] = obj;
          //----------->
        }
				//========================
				//	children > data
				//========================
				else {
          //----------->
          if (record.selector) {
						ptr = this.$(childPtr).eq(record.eq).find(record.selector);
					}
					const obj = [];
					ptr.each((idx, el) => {
						if (record.type == "text" ) {
							obj.push(el.text());
						} else if (record.type == "html") {
							obj.push(el.html());
						} else {
							obj.push(el.attr(record.type));
						}
					});
          childArr[record.name] = obj;;
          //----------->
        }
				//========================

      })
			this._crawlingJSON[config.name].push(childArr);
    })
		this._crawlingJSON[config.name] = this._crawlingJSON[config.name];
    return this._crawlingJSON[config.name];
  }

  parsingPage(config) {

    for (const record of config) {
      if (record.selectors) {
        this.selectorsFunc(record);
      } else if (record.children) {
        this.childrenFunc(record); 
      } else {
        this.getData(this.$(record.selector), record.name, record.type);
      }
    }
    return this.crawlingJSON;
  }


  parsingPageNew(parsing) {

    // let ptr = this.$(`#Myform > div:nth-child(2) > div.ss_book_box > table > tbody > tr`)
    // console.log("5>", ptr.length);
    // ptr = this.$(ptr).find("td > table > tbody > tr > td > div.cover_area > a > div.flipcover_out > div.flipcover_in > img.front_cover")
    // console.log("6>", ptr.length);
// process.exit();

    for (const record of parsing) {
      if (record.selectors) {
        this.selectorsFunc(record);
      } else if (record.children) {
        this.childrenFunc(record); 
      } else {
        this.getData(this.$(record.selector), record.name, record.type);
      }
    }
    return this.crawlingJSON;
  }
}

module.exports = CrawlingClass;
