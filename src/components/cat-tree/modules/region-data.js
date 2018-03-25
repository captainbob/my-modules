// 请求的接口缓存
import { DataProvider, BaseDataProvider, CachedBaseDataProvider } from 'djmodules-utils/lib'

// 判断是不是 array
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

// brand/area/get_tree
export default class RegionDataProvider extends DataProvider {
    // 维护一份所有数据
    allData = {}
    constructor() {
        super()
        this.proxy = new BaseDataProvider('brand/area/get_tree', {
            method: 'GET',
            data: {
                brandId: window.currentBrandId,
                veidoo: "areaData"
            }
        })
    }

    formaterChildCats = (data) => {
        if (data == null || data == undefined) {
            return undefined
        }
        this.allData[data.id] = data;
        return {
            value: data.id,
            label: data.name,
            key: data.id,
            children: data.children && data.children.map(v => this.formaterChildCats(v))
        }
    }
    // 转化数据
    formater(res) {
        let retArr = [];
        if (res.status == 'success') {
            let children = res.resultObject.children || []
            retArr = children.map(v => {
                return this.formaterChildCats(v)
            })
        }
        return retArr
    }
    getData(success, error) {
        this.proxy.getData(response => {
            const list = this.formater(response);
            success({
                list,
                allData: this.allData
            })
        }, (err) => {
            message.success(message.error(err.exceptionMessage || err.message || '请求错误'))
        })
    }
}