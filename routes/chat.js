let express = require('express');
let router = express.Router();

/***********************************************************************/
// 画面表示
router.get('/', function (req, res) {
  try {
    res.render('chat_index');
  }
  catch(err) {
    console.log(err);
    res.status(500);
  }
});

module.exports = router;