const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
class Player {
    constructor(id){
        this.id = id;
    };

    getId(){
        return this.id
    };

    static find = async (id, ctx) => {
        let usr = {
            where: { id: id },
            include: {
                properties: true,
            },
        };
        if(ctx === null){
            return await prisma.user.findUnique(usr);
        } else {
            return await ctx.prisma.user.findUnique(usr);
        }
    };

    static findByName = async (name, ctx) => {
        let usr = {
            where: { name: name },
            include: {
                properties: true,
            },
        };
        if (ctx === null){
            return await prisma.user.findUnique(usr);
        } else {
            return await ctx.prisma.user.findUnique(usr);
        }
    };
    
    static async buyProperty(propertyId, user, ctx){
        let findWhere =  {where: {id: parseInt(propertyId)}};
        let propertyInfo;
        if (ctx === null){
            propertyInfo = await prisma.property.findUnique(findWhere);
        } else {
            propertyInfo = await ctx.prisma.property.findUnique(findWhere);
        }
        
        if(!propertyInfo.owned){
            let updateWhere = {
                where: {id: parseInt(propertyInfo.id)}, 
                data: {
                    userId: user.id,
                    owned: true, 
                },
            };

            let updateProperty;

            if (ctx === null){
                updateProperty = await prisma.property.update(updateWhere);
            } else {
                updateProperty = await ctx.prisma.property.update(updateWhere);
            }

            await this.updateMoney(user.id, -propertyInfo.price, ctx);

            console.log('Property bought');

            return updateProperty;

        } else {
            console.log('Property is already owned');
        }
    };

    static async sellProperty(propertyId, user, ctx) {
        let findWhere =  {where: {id: parseInt(propertyId)}};
        let propertyInfo;
        if (ctx === null){
            propertyInfo = await prisma.property.findUnique(findWhere);
        } else {
            propertyInfo = await ctx.prisma.property.findUnique(findWhere);
        }

        if(propertyInfo.userId == user.id){
            let updateWhere = {
                where: {id: parseInt(propertyId)}, 
                data: {
                    userId: null,
                    owned: false, 
                    houses: 0,
                    rent: parseInt(propertyInfo.price * 0.3)
                },
            };

            let updateProperty;
            
            if (ctx === null){
                updateProperty = await prisma.property.update(updateWhere);
            } else {
                updateProperty = await ctx.prisma.property.update(updateWhere);
            }

            await this.updateMoney(user.id, propertyInfo.price, ctx); 

            console.log('Property sold');

            return updateProperty;

        } else {
            console.log('This property does not belong to this player');
        }
    };

    static async upgradeProperty(propertyId, user, ctx) {
        let maxHouses = 4;
        let rentIncreaseRate = 1.3;
        let housePriceRate = 0.2;
        let findWhere = {where: {id: parseInt(propertyId)}};
        let propertyInfo;
        if (ctx === null) {
            propertyInfo = await prisma.property.findUnique(findWhere);
        } else {
            propertyInfo = await ctx.prisma.property.findUnique(findWhere);
        }
        
        if(propertyInfo.userId === user.id && propertyInfo.houses < maxHouses){ //The right user buys and property does not reach max houses
            let updateWhere = {
                where: {id: parseInt(propertyId)}, 
                data: {
                    houses: parseInt(propertyInfo.houses) + parseInt(1),
                    rent: Math.round(propertyInfo.rent * rentIncreaseRate),
                },
            };

            let updateProperty;

            if (ctx === null) {
                updateProperty = await prisma.property.update(updateWhere);
            } else {
                updateProperty = await ctx.prisma.property.update(updateWhere);
            }

            await this.updateMoney(user.id, -(propertyInfo.price * housePriceRate), ctx);

            console.log('Property upgraded');

            return updateProperty;

        } else {
            return propertyInfo;
        }
    };

    static payRent = async (fromPlayer, toPlayer, amount, ctx) => {
        // Charge the player
        await this.updateMoney(fromPlayer, -amount, ctx);
        await  this.updateMoney(toPlayer, amount, ctx)
    };

    static async updateMoney(playerID, changeAmount, ctx){
        console.log('fra updatemoney er playerId = ', playerID);
        let findWhere = {
            where: {id: parseInt(playerID)}
        };

        let userInfo;

        if (ctx === null) {
            userInfo = await prisma.user.findUnique(findWhere);
        } else {
            userInfo = await ctx.prisma.user.findUnique(findWhere);
        }

        let newBalance = userInfo.money + changeAmount;
        let updateWhere = {
            where: {id: parseInt(playerID)},
            data: {money: Math.round(newBalance)},
            include: {properties: true},
        };

        if (ctx === null) {
            return await prisma.user.update(updateWhere);
        } else {
            return await ctx.prisma.user.update(updateWhere);            
        }
    };

    static getAllPlayers = async (players) => {
        const users =  await prisma.user.findMany({
            where: {
                name: { in: players },
            },
            include: {
                properties: true,
            }
        });
        return users;
    };
}

module.exports = Player;
