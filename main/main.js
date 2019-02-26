const fun = require('../main/datbase');

function split(inputs) {
    //根据“-”分割输入
    let splitInput = [];
    inputs.forEach((code) => {
        if(code.indexOf("-") > -1){
            let record = code.split("-");
            splitInput.push({code:record[0],count:record[1]})
        }else{
            splitInput.push({code:code,count:1})
        }
    })
    return splitInput;
}
function group(splitInput) {
    //对商品id进行分组
    let groupInput = [];
    splitInput.forEach((item) => {
        let entry = groupInput.find((e) => e.code === item.code);
        if(entry){
            entry.count ++;
        }else{
            groupInput.push({code:item.code,count:item.count});
        }
    })
    return groupInput;
}
function handleInputs(inputs) {
    //对条目进行分割
    let splitInput = split(inputs);
    //分组统计商品数目
    let groupInput = group(splitInput);
    return groupInput;
}

function computePrice(input,items,promotionBarcode) {
    //根据商品id匹配，获取商品价格，并匹配优惠信息中的商品id，计算优惠后的商品信息
    let priceInfo = [];
    input.forEach((goods) => {
        let entry = items.find((item) => {
            return item.barcode === goods.code;
        });

        let entryPromotion = promotionBarcode.find((item2) => {
            return item2 === goods.code;
        });

        let promotionNumber;
        if(entryPromotion){
            promotionNumber = goods.count % 2;
        }else{
            promotionNumber = 0;
        }

        let totalprice = (goods.count - promotionNumber)  * entry.price;

        priceInfo.push({
            barcode:entry.barcode,name:entry.name,count:goods.count,sendCount:promotionNumber,
            unit:entry.unit,price:entry.price,total:totalprice
        });
    })
    return priceInfo;
}

function getPromotioninfo(info) {
    //获取优惠信息详情
    let promotionInfo = [];
    info.forEach((promotion) => {
        if (promotion.sendCount > 0) {
            promotionInfo.push({
                name:promotion.name,count:promotion.sendCount,unit:promotion.unit
            }
        )};
    })
    return promotionInfo;
}

function getSummaryinfo(info) {
    let summaryInfo = [];
    let summary = 0;
    let promotionSummary = 0;

    for (item in info) {
        summary = summary + info[item].total;
        promotionSummary += info[item].sendCount * info[item].price;
    }
    summaryInfo.push({
        summary: summary, promotionSummary: promotionSummary
    })
    return summaryInfo;
}

function printResult(priceInfo, promotionInfo, summaryInfo) {
    var result = "";
    result += "***<没钱赚商店>购物清单***\n";

    for(item in priceInfo){
        var information = '';
        information += "名称："+priceInfo[item].name + "，" + "数量：" + priceInfo[item].count + "" + priceInfo[item].unit + "，"
            + "单价：" + priceInfo[item].price.toFixed(2) + "" + "(元)，"
            + "小计：" + priceInfo[item].total.toFixed(2) + "" + "(元)" + "\n"
        result += information;

    }
    result += "----------------------\n";

    result += "挥泪赠送商品：\n";
    for(item in promotionInfo){
        var information = "";
        information += "名称：" + promotionInfo[item].name + "，"
            + "数量：" + promotionInfo[item].count + "" + promotionInfo[item].unit + "\n"
        result += information;
    }
    result += "----------------------\n";

    var sumInfo = "";
    sumInfo = "总计：" + summaryInfo[0].summary.toFixed(2) + "" + "(元)" + "\n"
        + "节省：" + summaryInfo[0].promotionSummary.toFixed(2) + "" + "(元)" + "\n";
    result += sumInfo;
    result += "**********************";
    return result;
}

module.exports = function printInventory(inputs) {
    //处理输入
    let input = handleInputs(inputs);
    //获取全部商品条目
    let items = fun.loadAllItems();
    //获取参与优惠商品的barcode
    let promotionBarcode = fun.loadPromotions()[0].barcodes;
    //根据商品信息计算商品总价
    let priceInfo = computePrice(input,items,promotionBarcode);
    //获取已优惠的商品信息
    let promotionInfo = getPromotioninfo(priceInfo);
    //获取总价金额以及优惠金额
    let summaryInfo = getSummaryinfo(priceInfo);
    //生成清单并打印
    let result = printResult(priceInfo, promotionInfo, summaryInfo);
    console.log(result);
};