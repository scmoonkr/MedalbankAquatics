const fs          = require('fs');
const Services = require('./magazine.service');


exports.MagazineController = {
  create: async (req, res, next) => {
    try {
        const result = await Services.create();
        res.json(result);
    } catch (err) {
        console.log("controller.magazines.create.catch.", err);
        next(err);
    }
  },
  detail: async (req, res, next) => {
    try {
        console.log("controller.magazines.detail.params.", req.params);
        const result = await Services.detail(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.magazines.detail.catch.", err);
        next(err);
    }
  },
  list: async (req, res, next) => {
    try {
        console.log("controller.magazines.list.body.", req.body);
        const result = await Services.list(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.magazines.list.catch.", err);
        next(err);
    }
  },
  downloadRanking: async (req, res, next) => {
    try {
        console.log("controller.magazines.downloadRanking.body.", req.params);
        const filename = await Services.downloadRanking(req.params);
        console.log("filename=", filename);

        // Services에서 filename 반환하도록 수정 필요
        res.download(filename, './ranking-all.xlsx', (err) => {
            if (err) console.log("download error", err);
            // 전송 후 파일 삭제 (선택)
            fs.unlink(filename, () => {});
        });
    } catch (err) {
        console.log("controller.magazines.downloadRanking.catch.", err);
        next(err);
    }
  },
  
  //####################################################################
  //######### Confirm ##################################################
  //####################################################################
  insert: async (req, res, next) => {
    try {
        console.log("controller.magazines.insert.body.", req.body);
        const result = await Services.insert(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.magazines.insert.catch.", err);
        next(err);
    }
  },
  update: async (req, res, next) => {
    try {
        console.log("controller.magazines.update.body.", req.body);
        const result = await Services.update(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.magazines.update.catch.", err);
        next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
        console.log("controller.magazines.delete.params.", req.params);
        const result = await Services.delete(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.magazines.delete.catch.", err);
        next(err);
    }
  },
}
