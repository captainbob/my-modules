// 请求的接口缓存
import BaseDataProvider from './base-data-provider';
// 判断是不是 array
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

// /rs/brand/channel/get_list_by_query.do
export class ChannelDataProvider {
    constructor(type) {
        this.type = type || ''
        this.proxy = new BaseDataProvider('brand/channel/get_list_by_query', { method: 'GET' })
    }
    // 转化数据
    formater(res) {
        let ret = [];
        if (res.resultObject) {
            ret = res.resultObject.map(v => {
                return Object.assign({}, v, {
                    value: v.channelId,
                    label: v.channelName,
                    _value: v.value,
                    _label: v.label
                })
            })
        }

        return ret
    }
    formaterRowData = (data) => {
        return data.map(v => {
            v._id = v.channelId;
            return v
        })
    }
    getData(valueObj = {}, showCount, success, error) {
        this.proxy.setOptions({
            name: valueObj.value,
            showCount: showCount,
            type: this.type,
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