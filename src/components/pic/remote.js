import React, { Component } from 'react';
import { HttpUtil } from 'djmodules-utils'

const Remote = {
    //获取图片类目
    getCatalogList: function () {
        let _this = this;
        return new Promise(function (resolve, reject) {
            HttpUtil.promiseGet("/rs/pic/base/get_catalog.do", {
                brandId: currentBrandId,
                type: 0
            }).then((json) => {
                resolve(json)
            }).catch(e => {
                reject(e)
            });
        })
    },
    //查询图片列表
    getPicList: function (data) {
        let _this = this;
        return new Promise(function (resolve, reject) {
            HttpUtil.promisePost("/rs/pic/base/get_query.do", data).then((json) => {
                resolve(json)
            }).catch(e => {
                reject(e)
            });
        })
    },
    //确认添加图片
    addPicSure: function (data) {
        return new Promise(function (resolve, reject) {
            HttpUtil.promisePost("/rs/pic/base/upload_sure.do", data).then((json) => {
                resolve(json)
            }).catch(e => {
                reject(e)
            });
        });
    },
    //确认添加图片For表单
    addPicSureForm: function (data) {
        return new Promise(function (resolve, reject) {
            HttpUtil.promisePost("/rs/pic/base/upload_sures_form.do", data).then((json) => {
                resolve(json)
            }).catch(e => {
                reject(e)
            });
        });
    },
    //签名
    signature: function () {
        return new Promise(function (resolve, reject) {
            HttpUtil.promisePost("/rs/pic/base/signature.do").then((json) => {
                resolve(json)
            }).catch(e => {
                reject(e)
            });
        });
    },
    //删除
    batchDel: function (data) {
        return new Promise(function (resolve, reject) {
            HttpUtil.promisePost("/rs/pic/base/batch_del.do", data).then((json) => {
                resolve(json)
            }).catch(e => {
                reject(e)
            });
        });
    }
}
export default Remote;
