// 请求的接口缓存
import BaseDataProvider from './base-data-provider';
// 判断是不是 array
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

// /rs/brand/supplier/get_search_suggestion.do
export class SupplierDataProvider {
    constructor(type) {
        this.searchType = type || '1'
        this.proxy = new BaseDataProvider('brand/supplier/get_search_suggestion', { method: 'GET' })
    }
    // 转化数据
    formater(res) {
        let ret = [];
        if (res.resultObject) {
            ret = res.resultObject.map(v => {
                return Object.assign({}, v, {
                    value: v.id,
                    label: v.name,
                })
            })
        }

        return ret
    }
    formaterRowData = (data) => {
        return data.map(v => {
            v._id = v.id;
            return v
        })
    }
    getData(valueObj = {}, showCount, success, error) {
        this.proxy.setOptions({
            keyword: valueObj.value,
            showCount: showCount || 10,
            searchType: this.searchType,
            veidoo: valueObj.veidoo,
        })
        this.proxy.getData(response => {
            if (response.status == 'success') {
                success({
                    list: this.formater(response),
                    data: this.formaterRowData(response.resultObject), // 原数据
                })
            } else {
                return []
            }
        }, err => {
            error(err)
        })
    }
}