// 请求的接口缓存
import BaseDataProvider from './base-data-provider';
// 判断是不是 array
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

export class CndBaseDataProvider {
    /**
     * queryType []int{2,3,4,5}
     * storageType: 店仓 []int{1,2}
     */
    constructor(queryType, storageType) {
        this.proxy = new BaseDataProvider('brand/base/cnd_query', { method: 'GET' })
        this.queryType = queryType;
        this.storageType = storageType || '';
    }
    // 转化数据
    formater = (data) => {
        switch (Number(this.queryType)) {
            case 2:
            case 3:
                return data.map((v, i) => {
                    return Object.assign({}, v, {
                        value: v.id,
                        label: v.name,
                        key: i,
                    })
                });
            case 4:
                return data.map((v, i) => {
                    return Object.assign({}, v, {
                        value: v.storageId,
                        label: v.name,
                        key: i,
                    })
                })
            case 5:
                return data.map((v, i) => {
                    return Object.assign({}, v, {
                        value: v.channelId,
                        label: v.channelName,
                        key: i,
                    })
                })
            default:
                return data
        }
    }
    /**
     * 
     * @param {*} value 
     * @param {*} showCount 
     * @param {*} success 
     * @param {*} error
     * storageType {
     *   '': 全部
     *   1: 店
     *   2：仓
     * }
     * queryType {
     *  2：大区
     *  3：小区
     *  4: 店仓
     *  5：渠道
     * }
     */
    formaterRowData = (data) => {
        switch (Number(this.queryType)) {
            case 2:
            case 3:
                return data.map((v, i) => {
                    v._id = v.id
                    return v
                });
            case 4:
                return data.map((v, i) => {
                    v._id = v.storageId
                    return v
                })
            case 5:
                return data.map((v, i) => {
                    v._id = v.channelId
                    return v
                })
            default:
                return data
        }
    }
    getData(valueObj = {}, showCount, success, error) {
        this.proxy.setOptions({
            brandId: window.currentBrandId,
            queryType: this.queryType,
            storageType: this.storageType,
            keyWords: valueObj.value,
            veidoo: valueObj.veidoo,
            showCount: 10,
        })
        this.proxy.getData(response => {
            if (response.status == 'success') {
                success({
                    list: this.formater(response.resultObject),
                    data: this.formaterRowData(response.resultObject),// 原数据
                })
            } else {
                return []
            }
        }, err => {
            error(err)
        })
    }
}