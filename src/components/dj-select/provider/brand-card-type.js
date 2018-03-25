// 请求的接口缓存
import { DataProvider, BaseDataProvider, CachedBaseDataProvider } from 'djmodules-utils/lib'

// 判断是不是 array
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

// rs/paygateway/enumConstQuery/getBankCardTypeVO
export default class BrandCardBasePropProvider extends DataProvider {
    constructor() {
        super()
        this.proxy = new BaseDataProvider('paygateway/enumConstQuery/getBankCardTypeVO', { method: 'POST' })
    }

    // 转化数据
    formater(res) {
        let ret = {};
        if (res.status == 'success') {
            ret['brandCardType'] = res.resultObject.map(v => {
                return {
                    ...v,
                    text: v.desc,
                    value: v.code
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