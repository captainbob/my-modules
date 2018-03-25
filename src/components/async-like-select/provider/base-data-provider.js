import { HttpUtil } from 'djmodules-utils'

export default class BaseDataProvider {

    constructor(url, options) {
        this.url = url
        this.options = options
    }

    getData(success, error) {
        HttpUtil.ajax(this.url, this.options).then(response => {
            if (typeof success == 'function') {
                if (response.status == 'success') {
                    success(response)
                } else {
                    error(response.exceptionMessage || response.message)
                }
            }
        }).catch(err => {
            if (typeof error == 'function') {
                error(err)
            }
        })
    }
    //value : Object
    setOptions(value) {
        this.options = Object.assign({}, this.options, {
            data: value
        })
    }
}