// 请求的接口缓存
import { DataProvider, BaseDataProvider, CachedBaseDataProvider } from 'djmodules-utils/lib'

// 判断是不是 array
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

// rs/goodsx/sbaseprop/get_prop_value_map.do
export class GoodsBasePropProvider extends DataProvider {
    constructor() {
        super()
        this.proxy = new BaseDataProvider('goodsx/sbaseprop/get_prop_value_map', { method: 'GET' })
    }
    // 转化基础信息的数据格式
    mapToOptionValue(props) {
        if (isArray(props)) {
            return props.map(v => ({
                text: v.basePropValueName,
                value: v.basePropValueCode
            }))
        }
        return props
    }
    // 转化数据
    formater(res) {
        let ret = {};
        if (res.status == 'success') {
            for (let value in res.resultObject) {
                ret[value] = this.mapToOptionValue(res.resultObject[value])
            }
        }
        return ret
    }
    getData(success, error) {
        this.proxy.getData(response => {
            success(this.formater(response))
        }, error => { })
    }
}

export class ChildBrandListProvider extends DataProvider {
    constructor() {
        super()
        this.proxy = new BaseDataProvider('brand/child/get_child_list', { method: 'GET', data: { brandId: window.currentBrandId } })
    }

    formater(res) {
        let ret = {};
        if (res.status == 'success') {
            ret['childBrand'] = res.resultObject.map(v => ({
                text: v.childBrandCname,
                value: v.childBrandId
            }))
        }
        return ret
    }

    getData(success, error) {
        this.proxy.getData(response => {
            success(this.formater(response))
        }, error => { })
    }
}

//门店等级 
///rs/brand/grade/get_list
export class StorageGradeProvider extends DataProvider {
    constructor() {
        super()
        this.proxy = new BaseDataProvider('brand/grade/get_list', {
            method: 'GET',
            data: {
                brandId: window.currentBrandId
            }
        })
    }

    formater(res) {
        let ret = {};
        if (res.status == 'success') {
            ret['storageGrade'] = res.resultObject.map(v => ({
                text: v.name,
                value: v.id
            }))
        }
        return ret
    }

    getData(success, error) {
        this.proxy.getData(response => {
            success(this.formater(response))
        }, error => { })
    }
}

