// 请求的接口缓存
import { DataProvider, BaseDataProvider, CachedBaseDataProvider } from 'djmodules-utils/lib'

// 判断是不是 array
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

export default class CatTreeDataProvider extends DataProvider {
    constructor() {
        super();
        this.dataProvider = new BaseDataProvider('goodsx/scustomcat/get_tree', {
            method: 'get',
        });
    }

    formatTreeData = (data) => {
        if (!data.children) {
            return null
        }
        return data.children.map(v => ({
            value: v.id,
            label: v.name,
            source: v.sourceObj,
            children: this.formatTreeData(v)
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