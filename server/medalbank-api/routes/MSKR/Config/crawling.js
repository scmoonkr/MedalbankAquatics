
exports.Crawling = {
	userAgent 		: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
	site 					: "tradeInn",
	homeURL 			: "https://www.tradeinn.com",
	headless 			: true,	// false: page보여줌
	timeout 			: 50000,	// 50 sec.
	imageLoading 	: false,	// true: image loading, false: not loading
	infinityScroll: {
		scroll 			: true,		// goto.page 후 infinity scroll
		height 			: 800,		// scroll 할 height(pixels)
		delay				: 400,		// scroll 후 delay(ms)
	},
	waitSelctor		: "",			// goto.page 후 wait selecotor
	waitTimeout		: 100,			// goto.page 후 wait(ms)
	noOfPage 			: 5,			// Promiss.all 숫자(동시에 crawling할 page수)
}
