// 请求的接口缓存
import { DataProvider, BaseDataProvider, CachedBaseDataProvider } from 'djmodules-utils/lib'

// 判断是不是 array
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

///rs/brand/channel/get_channel_type_list
export default class YearSeasonDataProvider extends DataProvider {
    // 维护一份所有数据
    allData = {}
    constructor() {
        super()
        this.proxy = new BaseDataProvider('goodsx/sbaseprop/get_prop_value_map', { method: 'GET' })

    }

    // 转化数据
    formater(res) {
        let retArr = [];
        if (res.status == 'success') {
            let year = res.resultObject.year || []
            retArr = year.map((v, i) => {
                this.allData[v.basePropValueCode] = v;
                return {
                    value: v.basePropValueCode,
                    label: v.basePropValueName,
                    key: String(i),
                    children: res.resultObject.season.map((item, index) => {
                        this.allData[v.basePropValueCode + '-' + item.basePropValueCode] = {
                            "year": v,
                            "season": item
                        };
                        return {
                            value: v.basePropValueCode + '-' + item.basePropValueCode,
                            label: item.basePropValueName,
                            key: String(i) + '-' + String(index)
                        }
                    })
                }
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
        }, error => { })
    }
}