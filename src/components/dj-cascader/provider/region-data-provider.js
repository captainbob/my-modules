// 请求的接口缓存
import { DataProvider, BaseDataProvider, CachedBaseDataProvider } from 'djmodules-utils/lib'

// 判断是不是 array
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

export class RegionDataProviderToCity extends DataProvider {
    constructor() {
        super();
        this.dataProvider = new BaseDataProvider('sys/dict/get_region_list', {
            method: 'get',
            data: {
                parentCode: '1'
            }
        });
    }

    formater = (data, type) => {
        let ret = [];
        ret = ret.concat(data.map(v => {
            let cascaderData;
            cascaderData = Object.assign({}, v, {
                value: v.standardCode,
                label: v.comments,
                isLeaf: false,
                regionType: 'province'
            });
            return cascaderData
        }))
        return ret
    }

    formaterFromProvinceToCity = (data, prevLevelType) => {
        let ret = [];
        ret = ret.concat(data.map(v => {
            let cascaderData;
            cascaderData = Object.assign({}, v, {
                value: v.standardCode,
                label: v.comments,
                isLeaf: prevLevelType == 'province' ? true : false,
                regionType: 'city'
            });
            return cascaderData
        }))
        return ret
    }

    getData = (success, error) => {
        this.dataProvider.getData(response => {
            success(this.formater(response.resultObject))
        }, error => { })
    }
    loadData = (targetOption, success) => {
        this.dataProvider.options = {
            method: 'get',
            data: {
                parentCode: targetOption.value
            }
        }
        this.dataProvider.getData(response => {
            success(this.formaterFromProvinceToCity(response.resultObject, targetOption.regionType))
        }, error => { })

    }
}

export class RegionDataProviderToArea extends DataProvider {
    constructor() {
        super();
        this.dataProvider = new BaseDataProvider('sys/dict/get_region_list', {
            method: 'get',
            data: {
                parentCode: '1'
            }
        });
    }

    formater = (data, type) => {
        let ret = [];
        ret = ret.concat(data.map(v => {
            let cascaderData;
            cascaderData = Object.assign({}, v, {
                value: v.standardCode,
                label: v.comments,
                isLeaf: false,
                regionType: 'province'
            });
            return cascaderData
        }))
        return ret
    }

    formaterFromProvinceToArea = (data, prevLevelType) => {
        let ret = [];
        ret = ret.concat(data.map(v => {
            let cascaderData;
            cascaderData = Object.assign({}, v, {
                value: v.standardCode,
                label: v.comments,
                isLeaf: prevLevelType == 'city' ? true : false,
                regionType: prevLevelType == 'city' ? 'area' : 'city'
            });
            return cascaderData
        }))
        return ret
    }
    getData = (success, error) => {
        this.dataProvider.getData(response => {
            success(this.formater(response.resultObject))
        }, error => { })
    }
    loadData = (targetOption, success) => {
        this.dataProvider.options = {
            method: 'get',
            data: {
                parentCode: targetOption.value
            }
        }
        this.dataProvider.getData(response => {
            success(this.formaterFromProvinceToArea(response.resultObject, targetOption.regionType))
        }, error => { })

    }
}
