// 请求的接口缓存
import { DataProvider, BaseDataProvider, CachedBaseDataProvider } from 'djmodules-utils/lib'

// 判断是不是 array
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

export class AreaDataProvider extends DataProvider {
    constructor() {
        super();
        this.dataProvider = new BaseDataProvider('brand/area/get_tree', {
            method: 'get',
            data: {
                brandId: window.currentBrandId || '1'
            }
        });
    }
    mapToCascader = (data) => {
        return Object.assign({}, data, {
            value: data.id,
            label: data.name
        })
    }
    formater = (data) => {
        const initialData = {
            value: '',
            label: '全部'
        }
        let ret = [initialData];
        ret = ret.concat(data.map(v => {
            let cascaderData;
            cascaderData = this.mapToCascader(v.areaAtom);
            cascaderData.children = [initialData]
            if (v.childAreaList) {
                cascaderData.children = cascaderData.children.concat(v.childAreaList.map(childItem => this.mapToCascader(childItem)));
            }
            return cascaderData
        }))
        return ret
    }

    getData = (success, error) => {
        this.dataProvider.getData(response => {
            success(this.formater(response.resultObject))
        }, error => { })
    }

}