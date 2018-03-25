// 请求的接口缓存
import { DataProvider, BaseDataProvider, CachedBaseDataProvider } from 'djmodules-utils/lib'

// 判断是不是 array
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

export default class ChannelTreeProvider extends DataProvider {
    constructor() {
        super();
        this.dataProvider = new BaseDataProvider('brand/channel/get_all_channel_type_list', {
            method: 'get',
        });
    }

    formatTreeData = (data) => {
        if (!isArray(data)) return null;
        return data.map(v => ({
            value: v.code,
            label: v.value,
            children: this.formatTreeData(v.secondLevelList)
        }))
    }
    formater = (data) => {
        let ret = [];
        ret = this.formatTreeData(data);
        return ret
    }

    getData = (success, error) => {
        this.dataProvider.getData(response => {
            success(this.formater(response.resultObject))
        }, error => { })
    }

}