var Player = require("../models/Player");
var Property = require("../models/PropertyTile");
var Chance = require("../models/ChanceTileModel");
const { PrismaClient } = require("@prisma/client");
var session = require("express-session");
const prisma = new PrismaClient();

let playerUser;

module.exports = class player {
   static async getUserInformation(req, res, next) {
      try {
         const user = await Player.find(1);
         res.json(user);
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   }

   static async createPlayer(req,res,next) {
      try {
         const user = await prisma.user.upsert({
            where: {
              name: req.body.data,
            },
            update: { money: 16000},
            create: {
              name: req.body.data,
              money: 16000,
            },
          })
         playerUser = new Player(user.id);
         res.json(user);
      } catch (error) {
         res.status(500).json({error: error.message})
      }
   }

   static async userBuyProperty(req, res){
      try {
         const property = await Player.buyProperty(req.body.propertyID, req.body.user, null);
         const user = await Player.findByName(req.body.user.name, null)
         res.send(
            {property: property,
            user: user,
            message: "You have successfully bought"
            });
      } catch (error) {
         res.status(500).json({error: error.message})
      }
   }

   static async userSellProperty(req, res){
      try {
         const property = await Player.sellProperty(req.body.propertyID, req.body.user, null)
         const user = await Player.findByName(req.body.user.name, null)
         res.send(
            {property: property,
            user: user,
            message: "You have successfully sold"
            });
      } catch (error) {
         res.status(500).json({error: error.message})
      }
   }
      
   static async userUpgradeProperty(req, res){
      try {
         const property = await Player.upgradeProperty(req.body.propertyID, req.body.user, null);
         const user = await Player.findByName(req.body.user.name, null)
         res.send(
            {property: property,
            user: user,
            message: "You have successfully upgraded"
         });
      } catch (error) {
         res.status(500).json({error: error.message})
      }
   }

    static async chargeRent(req, res, next) {
        try {
            // Get the property
            const propertyToCharge = await Property.getProperty(req.body.property.name);

            // Get the player
            
            await Player.payRent(req.body.playerId, propertyToCharge.userId, propertyToCharge.rent, null);
            
            const playerToCharge = await Player.find(req.body.playerId, null);
            console.log(playerToCharge);
            res.send(
               {
               user: playerToCharge,
               message: "You have successfully paid " + propertyToCharge.rent + " in rent"
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
	
	static async chanceData(req, res) {
		try {
			let User = await Chance.changeMoney(req.body.playerUser, req.body.quote);
         console.log(User);
         res.json(User);
		}
		catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

   static async getSpecificProperty(req, res) {
      try {
         let specificProperty = await Property.getProperty(req.query.fieldName);
         res.send(specificProperty);
      }
      catch (error) {
         res.status(500).json({ error: error.message });
      }
   }

   static async userPassStart(req, res) {
      try {
         console.log('player_controller = ', req.body.playerId);
         let playerUpdate = await Player.updateMoney(req.body.playerId, req.body.changeAmount, null);
         res.send(playerUpdate);
      }
      catch (error) {
         res.status(500).json({ error: error.message });
      }
   }
};
