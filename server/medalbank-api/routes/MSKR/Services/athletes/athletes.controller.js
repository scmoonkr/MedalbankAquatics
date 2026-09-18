const Services = require('./athletes.service');
exports.AthleteController = {
  



  list: async (req, res, next) => {
    try {
        const result = await Services.list(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.list.catch.", err);
        next(err);
    }
  },
  listBackend: async (req, res, next) => {
    try {
        const result = await Services.listBackend(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.listBackend.catch.", err);
        next(err);
    }
  },
  names: async (req, res, next) => {
    try {
        const result = await Services.names(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.names.catch.", err);
        next(err);
    }
  },
  
  viewWithTimes: async (req, res, next) => {
    try {
        const result = await Services.viewWithTimes(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.viewWithTimes.catch.", err);
        next(err);
    }
  },
  
  view: async (req, res, next) => {
    try {
        const result = await Services.view(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.view.catch.", err);
        next(err);
    }
  },

  //-------------------------------------------
  detail: async (req, res, next) => {
    try {
        console.log("controller.athletes.detail.params.", req.params);
        const result = await Services.detail(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.detail.catch.", err);
        next(err);
    }
  },

  saveAthleteWithImage: async (req, res, next) => {
    try {
        const result = await Services.saveAthleteWithImage(req);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.saveAthleteWithImage.catch.", err);
        next(err);
    }
  },

  saveAthleteImage: async (req, res, next) => {
    try {
        const result = await Services.saveAthleteImage(req);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.saveAthleteImage.catch.", err);
        next(err);
    }
  },

  //####################################################################
  //######### Confirm ##################################################
  //####################################################################


  merge: async (req, res, next) => {
    try {
        const result = await Services.merge(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.merge.catch.", err);
        next(err);
    }
  },

  athletesGroup: async (req, res, next) => {
    try {
        const result = await Services.athletesGroup(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.athletesGroup.catch.", err);
        next(err);
    }
  },

  athletesCompetition: async (req, res, next) => {
    try {
        const result = await Services.athletesCompetition(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.athletesCompetition.catch.", err);
        next(err);
    }
  },

  importantAthletes: async (req, res, next) => {
    try {
        const result = await Services.importantAthletes(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.importantAthletes.catch.", err);
        next(err);
    }
  },

  noTimes: async (req, res, next) => {
    try {
        const result = await Services.noTimes(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.noTimes.catch.", err);
        next(err);
    }
  },

  top100Athletes: async (req, res, next) => {
    try {
        const result = await Services.top100Athletes(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.top100Athletes.catch.", err);
        next(err);
    }
  },

  selectedAthletes: async (req, res, next) => {
    try {
        const result = await Services.selectedAthletes(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.selectedAthletes.catch.", err);
        next(err);
    }
  },

  sameNameGenderTeam: async (req, res, next) => {
    try {
        const result = await Services.sameNameGenderTeam(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.sameNameGenderTeam.catch.", err);
        next(err);
    }
  },

  mergeSameNameGenderTeam: async (req, res, next) => {
    try {
        const result = await Services.mergeSameNameGenderTeam(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.mergeSameNameGenderTeam.catch.", err);
        next(err);
    }
  },

  splitAthletes: async (req, res, next) => {
    try {
        const result = await Services.splitAthletes(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.splitAthletes.catch.", err);
        next(err);
    }
  },

  //----------------------------------------
  //	동명이인 등록
  //----------------------------------------
  saveHomonym: async (req, res, next) => {
    try {
        const result = await Services.saveHomonym(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.saveHomonym.catch.", err);
        next(err);
    }
  },
  confirmAthletes: async (req, res, next) => {
    try {
        const result = await Services.confirmAthletes(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.confirmAthletes.catch.", err);
        next(err);
    }
  },

  /*
  *	희귀이름 조회
  *
  */
  uniqueAthletes: async (req, res, next) => {
    try {
        const result = await Services.uniqueAthletes(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.uniqueAthletes.catch.", err);
        next(err);
    }
  },

  insertUniqueAthlete: async (req, res, next) => {
    try {
        const result = await Services.insertUniqueAthlete(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.insertUniqueAthlete.catch.", err);
        next(err);
    }
  },

  removeUniqueAthlete: async (req, res, next) => {
    try {
        const result = await Services.removeUniqueAthlete(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.removeUniqueAthlete.catch.", err);
        next(err);
    }
  },

  unsetTimesAthleteID: async (req, res, next) => {
    try {
        const result = await Services.unsetTimesAthleteID(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.unsetTimesAthleteID.catch.", err);
        next(err);
    }
  },

  athleteTimes: async (req, res, next) => {
    try {
        const result = await Services.athleteTimes(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.athleteTimes.catch.", err);
        next(err);
    }
  },

  deleteAthleteTimes: async (req, res, next) => {
    try {
        const result = await Services.deleteAthleteTimes(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.deleteAthleteTimes.catch.", err);
        next(err);
    }
  },

  medalList: async (req, res, next) => {
    try {
        const result = await Services.medalList(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.medalList.catch.", err);
        next(err);
    }
  },

  viewMedalbank: async (req, res, next) => {
    try {
        const result = await Services.viewMedalbank(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.viewMedalbank.catch.", err);
        next(err);
    }
  },

  searchName: async (req, res, next) => {
    try {
        const result = await Services.searchName(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.searchName.catch.", err);
        next(err);
    }
  },

  insert: async (req, res, next) => {
    try {
        const result = await Services.insert(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.insert.catch.", err);
        next(err);
    }
  },

  update: async (req, res, next) => {
    try {
        const result = await Services.update(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.update.catch.", err);
        next(err);
    }
  },

  updateDelete: async (req, res, next) => {
    try {
        const result = await Services.updateDelete(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.updateDelete.catch.", err);
        next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
        const result = await Services.delete(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.delete.catch.", err);
        next(err);
    }
  },

  create: async (req, res, next) => {
    try {
        const result = await Services.create();
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.create.catch.", err);
        next(err);
    }
  },
}