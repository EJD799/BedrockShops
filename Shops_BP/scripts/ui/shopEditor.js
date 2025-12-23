import { ModalFormData, MessageFormData, ActionFormData } from "@minecraft/server-ui";
import { world, system } from "@minecraft/server";
import { getShopId, getShopCoords } from "../idLib.js";
import { runSimpleCommand } from "./shopViewer.js";

// Main Menu
export function shopEditorUI(player, block){
    let shopId = getShopId(block.x, block.y, block.z);
    let shop1 = world.getDynamicProperty(shopId + "_itemid");
    let shop2, shop3, shop4, shop5;
    if (world.getDynamicProperty(shopId + "_buy") == true) {
	shop2 = world.getDynamicProperty(shopId + "_buyprice");
	shop3 = world.getDynamicProperty(shopId + "_buyquantity");
    } else {
	shop2 = 0;
	shop3 = 0;
    }
    if (world.getDynamicProperty(shopId + "_sell") == true) {
	shop4 = world.getDynamicProperty(shopId + "_sellprice");
	shop5 = world.getDynamicProperty(shopId + "_sellquantity");
    } else {
	shop4 = 0;
	shop5 = 0;
    }

    let form = new ModalFormData();
    form.title("Shop Editor");
    form.textField("Item ID", "Enter an item ID", shop1);
    form.toggle("Enable Buying", (shop3 != 0));
    form.textField("Buy Price", "Enter a number", shop2.toString());
    form.textField("Buy Quantity", "Enter a number", shop3.toString());
    form.toggle("Enable Selling", (shop5 != 0));
    form.textField("Sell Price", "Enter a number", shop4.toString());
    form.textField("Sell Quantity", "Enter a number", shop5.toString());
    form.submitButton("Save");
    form.show(player).then(r => {
	if (world.getDynamicProperty(shopId + "_itemid") != r.formValues[0]) {
	    dropItems(player, world.getDynamicProperty(shopId + "_itemid"), world.getDynamicProperty(shopId + "_stock"));
	    world.setDynamicProperty(shopId + "_stock", 0);
	}
	world.setDynamicProperty(shopId + "_itemid", r.formValues[0]);
	world.setDynamicProperty(shopId + "_buy", r.formValues[1]);
	world.setDynamicProperty(shopId + "_buyprice", Number(r.formValues[2]));
	world.setDynamicProperty(shopId + "_buyquantity", Number(r.formValues[3]));
	world.setDynamicProperty(shopId + "_sell", r.formValues[4]);
	world.setDynamicProperty(shopId + "_sellprice", Number(r.formValues[5]));
	world.setDynamicProperty(shopId + "_sellquantity", Number(r.formValues[6]));
    });
}

export function shopEditorMenu(player, block){
    let shopId = getShopId(block.x, block.y, block.z);
    let itemId = world.getDynamicProperty(shopId + "_itemid");
    let form = new ActionFormData();
    form.title("Shop Editor");
    form.button(itemId, "textures/items/" + itemId.replace("minecraft:", ""));
    form.button("Edit Shop Details", "textures/items/shop_editor");
    form.button("Add/Remove Items", "textures/shopgui/move_items");
    form.show(player).then(r => {
	if (r.selection == 1) {
	    shopEditorUI(player, block);
	}
	if (r.selection == 2) {
	    if (world.getDynamicProperty(shopId + "_itemid") == "") {
		player.sendMessage("§cPlease specify an item ID first");
	    } else {
		moveItemsMenu(player, block);
	    }
	}
    });
}

export function moveItemsMenu(player, block){
    let shopId = getShopId(block.x, block.y, block.z);
    let currentStock = world.getDynamicProperty(shopId + "_stock");
    let form = new ModalFormData();
    form.title("Add/Remove Items");
    form.dropdown("Current Stock: " + currentStock, ["Add", "Remove"], 0);
    form.slider("Quantity", 0, 64, 1, 1);
    form.show(player).then(r => {
	if (r.formValues[0].toString() == "0") {
	    world.setDynamicProperty(shopId + "_stock", currentStock + r.formValues[1]);
	    runSimpleCommand("clear " + player.name + " " + world.getDynamicProperty(shopId + "_itemid") + " 0 " + r.formValues[1]);
	}
	if (r.formValues[0].toString() == "1") {
	    world.setDynamicProperty(shopId + "_stock", currentStock - r.formValues[1]);
	    runSimpleCommand("give " + player.name + " " + world.getDynamicProperty(shopId + "_itemid") + " " + r.formValues[1]);
	}
    });
}

export function dropItems(player, itemid, quantity) {
    runSimpleCommand("give " + player.name + " " + itemid + " " + quantity);
}