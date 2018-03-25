// 请求的接口缓存
import { DataProvider, BaseDataProvider, CachedBaseDataProvider } from 'djmodules-utils/lib'

// 判断是不是 array
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

///rs/brand/channel/get_channel_type_list
export default class ChannelBasePropProvider extends DataProvider {
    constructor() {
        super()
        this.proxy = new BaseDataProvider('brand/channel/get_channel_type_list', { method: 'GET' })
    }

    // 转化数据
    formater(res) {
        let ret = {};
        if (res.status == 'success') {
            ret['channelType'] = res.resultObject.map(v => {
                return {
                    text: v.value,
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