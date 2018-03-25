// 请求的接口缓存
import BaseDataProvider from './base-data-provider';
// 判断是不是 array
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

// rs/brand/staffback/get_list
export class StaffDataProvider {
    constructor() {
        this.proxy = new BaseDataProvider('brand/staffback/get_list', { method: 'GET' })
    }
    // 转化数据
    formater(results) {
        let ret = [];
        ret = results.map(v => {
            return Object.assign({}, v, {
                value: v.staffId,
                label: v.name,
                _value: v.value,
                _label: v.label
            })
        })

        return ret
    }
    formaterRowData = (data) => {
        return data.map(v => {
            v._id = v.staffId;
            return v
        })
    }
    getData(valueObj = {}, showCount, success, error) {
        const roleId = window.userInfo.roleId;
        let isDianzhang
        //判断是不是店长
        if (roleId == 6 || roleId == 7) {
            isDianzhang = true;
        }
        valueObj = Object.assign({ veidoo: "mixData" }, valueObj, {
            brandId: window.currentBrandId,
            runCount: false,
            dakeyWord: valueObj.value,
            storageId: isDianzhang ? window.userInfo.storageId : undefined,
        })
        this.proxy.setOptions(valueObj)
        this.proxy.getData(response => {
            if (response.status == 'success') {
                const results = response.resultObject.results || []
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