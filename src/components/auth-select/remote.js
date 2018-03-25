// 请求的接口缓存
import { DataProvider, BaseDataProvider, CachedBaseDataProvider } from 'djmodules-utils/lib'

class RoleBasePropProvider extends DataProvider {
    constructor(veidoo) {
        super()
        this.proxy = new BaseDataProvider('brand/purview/get_brand_all_role', { method: 'GET', data: { veidoo: veidoo } })
    }

    getData(success, error) {
        this.proxy.getData(response => {
            success(response)
        }, error => { })
    }
}

class DeptBasePropProvider extends DataProvider {

    constructor(parentId, veidoo) {
        super()
        this.proxy = new BaseDataProvider('brand/department/get_department_tree',
            { method: 'GET', data: { parentId: parentId, veidoo: veidoo } })
    }

    getData(success, error) {
        this.proxy.getData(response => {
            success(response)
        }, error => { })
    }
}


module.exports = { RoleBasePropProvider, DeptBasePropProvider }