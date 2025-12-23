import { world, system } from "@minecraft/server";
import { shopViewerUI } from "./ui/shopViewer.js";
import { shopEditorUI, shopEditorMenu, dropItems } from "./ui/shopEditor.js";
import { dashboardUI } from "./ui/dashboard.js";
import { getShopId, getShopCoords } from "./idLib.js";

world.beforeEvents.worldInitialize.subscribe(data => {
    data.itemComponentRegistry.registerCustomComponent("shops:use_dashboard", {
        onUse: ({source: player, itemStack: item}) => {
            if(item.typeId == "shops:shop_dashboard") dashboardUI(player)
        }
    });

    data.blockComponentRegistry.registerCustomComponent(
	"shops:claim_interact",
	{
	    onPlayerInteract() {}
	}
    );
});

if (world.getDynamicProperty("shops_init") != true) {
    world.setDynamicProperty("shops_init", true);
    world.setDynamicProperty("shops_defaultBalance", 0);
}

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    const player = event.player;
    const block = event.block;
    const heldItem = event.beforeItemStack;

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

    let heldItemType = heldItem?.typeId ?? "";

    if (heldItemType == "shops:shop_editor" || heldItemType == "minecraft:gold_block") {
	if (block.typeId == "shops:admin_shop") {
	    if (player.getGameMode().toString() == "creative") {
		shopEditorUI(player, block);
	    } else {
		player.sendMessage("§cAdmin shops can only be edited, placed, and destroyed in creative mode");
	    }
	}
	if (block.typeId == "shops:player_shop") {
	    if (player.name == world.getDynamicProperty(shopId + "_owner") || player.getGameMode().toString() == "creative") {
	        shopEditorMenu(player, block);
	    } else {
		player.sendMessage("§cYou do not own this shop");
	    }
	}
    } else {
	if (block.typeId == "shops:admin_shop") {
	    shopViewerUI(player, shop2, shop3, shop4, shop5, shop1, shopId);
	}
	if (block.typeId == "shops:player_shop") {
	    shopViewerUI(player, shop2, shop3, shop4, shop5, shop1, shopId);
	}
    }
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
    const player = event.player;
    const block = event.block;
    const blockTypeId = event.brokenBlockPermutation.type.id;
    let shopId = getShopId(block.x, block.y, block.z);
    if ((blockTypeId == "shops:admin_shop" && player.getGameMode().toString() == "creative") || (blockTypeId == "shops:player_shop" && (player.name == world.getDynamicProperty(shopId + "_owner") || player.getGameMode().toString() == "creative"))) {
	if (blockTypeId == "shops:player_shop") {
	    dropItems(player, world.getDynamicProperty(shopId + "_itemid"), world.getDynamicProperty(shopId + "_stock"));
	}
	world.setDynamicProperty(shopId + "_type", "");
	world.setDynamicProperty(shopId + "_stock", 0);
	world.setDynamicProperty(shopId + "_owner", "");
	world.setDynamicProperty(shopId + "_itemid", "");
	world.setDynamicProperty(shopId + "_buy", false);
	world.setDynamicProperty(shopId + "_buyprice", 0);
	world.setDynamicProperty(shopId + "_buyquantity", 0);
	world.setDynamicProperty(shopId + "_sell", false);
	world.setDynamicProperty(shopId + "_sellprice", 0);
	world.setDynamicProperty(shopId + "_sellquantity", 0);
	player.sendMessage("Shop successfully deleted");
    } else {
	if (blockTypeId == "shops:admin_shop") {
	    player.sendMessage("§cAdmin shops can only be edited, placed, and destroyed in creative mode");
	    let vector = {x: block.x, y: block.y, z: block.z};
	    world.getDimension("overworld").setBlockType(vector, "shops:admin_shop");
	}
	if (blockTypeId == "shops:player_shop") {
	    player.sendMessage("§cYou do not own this shop");
	    let vector = {x: block.x, y: block.y, z: block.z};
	    world.getDimension("overworld").setBlockType(vector, "shops:player_shop");
	}
    }
});

world.afterEvents.playerPlaceBlock.subscribe((event) => {
    const player = event.player;
    const block = event.block;
    let shopId = getShopId(block.x, block.y, block.z);
    if ((block.typeId == "shops:admin_shop" && player.getGameMode().toString() == "creative") || block.typeId == "shops:player_shop") {
	if (block.typeId == "shops:player_shop") {
	    world.setDynamicProperty(shopId + "_type", "player");
	    world.setDynamicProperty(shopId + "_owner", player.name);
	} else {
	    world.setDynamicProperty(shopId + "_type", "admin");
	    world.setDynamicProperty(shopId + "_owner", "a");
	}
	world.setDynamicProperty(shopId + "_stock", 0);
	world.setDynamicProperty(shopId + "_itemid", "minecraft:emerald");
	world.setDynamicProperty(shopId + "_buy", true);
	world.setDynamicProperty(shopId + "_buyprice", 4);
	world.setDynamicProperty(shopId + "_buyquantity", 1);
	world.setDynamicProperty(shopId + "_sell", true);
	world.setDynamicProperty(shopId + "_sellprice", 3);
	world.setDynamicProperty(shopId + "_sellquantity", 1);
    } else if (block.typeId == "shops:admin_shop") {
	player.sendMessage("§cAdmin shops can only be edited, placed, and destroyed in creative mode");
	let vector = {x: block.x, y: block.y, z: block.z};
	world.getDimension("overworld").setBlockType(vector, "minecraft:air");
    }
});