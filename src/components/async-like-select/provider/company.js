// 请求的接口缓存
import BaseDataProvider from './base-data-provider';
// 判断是不是 array
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

// rs/goodsx/sspu/search_merchant_code
export class CompanysDataProvider {
    constructor() {
        this.proxy = new BaseDataProvider('sys/brand/get_search_suggestion', { method: 'GET' })
    }
    // 转化数据
    formater(results) {
        let ret = [];
        ret = results.map(v => {
            return Object.assign({}, v, {
                value: v.brandId,
                label: v.companyName,
                _value: v.value,
                _label: v.label
            })
        })

        return ret
    }
    formaterRowData = (data) => {
        return data.map(v => {
            v._id = v.brandId;
            return v
        })
    }
    getData(valueObj = {}, showCount, success, error) {
        valueObj = Object.assign(valueObj, {
            searchType: 3,
            keyword: valueObj.value,
            showCount: 10,
        })
        this.proxy.setOptions(valueObj)
        this.proxy.getData(response => {
            if (response.status == 'success') {
                // const results = (response.resultObject || {}).results || []
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