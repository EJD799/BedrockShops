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

export function editDefaultBalance(player) {
    let form = new ModalFormData();
    form.title("Edit Default Player Balance");
    form.submitButton("Done");
    form.textField("Default Player Balance", "Default Player Balance", world.getDynamicProperty("shops_defaultBalance").toString());
    form.show(player).then(r => {
	if ((r?.formValues?.length ?? 0) > 0) {
	    world.setDynamicProperty("shops_defaultBalance", r.formValues[0]);
	}
	dashboardUI(player);
    });
}

export function dashboardUI(player){
    if (player.getGameMode().toString() == "creative") {
	let form = new ActionFormData();
	form.title("Shop Dashboard");
	form.button("Default Player Balance: $" + world.getDynamicProperty("shops_defaultBalance").toString(), "textures/items/emerald");
	form.show(player).then(r => {
	    if (r.selection == 0) {
		editDefaultBalance(player);
	    }
	});
    } else {
	player.sendMessage("§cThe shop dashboard can only be used in creative mode");
    }
}