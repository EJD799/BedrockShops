import { ModalFormData, MessageFormData, ActionFormData } from "@minecraft/server-ui";
import { world, system } from "@minecraft/server";
import { getShopId, getShopCoords } from "../idLib.js";

let scoreboard = world.scoreboard;
let objective = scoreboard.getObjective("Balance");
if (!objective) {
    objective = scoreboard.addObjective("Balance", "Balance");
}

export function runSimpleCommand(cmd) {
    return world.getDimension("overworld").runCommand(cmd);
}

// Main Menu
export function shopViewerUI(player, buyPrice, buyQuantity, sellPrice, sellQuantity, itemId, shopId){
    let form = new ActionFormData();
    form.title("Shop (" + itemId + ")");
    form.button(itemId, "textures/items/" + itemId.split(":")[1]);
    if (buyQuantity != 0) {
	if ((world.getDynamicProperty(shopId + "_type") == "admin") || (world.getDynamicProperty(shopId + "_type") == "player" && world.getDynamicProperty(shopId + "_stock") > 0)) {
            form.button("Buy (" + buyQuantity + "/$" + buyPrice + ")", "textures/shopgui/buy");
	} else {
	    form.button("§8Buy (" + buyQuantity + "/$" + buyPrice + ")§r §c§lOUT OF STOCK", "textures/shopgui/buy_nostock");
	}
    }
    if (sellQuantity != 0) {
        form.button("Sell (" + sellQuantity + "/$" + sellPrice + ")", "textures/shopgui/sell");
    }
    form.show(player).then(r => {
	if (r.selection == 0) {
	    player.sendMessage("Shop Item: " + itemId);
	}
	if (r.selection == 1 && buyQuantity != 0) {
	    if ((world.getDynamicProperty(shopId + "_type") == "admin") || (world.getDynamicProperty(shopId + "_type") == "player" && world.getDynamicProperty(shopId + "_stock") > 0)) {
		buyMenu(player, buyPrice, buyQuantity, itemId, shopId);
	    } else {
		player.sendMessage("§cThis shop is out of stock");
	    }
	}
	if ((r.selection == 2) || (buyQuantity == 0 && r.selection == 1)) {
	    sellMenu(player, sellPrice, sellQuantity, itemId, shopId);
	}
    });
}

export function buyMenu(player, price, quantity, itemId, shopId){
    let identity = player.scoreboardIdentity;
    let balance = objective.getScore(identity) ?? 0;
    let form = new ModalFormData();
    form.title("Buy Items");
    form.slider(("Quantity (" + quantity + "/$" + price + ")"), 0, 64, quantity, quantity);
    form.show(player).then(r => {
	if (balance >= r.formValues[0]*(price/quantity)) {
	    if (world.getDynamicProperty(shopId + "_stock") >= r.formValues[0]) {
		player.sendMessage("You have bought " + r.formValues[0] + "x " + itemId + " for $" + (r.formValues[0]*(price/quantity)));
		objective.setScore(identity, balance - (r.formValues[0]*(price/quantity)));
		runSimpleCommand("give " + player.name + " " + itemId + " " + r.formValues[0]);
		world.setDynamicProperty(shopId + "_stock", world.getDynamicProperty(shopId + "_stock") - r.formValues[0]);
	    } else {
		player.sendMessage("§cInsufficient shop stock! (" + r.formValues[0].toString() + ">" + world.getDynamicProperty(shopId + "_stock").toString() + ")");
	    }
	} else {
	    player.sendMessage("§cInsufficient Balance!");
	}
    });
}

export function sellMenu(player, price, quantity, itemId, shopId){
    let identity = player.scoreboardIdentity;
    let balance = objective.getScore(identity) ?? 0;
    let form = new ModalFormData();
    form.title("Sell Items");
    form.slider(("Quantity (" + quantity + "/$" + price + ")"), 0, 64, quantity, quantity);
    form.show(player).then(r => {
	if (true) {
	    player.sendMessage("You have sold " + r.formValues[0] + "x " + itemId + " for $" + (r.formValues[0]*(price/quantity)));
	    objective.setScore(identity, balance + (r.formValues[0]*(price/quantity)));
	    runSimpleCommand("clear " + player.name + " " + itemId + " 0 " + r.formValues[0]);
	    world.setDynamicProperty(shopId + "_stock", world.getDynamicProperty(shopId + "_stock") + r.formValues[0]);
	} else {
	    player.sendMessage("§cInsufficient Items!");
	}
    });
}