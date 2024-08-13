var express = require("express");
var session = require('express-session')
var router = express.Router();
const { v4: uuidv4 } = require('uuid')

// Bodyparser allows us to get data from ajax as json
var bodyParser = require('body-parser')
router.use(bodyParser.json())
let players = [];

// IMPORT CONTROLLERS
var player_controller = require("../controllers/playerController");
var start_controller = require("../controllers/startController");

/* GET home page. */
router.get("/lobby", async (req, res, next) => {
  res.render("lobby", { title: "Express"});
});

router.get("/", async (req, res, next) => {
  var user = req.session.user;
  res.render("index", { title: "Express", user: user, players: players});
});

// router.get("/startGame", player_controller.getUserInformation);
router.get("/startGame", async (req, res, next) => {
    res.redirect('/');
});

router.get("/getSpecificProperty/", async (req, res, next) => {
  console.log(req.query.fieldName);
  player_controller.getSpecificProperty(req, res);
});

// Route for setting username in session
router.post("/joinPlayer", async (req, res, next) => {
  req.session.user = req.body.data;
  req.session.save();
  players.push(req.body.data);
  player_controller.createPlayer(req, res);
});

// Route for deleting username from session
router.post("/leavePlayer", async (req, res, next) => {
  req.session.destroy();
  players = players.filter(e => e !== req.body.data);
  res.redirect('/lobby');
});

router.post('/userPayRent', (req, res) => {
  player_controller.chargeRent(req, res);
});

router.post('/api/chanceData', (req, res) => {
  player_controller.chanceData(req, res);
})

router.post('/endTurn', (req, res) => {
  player_controller.endTurn(req, res);
})

router.get("/user/:id", player_controller.getUserInformation);

router.get("/userByName",  (req, res) => {
  start_controller.getPlayer(req,res)
});


router.get("/getAllPlayers/",  (req, res) => {
    start_controller.getAllPlayers(req,res)
});

router.post("/userBuyProperty",  (req, res) => {
  player_controller.userBuyProperty(req, res)
});

router.post("/userSellProperty",  (req, res) => {
  player_controller.userSellProperty(req, res)
});
router.post("/UpOrDownGrade",  (req, res) => {
  player_controller.userUpgradeProperty(req, res)
});

router.post("/userPassStart", (req, res) => {
  player_controller.userPassStart(req,res)
});

module.exports = router;
