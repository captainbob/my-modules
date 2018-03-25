// 请求的接口缓存
import { DataProvider, BaseDataProvider, CachedBaseDataProvider } from 'djmodules-utils/lib'

// 判断是不是 array
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

// /rs/finance / tacticsType / get_tactics_type_list
export default class TacticBasePropProvider extends DataProvider {
    constructor() {
        super()
        this.proxy = new BaseDataProvider('finance/tacticsType/get_tactics_type_list', { method: 'POST', data: { brandId: window.currentBrandId } })
    }

    // 转化数据
    formater(res) {
        let ret = {};
        if (res.status == 'success') {
            ret['tacticType'] = res.resultObject.map(v => {
                return {
                    ...v,
                    text: v.name,
                    value: v.id,
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