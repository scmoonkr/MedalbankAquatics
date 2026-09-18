const Services = require('./times.service');



/* ??????
 *	times list
 */
exports.searchNames = async (req, res, next) => {
  try {
		req.body.rank = 8;
		const result = await Services.searchNames(req.body);
		res.json(result);
	} catch (err) {
			console.log("controller.times.searchNames.catch.", err);
			next(err);
	}
}
exports.notMyTime = async (req, res, next) => {
  try {
		const result = await Services.notMyTime(req.body);
		res.json(result);
	} catch (err) {
			console.log("controller.times.notMyTime.catch.", err);
			next(err);
	}
}
exports.searchNameStyle = async (req, res, next) => {
  try {
		req.body.rank = 8;
		const result = await Services.searchNameStyle(req.body);
		res.json(result);
	} catch (err) {
			console.log("controller.times.searchNameStyle.catch.", err);
			next(err);
	}
}

exports.view = async (req, res, next) => {
  try {
      const result = await Services.view(req.params);
      res.json(result);
  } catch (err) {
      console.log("controller.times.view.catch.", err);
      next(err);
  }
}

exports.list = async (req, res, next) => {
  try {
      const result = await Services.list(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.times.list.catch.", err);
      next(err);
  }
}
exports.saveTimeWithImageURL = async (req, res, next) => {
  try {
      const result = await Services.saveTimeWithImageURL(req);
      res.json(result);
  } catch (err) {
      console.log("controller.times.saveTimeWithImageURL.catch.", err);
      next(err);
  }
}
exports.saveTimeWithImage = async (req, res, next) => {
  try {
      const result = await Services.saveTimeWithImage(req);
      res.json(result);
  } catch (err) {
      console.log("controller.times.saveTimeWithImage.catch.", err);
      next(err);
  }
}
exports.saveTimeResult = async (req, res, next) => {
  try {
    req.body.limit = 3;
		const result = await Services.saveTimeResult(req.body);
		res.json(result);
	} catch (err) {
			console.log("controller.times.saveTimeResult.catch.", err);
			next(err);
	}
}
exports.saveTimeResultNew = async (req, res, next) => {
		// console.log("Service.times.saveTimeResultNew.body=", req.body);
  try {
    req.body.limit = 3;
		const result = await Services.saveTimeResultNew(req.body);
		res.json(result);
	} catch (err) {
			console.log("controller.times.saveTimeResultNew.catch.", err);
			next(err);
	}
}

/*
*	saveTimeResult
*/
exports.insertTimeResultMSKR = async (req, res, next) => {
  try {
    req.body.limit = 3;
		const result = await Services.insertTimeResultMSKR(req.body);
		res.json(result);
	} catch (err) {
			console.log("controller.times.insertTimeResultMSKR.catch.", err);
			next(err);
	}
}

exports.delete = async (req, res, next) => {
  try {
      const result = await Services.delete(req.params);
      res.json(result);
  } catch (err) {
      console.log("controller.times.delete.catch.", err);
      next(err);
  }
}

exports.deleteUpdate = async (req, res, next) => {
  try {
      const result = await Services.deleteUpdate(req.params);
      res.json(result);
  } catch (err) {
      console.log("controller.times.deleteUpdate.catch.", err);
      next(err);
  }
}

exports.deleteMSKR = async (req, res, next) => {
  try {
      const result = await Services.deleteMSKR(req.params);
      res.json(result);
  } catch (err) {
      console.log("controller.times.deleteMSKR.catch.", err);
      next(err);
  }
}


//####################################################################
//######### Confirm ##################################################
//####################################################################



exports.detail = async (req, res, next) => {
  try {
      const result = await Services.detail(req.params);
      res.json(result);
  } catch (err) {
      console.log("controller.times.detail.catch.", err);
      next(err);
  }
}

//####################################################################
//######### Confirm ##################################################
//####################################################################

/*
*	search names, style
* '홍길동 박문수 평형 자유형'
*/
exports.searchNamesStyles = async (req, res, next) => {
  try {
    req.body.limit = 100;
		const result = await Services.searchNamesStyles(req.body);
		res.json(result);
	} catch (err) {
			console.log("controller.times.searchNamesStyles.catch.", err);
			next(err);
	}
}
/*
*	Top 100
*/
exports.top100 = async (req, res, next) => {
  try {
    req.body.limit = 100;
		const result = await Services.ranking(req.body);
		res.json(result);
	} catch (err) {
			console.log("controller.times.top100.catch.", err);
			next(err);
	}
}

/*
*	Top 8
*/
exports.top8 = async (req, res, next) => {
  try {
    req.body.limit = 8;
		const result = await Services.rankingTopN(req.body);
		res.json(result);
	} catch (err) {
			console.log("controller.times.top8.catch.", err);
			next(err);
	}
}

/*
*	Top 1
*/
exports.top1 = async (req, res, next) => {
  try {
    req.body.limit = 1;
		const result = await Services.rankingTopN(req.body);
		res.json(result);
	} catch (err) {
			console.log("controller.times.rankingTopN.catch.", err);
			next(err);
	}
}

/*
*	leaderboard
*/
exports.latests = async (req, res, next) => {
  // try {
    req.body.limit = 3;
		const result = await Services.latests(req.body);
		res.json(result);
	// } catch (err) {
	// 		console.log("controller.times.latests.catch.", err);
	// 		next(err);
	// }
}

/*
*	heatsheets
*/
exports.heatsheets = async (req, res, next) => {
  try {
    req.body.limit = 3;
		const result = await Services.heatsheets(req.body);
		res.json(result);
	} catch (err) {
			console.log("controller.times.heatsheets.catch.", err);
			next(err);
	}
}
/*
 *	times list
 */
exports.backendList = async (req, res, next) => {
  try {
		req.body.rank = 8;
		const result = await Services.backendList();
		res.json(result);
	} catch (err) {
			console.log("controller.times.backendList.catch.", err);
			next(err);
	}
}

/*
 *	times list
 */
exports.medalists = async (req, res, next) => {
  try {
		const result = await Services.medalists();
		res.json(result);
	} catch (err) {
			console.log("controller.times.medalists.catch.", err);
			next(err);
	}
}

/*
 *	times list
 */
exports.records = async (req, res, next) => {
  try {
		const result = await Services.records();
		res.json(result);
	} catch (err) {
			console.log("controller.times.records.catch.", err);
			next(err);
	}
}

/*
 *	update times.athleteID
 */
exports.updateTimesAthleteID = async (req, res, next) => {
  try {
		req.body.rank = 8;
		const result = await Services.updateTimesAthleteID();
		res.json(result);
	} catch (err) {
			console.log("controller.times.updateTimesAthleteID.catch.", err);
			next(err);
	}
}

/*
 *	remove times.athleteID
 */
exports.removeTimesAthleteID = async (req, res, next) => {
  try {
		req.body.rank = 8;
		const result = await Services.updateTimesAthleteID();
		res.json(result);
	} catch (err) {
			console.log("controller.times.removeTimesAthleteID.catch.", err);
			next(err);
	}
}

/*
 *	times list
 */
exports.searchRanking = async (req, res, next) => {
  try {
		const result = await Services.searchRanking(req.body);
		res.json(result);
	} catch (err) {
			console.log("controller.times.searchRanking.catch.", err);
			next(err);
	}
}

exports.create = async (req, res, next) => {
  try {
      const result = await Services.create();
      res.json(result);
  } catch (err) {
      console.log("controller.times.create.catch.", err);
      next(err);
  }
}

exports.insert = async (req, res, next) => {
  try {
      console.log("controller.times.insert.body.", req.body);
      const result = await Services.insert(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.times.insert.catch.", err);
      next(err);
  }
}

exports.updateTimes = async (req, res, next) => {
  try {
      console.log("controller.times.updateTimes.body.", req.body);
      const result = await Services.updateTimes(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.times.updateTimes.catch.", err);
      next(err);
  }
}

exports.updateTimesMSKR = async (req, res, next) => {
  try {
      console.log("controller.times.updateTimesMSKR.body.", req.body);
      const result = await Services.updateTimesMSKR(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.times.updateTimesMSKR.catch.", err);
      next(err);
  }
}
//####################################################################
//######### Confirm ##################################################
//####################################################################

exports.update = async (req, res, next) => {
  try {
      console.log("controller.times.update.body.", req.body);
      const result = await Services.update(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.times.update.catch.", err);
      next(err);
  }
}

exports.updateDelete = async (req, res, next) => {
  try {
      console.log("controller.times.updateDelete.body.", req.body);
      const result = await Services.updateDelete(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.times.updateDelete.catch.", err);
      next(err);
  }
}