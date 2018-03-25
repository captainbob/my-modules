// 请求的接口缓存
import BaseDataProvider from './base-data-provider';
// 判断是不是 array
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

// rs/goodsx/sspu/search_merchant_code
export class MerchantDataProvider {
    constructor() {
        this.proxy = new BaseDataProvider('goodsx/sspu/search_merchant_code', { method: 'GET' })
    }
    // 转化数据
    formater(results) {
        let ret = [];
        ret = results.map(v => {
            return Object.assign({}, v, {
                value: v.merchantCode,
                label: v.merchantCode,
                _value: v.value,
                _label: v.label
            })
        })

        return ret
    }
    formaterRowData = (data) => {
        return data.map(v => {
            v._id = v.brandSpuId;
            return v
        })
    }
    getData(valueObj = {}, showCount, success, error) {
        valueObj = Object.assign(valueObj, {
            brandId: window.currentBrandId,
            merchantCode: valueObj.value,
            showCount: 10,
            runCount: false,
        })
        this.proxy.setOptions(valueObj)
        this.proxy.getData(response => {
            if (response.status == 'success') {
                const results = response.resultObject || []
                success({
                    list: this.formater(results),
                    data: this.formaterRowData(results), // 原数据
                })
            } else {
                return []
            }
        }, err => {
            error(err)
        })
    }
}