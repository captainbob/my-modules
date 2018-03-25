// 请求的接口缓存
import { DataProvider, BaseDataProvider, CachedBaseDataProvider } from 'djmodules-utils/lib'

// 判断是不是 array
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

export default class OrderSourceBasePropProvider extends DataProvider {
    constructor() {
        super()
        this.proxy = new BaseDataProvider('/rs/order/base/get_order_source_enum', { method: 'get', data: { brandId: window.currentBrandId } })
    }

    // 转化数据
    formater(res) {
        let ret = {};
        if (res.status == 'success') {
            ret['orderSource'] = res.resultObject.map(v => {
                return {
                    ...v,
                    text: v.value,
                    value: v.code,
                }
            })
        }
        return ret
    }

    getData(success, error) {
        this.proxy.getData(response => {
            success(this.formater(response))
        }, error => { })
    }
}