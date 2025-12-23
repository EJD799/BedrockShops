import { world, system } from "@minecraft/server";

export function getShopId(shopX, shopY, shopZ) {
    var shopXChange = shopX;
    var shopYChange = shopY;
    var shopZChange = shopZ;

    if (shopX < 0) {
	shopXChange = "b" + (0 - shopX);
    } else {
	shopXChange = "a" + shopX;
    }

    if (shopY < 0) {
	shopYChange = "b" + (0 - shopY);
    } else {
	shopYChange = "a" + shopY;
    }

    if (shopZ < 0) {
	shopZChange = "b" + (0 - shopZ);
    } else {
	shopZChange = "a" + shopZ;
    }

    return shopXChange + "_" + shopYChange + "_" + shopZChange;
}

export function getShopCoords(shopId) {
    var shopIdList = shopId.split("_");
    var shopX = Number(shopIdList[0].replace("a", "").replace("b", "-"));
    var shopY = Number(shopIdList[1].replace("a", "").replace("b", "-"));
    var shopZ = Number(shopIdList[2].replace("a", "").replace("b", "-"));
    return [shopX, shopY, shopZ];
}