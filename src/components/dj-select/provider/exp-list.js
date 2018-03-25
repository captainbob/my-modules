// 请求的接口缓存
import { DataProvider, BaseDataProvider, CachedBaseDataProvider } from 'djmodules-utils/lib'

// 判断是不是 array
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

// /rs/finance / tacticsType / get_tactics_type_list
export default class ExpBasePropProvider extends DataProvider {
    constructor() {
        super()
        this.proxy = new BaseDataProvider('/rs/sys/exp/get_list', { method: 'get', data: { brandId: window.currentBrandId } })
    }

    // 转化数据
    formater(res) {
        let ret = {};
        if (res.status == 'success') {
            ret['expList'] = res.resultObject.map(v => {
                return {
                    ...v,
                    text: v.expressName,
                    value: v.expressCode,
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